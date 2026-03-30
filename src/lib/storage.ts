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

const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper to generate a valid UUID if crypto.randomUUID is available, 
// otherwise fallback to a compliant manual generator
const generateUUID = () => {
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
    // Ensure we use a valid UUID for the ID
    const newItem = { 
      ...item, 
      id: item.id && isUUID(item.id) ? item.id : generateUUID(),
      [table === 'profiles' ? 'id' : 'user_id']: userId, 
      created_at: item.created_at || new Date().toISOString() 
    };
    
    const localKey = `${table}_${userId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify([newItem, ...localData]));
    
    if (isUUID(userId)) {
      this.addToSyncQueue({ id: newItem.id, table, action: 'INSERT', data: newItem, timestamp: Date.now() });
    }
    return newItem;
  },

  async update(table: string, userId: string, id: string, updates: any) {
    const localKey = `${table}_${userId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    const updatedData = localData.map((item: any) => 
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    );
    localStorage.setItem(localKey, JSON.stringify(updatedData));
    
    if (isUUID(userId) && isUUID(id)) {
      this.addToSyncQueue({ id, table, action: 'UPDATE', data: updates, timestamp: Date.now() });
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

    for (const item of queue) {
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
          const currentQueue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
          localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(currentQueue.filter((q: any) => q.timestamp !== item.timestamp)));
        } else {
          console.error(`Sync error for ${item.table}:`, error.message);
          // If it's a 400 error, it might be bad data in the queue, we might need to skip it 
          // but for now we'll just stop processing to avoid infinite loops
          break;
        }
      } catch (e) {
        break; 
      }
    }
  }
};

window.addEventListener('online', () => storage.processSyncQueue());