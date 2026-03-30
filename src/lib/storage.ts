import { supabase } from '@/integrations/supabase/client';

const SYNC_QUEUE_KEY = 'arnab_sync_queue';
let masterOffline = false;

interface SyncItem {
  id: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
  retryCount?: number;
}

/**
 * Strict UUID validation to prevent "invalid input syntax for type uuid" errors.
 */
const isUUID = (str: any): boolean => {
  if (typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Robust UUID generator for offline support.
 */
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const storage = {
  isOffline() {
    return !navigator.onLine || masterOffline;
  },

  async get(table: string, userId: string) {
    const localKey = `${table}_${userId}`;
    const localData = localStorage.getItem(localKey);
    let data = localData ? JSON.parse(localData) : [];

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
        console.warn(`Cloud fetch failed for ${table}, using local cache.`);
      }
    }
    return data;
  },

  async insert(table: string, userId: string, item: any) {
    // CRITICAL FIX: Ensure ID is NEVER an empty string or invalid UUID
    const validId = (item.id && isUUID(item.id)) ? item.id : generateUUID();

    const newItem = { 
      ...item, 
      id: validId,
      [table === 'profiles' ? 'id' : 'user_id']: userId, 
      created_at: item.created_at || new Date().toISOString() 
    };
    
    const localKey = `${table}_${userId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify([newItem, ...localData]));
    
    if (isUUID(userId)) {
      // Sanitize data before adding to sync queue
      const syncData = { ...newItem };
      this.addToSyncQueue({ id: validId, table, action: 'INSERT', data: syncData, timestamp: Date.now() });
    }
    return newItem;
  },

  async update(table: string, userId: string, id: string, updates: any) {
    if (!isUUID(id)) {
      console.error("Cannot update record with invalid UUID:", id);
      return updates;
    }

    const localKey = `${table}_${userId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    const updatedData = localData.map((item: any) => 
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    );
    localStorage.setItem(localKey, JSON.stringify(updatedData));
    
    if (isUUID(userId)) {
      // Ensure we don't send an empty ID in the updates payload
      const { id: _, ...sanitizedUpdates } = updates;
      this.addToSyncQueue({ id, table, action: 'UPDATE', data: sanitizedUpdates, timestamp: Date.now() });
    }
    return updates;
  },

  async delete(table: string, userId: string, id: string) {
    const localKey = `${table}_${userId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify(localData.filter((i: any) => i.id !== id)));
    
    if (isUUID(userId) && isUUID(id)) {
      this.addToSyncQueue({ id, table, action: 'DELETE', data: null, timestamp: Date.now() });
    }
  },

  addToSyncQueue(item: SyncItem) {
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([...queue, item]));
    this.processSyncQueue();
  },

  async processSyncQueue() {
    if (!navigator.onLine || masterOffline) return;
    
    const queue: SyncItem[] = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    const updatedQueue = [...queue];
    let hasChanges = false;

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      
      // Final safety check: Ensure the ID is a valid UUID before sending to Supabase
      if (!isUUID(item.id)) {
        console.warn(`Neural Recovery: Skipping item with invalid UUID: ${item.id}`);
        updatedQueue.splice(i, 1);
        i--;
        hasChanges = true;
        continue;
      }

      try {
        let error;
        if (item.action === 'INSERT') {
          ({ error } = await supabase.from(item.table).upsert([item.data]));
        } else if (item.action === 'UPDATE') {
          ({ error } = await supabase.from(item.table).update(item.data).eq('id', item.id));
        } else if (item.action === 'DELETE') {
          ({ error } = await supabase.from(item.table).delete().eq('id', item.id));
        }

        if (!error) {
          updatedQueue.splice(i, 1);
          i--;
          hasChanges = true;
        } else {
          console.error(`Sync error for ${item.table}:`, error.message);
          
          // AUTO-RECOVERY: Detect missing column from error message and strip it
          const match = error.message.match(/column ['"](.+?)['"]/i);
          const columnName = match ? match[1] : null;
          
          if (columnName && item.data[columnName] !== undefined) {
            console.warn(`Neural Recovery: Stripping missing column '${columnName}' from ${item.table} payload.`);
            const { [columnName]: _, ...sanitizedData } = item.data;
            
            updatedQueue[i] = { ...item, data: sanitizedData, retryCount: (item.retryCount || 0) + 1 };
            hasChanges = true;
            
            if ((item.retryCount || 0) > 15) {
              updatedQueue.splice(i, 1);
              i--;
            }
            continue; 
          }
          break; 
        }
      } catch (e) {
        break; 
      }
    }

    if (hasChanges) {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
    }
  }
};

window.addEventListener('online', () => storage.processSyncQueue());