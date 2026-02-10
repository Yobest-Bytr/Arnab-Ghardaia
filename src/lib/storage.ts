import { supabase } from '@/integrations/supabase/client';

export const storage = {
  async get(table: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn(`Supabase ${table} fetch failed, falling back to local storage.`);
      return JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
    }
  },

  async insert(table: string, userId: string, item: any) {
    const newItem = { ...item, user_id: userId, created_at: new Date().toISOString() };
    try {
      const { data, error } = await supabase
        .from(table)
        .insert([newItem])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn(`Supabase ${table} insert failed, saving to local storage.`);
      const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
      const localItem = { ...newItem, id: Date.now() };
      localStorage.setItem(`${table}_${userId}`, JSON.stringify([localItem, ...localData]));
      return localItem;
    }
  },

  async update(table: string, userId: string, id: any, updates: any) {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return data;
    } catch (err) {
      const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
      const updatedData = localData.map((item: any) => 
        item.id === id ? { ...item, ...updates } : item
      );
      localStorage.setItem(`${table}_${userId}`, JSON.stringify(updatedData));
      return updates;
    }
  },

  async delete(table: string, userId: string, id: any) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      const localData = JSON.parse(localStorage.getItem(`${table}_${userId}`) || '[]');
      const filteredData = localData.filter((item: any) => item.id !== id);
      localStorage.setItem(`${table}_${userId}`, JSON.stringify(filteredData));
    }
  }
};