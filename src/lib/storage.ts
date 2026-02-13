import { supabase } from '@/integrations/supabase/client';

// Track failed tables to avoid repeated 404s
const failedTables = new Set<string>();

export const storage = {
  async get(table: string, userId: string) {
    const localData = localStorage.getItem(`${table}_${userId}`);
    if (localData) return JSON.parse(localData);
    
    if (failedTables.has(table)) return [];

    try {
      const { data, error, status } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (status === 404) {
        failedTables.add(table);
        return [];
      }

      if (!error && data) {
        localStorage.setItem(`${table}_${userId}`, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      failedTables.add(table);
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
    
    if (!failedTables.has(table)) {
      supabase.from(table).insert([newItem]).then(({ status }) => {
        if (status === 404) failedTables.add(table);
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
    
    if (!failedTables.has(table)) {
      supabase.from(table).update(updates).eq('id', id).then(({ status }) => {
        if (status === 404) failedTables.add(table);
      });
    }

    return updates;
  },

  async delete(table: string, userId: string, id: any) {
    const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    const filteredData = localData.filter((item: any) => item.id !== id);
    localStorage.setItem(`${table}_${userId}`, JSON.stringify(filteredData));
    
    if (!failedTables.has(table)) {
      supabase.from(table).delete().eq('id', id).then(({ status }) => {
        if (status === 404) failedTables.add(table);
      });
    }
  },

  async syncToCloud(table: string, userId: string) {
    const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    if (localData.length === 0) return { success: false, message: "No local data to sync." };

    try {
      const { error, status } = await supabase
        .from(table)
        .upsert(localData.map(item => ({ ...item, user_id: userId })));
      
      if (status === 404) {
        failedTables.add(table);
        return { success: false, message: "Table does not exist in Supabase." };
      }

      if (error) throw error;
      return { success: true, message: "Cloud sync complete." };
    } catch (err: any) {
      return { success: false, message: "Sync failed. Check connection." };
    }
  }
};