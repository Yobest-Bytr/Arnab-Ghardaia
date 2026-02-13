import { supabase } from '@/integrations/supabase/client';

export const storage = {
  // Get data from local storage first
  async get(table: string, userId: string) {
    const localData = localStorage.getItem(`${table}_${userId}`);
    if (localData) {
      return JSON.parse(localData);
    }
    
    // Fallback to Supabase only if local is empty
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        localStorage.setItem(`${table}_${userId}`, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      // Silently fail and return empty array to prevent UI crashes
      console.warn(`Supabase ${table} fetch failed. Using local storage.`);
    }
    return [];
  },

  // Save locally by default
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
    
    // Attempt background sync but don't wait for it
    supabase.from(table).insert([newItem]).then(({ error }) => {
      if (error) console.warn(`Background sync failed for ${table}`);
    });

    return newItem;
  },

  async update(table: string, userId: string, id: any, updates: any) {
    const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    const updatedData = localData.map((item: any) => 
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    );
    localStorage.setItem(`${table}_${userId}`, JSON.stringify(updatedData));
    
    // Background sync
    supabase.from(table).update(updates).eq('id', id).then(({ error }) => {
      if (error) console.warn(`Background update failed for ${table}`);
    });

    return updates;
  },

  async delete(table: string, userId: string, id: any) {
    const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    const filteredData = localData.filter((item: any) => item.id !== id);
    localStorage.setItem(`${table}_${userId}`, JSON.stringify(filteredData));
    
    // Background sync
    supabase.from(table).delete().eq('id', id).then(({ error }) => {
      if (error) console.warn(`Background delete failed for ${table}`);
    });
  },

  // Manual sync to Supabase
  async syncToCloud(table: string, userId: string) {
    const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    if (localData.length === 0) return { success: false, message: "No local data to sync." };

    try {
      const { error } = await supabase
        .from(table)
        .upsert(localData.map(item => ({ ...item, user_id: userId })));
      
      if (error) throw error;
      return { success: true, message: "Cloud sync complete." };
    } catch (err: any) {
      return { success: false, message: "Sync failed. Table might not exist in Supabase." };
    }
  }
};