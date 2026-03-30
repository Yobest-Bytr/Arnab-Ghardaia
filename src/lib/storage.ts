import { supabase } from '@/integrations/supabase/client';

const SYNC_QUEUE_KEY = 'arnab_sync_queue';

interface SyncItem {
  id: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
}

export const storage = {
  isOffline() {
    return !navigator.onLine;
  },

  async get(table: string, userId: string) {
    const localData = localStorage.getItem(`${table}_${userId}`);
    let data = localData ? JSON.parse(localData) : [];

    if (navigator.onLine) {
      try {
        const { data: cloudData, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (!error && cloudData) {
          localStorage.setItem(`${table}_${userId}`, JSON.stringify(cloudData));
          data = cloudData;
        }
      } catch (e) {
        console.warn("Cloud fetch failed, using local cache.");
      }
    }
    return data;
  },

  async insert(table: string, userId: string, item: any) {
    const newItem = { 
      ...item, 
      id: item.id || Math.random().toString(36).substr(2, 9),
      user_id: userId, 
      created_at: new Date().toISOString() 
    };
    
    const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    localStorage.setItem(`${table}_${userId}`, JSON.stringify([newItem, ...localData]));
    
    this.addToSyncQueue({ id: newItem.id, table, action: 'INSERT', data: newItem, timestamp: Date.now() });
    return newItem;
  },

  async update(table: string, userId: string, id: string, updates: any) {
    const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    const updatedData = localData.map((item: any) => 
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    );
    localStorage.setItem(`${table}_${userId}`, JSON.stringify(updatedData));
    
    this.addToSyncQueue({ id, table, action: 'UPDATE', data: updates, timestamp: Date.now() });
    return updates;
  },

  async delete(table: string, userId: string, id: string) {
    const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    localStorage.setItem(`${table}_${userId}`, JSON.stringify(localData.filter((i: any) => i.id !== id)));
    
    this.addToSyncQueue({ id, table, action: 'DELETE', data: null, timestamp: Date.now() });
  },

  addToSyncQueue(item: SyncItem) {
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([...queue, item]));
    this.processSyncQueue();
  },

  async processSyncQueue() {
    if (!navigator.onLine) return;
    
    const queue: SyncItem[] = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    for (const item of queue) {
      try {
        let error;
        if (item.action === 'INSERT') {
          ({ error } = await supabase.from(item.table).insert([item.data]));
        } else if (item.action === 'UPDATE') {
          ({ error } = await supabase.from(item.table).update(item.data).eq('id', item.id));
        } else if (item.action === 'DELETE') {
          ({ error } = await supabase.from(item.table).delete().eq('id', item.id));
        }

        if (!error) {
          const currentQueue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
          localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(currentQueue.filter((q: any) => q.timestamp !== item.timestamp)));
        }
      } catch (e) {
        break; // Stop processing if cloud is unreachable
      }
    }
  }
};

// Auto-sync when coming back online
window.addEventListener('online', () => storage.processSyncQueue());