import { supabase } from '@/integrations/supabase/client';

const FAILED_TABLES_KEY = 'failed_supabase_tables';
const MASTER_OFFLINE_KEY = 'supabase_master_offline';

let failedTables = new Set<string>(JSON.parse(localStorage.getItem(FAILED_TABLES_KEY) || '[]'));
let isMasterOffline = localStorage.getItem(MASTER_OFFLINE_KEY) === 'true';

function updateFailedTables() {
  localStorage.setItem(FAILED_TABLES_KEY, JSON.stringify(Array.from(failedTables)));
}

export const storage = {
  isOffline() {
    return isMasterOffline;
  },

  async get(table: string, userId: string) {
    const localData = localStorage.getItem(`${table}_${userId}`);
    if (localData) return JSON.parse(localData);

    // Hard bypass: If offline or table is known to be missing, return empty immediately
    if (isMasterOffline || failedTables.has(table)) return [];

    try {
      const { data, error, status } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status === 404 || status === 401) {
        failedTables.add(table);
        updateFailedTables();
        return [];
      }
      
      if (error) throw error;
      
      if (data) {
        localStorage.setItem(`${table}_${userId}`, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      failedTables.add(table);
      updateFailedTables();
    }
    return [];
  },

  async insert(table: string, userId: string, item: any) {
    const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    const newItem = { 
      ...item, 
      id: item.id || Math.random().toString(36).substr(2, 9),
      user_id: userId, 
      created_at: new Date().toISOString() 
    };
    
    const updatedData = [newItem, ...localData];
    localStorage.setItem(`${table}_${userId}`, JSON.stringify(updatedData));
    
    // Only attempt network if not in hard-bypass mode
    if (!isMasterOffline && !failedTables.has(table)) {
      supabase.from(table).insert([newItem]).then(({ status }) => {
        if (status === 404 || status === 401) {
          failedTables.add(table);
          updateFailedTables();
        }
      }).catch(() => {
        failedTables.add(table);
        updateFailedTables();
      });
    }

    return newItem;
  },

  async update(table: string, userId: string, id: any, updates: any) {
    const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    const updatedData = localData.map((item: any) => 
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    );
    localStorage.setItem(`${table}_${userId}`, JSON.stringify(updatedData));
    
    if (!isMasterOffline && !failedTables.has(table)) {
      supabase.from(table).update(updates).eq('id', id).then(({ status }) => {
        if (status === 404 || status === 401) {
          failedTables.add(table);
          updateFailedTables();
        }
      }).catch(() => {
        failedTables.add(table);
        updateFailedTables();
      });
    }

    return updates;
  },

  async delete(table: string, userId: string, id: any) {
    const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    const filteredData = localData.filter((item: any) => item.id !== id);
    localStorage.setItem(`${table}_${userId}`, JSON.stringify(filteredData));
    
    if (!isMasterOffline && !failedTables.has(table)) {
      supabase.from(table).delete().eq('id', id).then(({ status }) => {
        if (status === 404 || status === 401) {
          failedTables.add(table);
          updateFailedTables();
        }
      }).catch(() => {
        failedTables.add(table);
        updateFailedTables();
      });
    }
  },

  setMasterOffline(status: boolean) {
    isMasterOffline = status;
    localStorage.setItem(MASTER_OFFLINE_KEY, String(status));
  },

  async syncToCloud(table: string, userId: string) {
    const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    if (localData.length === 0) return { success: false, message: "No local data to sync." };

    try {
      const { error, status } = await supabase
        .from(table)
        .upsert(localData.map(item => ({ ...item, user_id: userId })));
      
      if (status === 404 || status === 401) {
        failedTables.add(table);
        updateFailedTables();
        return { success: false, message: "Cloud sync unavailable (Table missing)." };
      }

      if (error) throw error;
      return { success: true, message: "Cloud sync complete." };
    } catch (err: any) {
      return { success: false, message: "Sync failed. Check connection." };
    }
  }
};