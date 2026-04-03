import { supabase } from '@/integrations/supabase/client';

const SYNC_QUEUE_KEY = 'arnab_sync_queue';
let masterOffline = false;

interface SyncItem {
  id: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
}

/**
 * Validates if a string is a proper UUID.
 * This prevents "invalid input syntax for type uuid" errors in Supabase.
 */
const isUUID = (str: any): boolean => {
  if (typeof str !== 'string' || !str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Aggressive sanitization to fix 400 Bad Request errors.
 * Ensures numeric fields are numbers, dates are null if empty, and JSONB is valid.
 */
const sanitizePayload = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    if (obj === "") return null;
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizePayload);
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      let value = obj[key];
      
      // 1. Handle empty strings for specific types
      if (value === "") {
        if (key.includes('date') || key.includes('price') || key === 'weight' || key.includes('count') || key.includes('kits')) {
          sanitized[key] = null;
        } else {
          sanitized[key] = "";
        }
      } 
      // 2. Ensure numeric fields are actually numbers
      else if (key.includes('price') || key === 'weight' || key.includes('count') || key.includes('kits')) {
        const num = parseFloat(value);
        sanitized[key] = isNaN(num) ? 0 : num;
      }
      // 3. Ensure JSONB fields are valid arrays
      else if (key === 'weight_history') {
        sanitized[key] = Array.isArray(value) ? value : [];
      }
      // 4. Ensure user_id is never sent if it's not a UUID
      else if (key === 'user_id' || key === 'id') {
        if (isUUID(value)) {
          sanitized[key] = value;
        } else if (key === 'id') {
          sanitized[key] = generateUUID(); // Force a valid UUID for the record ID
        } else {
          // If user_id is invalid, we shouldn't even be syncing, but we'll null it to avoid 400
          sanitized[key] = null;
        }
      }
      else {
        sanitized[key] = sanitizePayload(value);
      }
    }
  }
  return sanitized;
};

export const storage = {
  async get(table: string, userId: string) {
    const localKey = `${table}_${userId}`;
    const localData = localStorage.getItem(localKey);
    let data = localData ? JSON.parse(localData) : [];

    // Only attempt cloud fetch if userId is a valid UUID
    if (navigator.onLine && !masterOffline && isUUID(userId)) {
      try {
        const { data: cloudData, error } = await supabase
          .from(table)
          .select('*')
          .eq(table === 'profiles' ? 'id' : 'user_id', userId)
          .order('created_at', { ascending: false });
        
        if (!error && cloudData) {
          localStorage.setItem(localKey, JSON.stringify(cloudData));
          data = cloudData;
        }
      } catch (e) {
        console.warn(`Cloud fetch failed for ${table}`);
      }
    }
    return data;
  },

  async insert(table: string, userId: string, item: any) {
    const validId = item.id && isUUID(item.id) ? item.id : generateUUID();
    const newItem = { 
      ...item, 
      id: validId,
      [table === 'profiles' ? 'id' : 'user_id']: userId, 
      created_at: item.created_at || new Date().toISOString() 
    };
    
    const sanitizedItem = sanitizePayload(newItem);
    const localKey = `${table}_${userId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify([sanitizedItem, ...localData]));
    
    // CRITICAL: Only add to sync queue if userId is a valid UUID
    if (isUUID(userId)) {
      this.addToSyncQueue({ id: validId, table, action: 'INSERT', data: sanitizedItem, timestamp: Date.now() });
    }
    return sanitizedItem;
  },

  async update(table: string, userId: string, id: string, updates: any) {
    const sanitizedUpdates = sanitizePayload(updates);
    const localKey = `${table}_${userId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    const updatedData = localData.map((item: any) => 
      item.id === id ? { ...item, ...sanitizedUpdates, updated_at: new Date().toISOString() } : item
    );
    localStorage.setItem(localKey, JSON.stringify(updatedData));
    
    // CRITICAL: Only add to sync queue if userId is a valid UUID
    if (isUUID(userId)) {
      this.addToSyncQueue({ id, table, action: 'UPDATE', data: sanitizedUpdates, timestamp: Date.now() });
    }
    return sanitizedUpdates;
  },

  async delete(table: string, userId: string, id: string) {
    const localKey = `${table}_${userId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify(localData.filter((i: any) => i.id !== id)));
    
    if (isUUID(userId)) {
      this.addToSyncQueue({ id, table, action: 'DELETE', data: null, timestamp: Date.now() });
    }
  },

  addToSyncQueue(item: SyncItem) {
    // Double check UUID before queueing
    if (item.data && item.data.user_id && !isUUID(item.data.user_id)) return;
    
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([...queue, item]));
    this.processSyncQueue().catch(err => console.warn("Sync background error:", err));
  },

  async processSyncQueue() {
    if (!navigator.onLine || masterOffline) return;
    const queue: SyncItem[] = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    const updatedQueue = [...queue];
    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      
      // Skip items with invalid UUIDs to prevent blocking the queue
      if (item.data && item.data.user_id && !isUUID(item.data.user_id)) {
        updatedQueue.splice(i, 1);
        i--;
        continue;
      }

      try {
        let error;
        if (item.action === 'INSERT') ({ error } = await supabase.from(item.table).upsert([item.data]));
        else if (item.action === 'UPDATE') ({ error } = await supabase.from(item.table).update(item.data).eq('id', item.id));
        else if (item.action === 'DELETE') ({ error } = await supabase.from(item.table).delete().eq('id', item.id));

        if (!error || error.code === 'PGRST116') {
          updatedQueue.splice(i, 1);
          i--;
        } else {
          // If it's a data type error (400), skip it so it doesn't block the queue forever
          if (error.code === '22P02' || error.code === '23502' || error.code === '42P01') {
            updatedQueue.splice(i, 1);
            i--;
          } else {
            break; 
          }
        }
      } catch (e) { 
        break; 
      }
    }
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
  }
};

window.addEventListener('online', () => storage.processSyncQueue());