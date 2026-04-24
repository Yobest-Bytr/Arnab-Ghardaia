import { supabase } from '@/integrations/supabase/client';

export interface Rabbit {
  id: string;
  user_id?: string;
  tagId: string;
  name: string;
  breed: string;
  gender: 'Buck' | 'Doe';
  birthDate: string;
  weight: number;
  weightHistory: { date: string; weight: number }[];
  status: 'Active' | 'Sold' | 'Deceased' | 'Quarantine' | 'Available';
  cageId?: string;
  cage_number?: string;
  notes?: string;
  imageUrl?: string;
  source?: string;
  price?: number;
  health_status?: string;
}

export interface BreedingRecord {
  id: string;
  user_id?: string;
  buckId: string;
  doeId: string;
  date: string;
  palpationDate?: string;
  palpationResult?: 'Positive' | 'Negative' | 'Pending';
  expectedKindlingDate?: string;
  actualKindlingDate?: string;
  status: 'Planned' | 'Mated' | 'Confirmed' | 'Failed' | 'Kindled' | 'Weaned' | 'Pending';
  notes?: string;
}

export interface Litter {
  id: string;
  user_id?: string;
  breedingId?: string;
  doeId?: string;
  mother_id?: string;
  father_id?: string;
  birthDate: string;
  actual_birth_date?: string;
  totalKits: number;
  kit_count?: number;
  aliveKits: number;
  alive_kits?: number;
  deadKits: number;
  dead_kits?: number;
  survival_count?: number;
  weaningDate?: string;
  weanedKits?: number;
  notes?: string;
  status?: string;
}

export interface Cage {
  id: string;
  user_id?: string;
  number: string;
  type: 'Single' | 'Breeding' | 'Grow-out';
  location: string;
  status: 'Occupied' | 'Empty' | 'Maintenance';
  capacity: number;
}

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  due_date?: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'Feeding' | 'Cleaning' | 'Breeding' | 'Medical' | 'Other';
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'fr' | 'ar';
  aiKey?: string;
  aiProvider?: 'openai' | 'anthropic' | 'google' | 'grok' | 'mistral' | 'gemini';
  farmName: string;
}

export const storage = {
  get: async (table: string, userId: string) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId);
    if (error) {
      console.error(`Error fetching from ${table}:`, error);
      return [];
    }
    return data || [];
  },

  insert: async (table: string, userId: string, item: any) => {
    // Clean item to only include valid columns for the table
    const cleanedItem = { ...item, user_id: userId };
    
    // Special handling for known tables to avoid 400 errors
    if (table === 'rabbits') {
      const mapped = {
        user_id: userId,
        name: item.name,
        breed: item.breed || 'Unknown',
        gender: item.gender,
        birth_date: item.birthDate || item.birth_date,
        weight: item.weight,
        status: item.status,
        notes: item.notes,
        rabbit_id: item.tagId || item.rabbit_id,
        weight_history: item.weightHistory || item.weight_history || [],
        cage_number: item.cage_number || item.cageId || null,
        health_status: item.health_status || 'Healthy'
      };
      const { data, error } = await supabase.from('rabbits').insert([mapped]).select();
      if (error) {
        console.error('Error inserting rabbit:', error);
        throw error;
      }
      return data?.[0];
    }

    if (table === 'mating_history') {
      const mapped = {
        user_id: userId,
        female_id: (item.doeId || item.female_id) || null,
        male_id: (item.buckId || item.male_id) || null,
        mating_date: item.date || item.mating_date,
        status: item.status || 'Pending',
        notes: item.notes,
        expected_birth_date: item.expectedKindlingDate || item.expected_birth_date || null
      };
      if (mapped.female_id === '') mapped.female_id = null;
      if (mapped.male_id === '') mapped.male_id = null;

      const { data, error } = await supabase.from('mating_history').insert([mapped]).select();
      if (error) {
        console.error('Error inserting mating_history:', error);
        throw error;
      }
      return data?.[0];
    }

    if (table === 'sales') {
      const mapped = {
        user_id: userId,
        rabbit_id: (item.rabbit_id && item.rabbit_id !== '') ? item.rabbit_id : null,
        sale_date: item.sale_date || new Date().toISOString().split('T')[0],
        price: parseFloat(item.price) || 0,
        customer_name: item.customer_name,
        customer_phone: item.customer_phone || null,
        category: item.category || 'Natural',
        notes: item.notes
      };
      const { data, error } = await supabase.from('sales').insert([mapped]).select();
      if (error) {
        console.error('Error inserting sale:', error);
        throw error;
      }
      return data?.[0];
    }

    if (table === 'expenses') {
      const mapped = {
        user_id: userId,
        category: item.category,
        amount: parseFloat(item.amount) || 0,
        date: item.date || new Date().toISOString().split('T')[0],
        notes: item.notes
      };
      const { data, error } = await supabase.from('expenses').insert([mapped]).select();
      if (error) {
        console.error('Error inserting expense:', error);
        throw error;
      }
      return data?.[0];
    }

    if (table === 'litters') {
      const mapped = {
        user_id: userId,
        mother_id: (item.doeId || item.mother_id) || null,
        father_id: (item.buckId || item.father_id) || null,
        mating_date: item.mating_date || null,
        actual_birth_date: item.birthDate || item.actual_birth_date || null,
        kit_count: item.totalKits || item.kit_count || 0,
        alive_kits: item.aliveKits || item.alive_kits || 0,
        dead_kits: item.deadKits || item.dead_kits || 0,
        notes: item.notes,
        status: item.status || 'Pregnant'
      };
      if (mapped.mother_id === '') mapped.mother_id = null;
      if (mapped.father_id === '') mapped.father_id = null;

      const { data, error } = await supabase.from('litters').insert([mapped]).select();
      if (error) {
        console.error('Error inserting litter:', error);
        throw error;
      }
      return data?.[0];
    }

    if (table === 'tasks') {
      const mapped = {
        user_id: userId,
        title: item.title,
        category: item.category,
        priority: item.priority,
        due_date: item.due_date || item.dueDate || new Date().toISOString().split('T')[0],
        notes: item.notes,
        completed: item.completed || false
      };
      const { data, error } = await supabase.from('tasks').insert([mapped]).select();
      if (error) {
        console.error('Error inserting task:', error);
        throw error;
      }
      return data?.[0];
    }

    const { data, error } = await supabase.from(table).insert([cleanedItem]).select();
    if (error) throw error;
    return data?.[0];
  },

  update: async (table: string, userId: string, id: string, updates: any) => {
    // Clean updates
    const cleanedUpdates = { ...updates };
    delete cleanedUpdates.id;
    delete cleanedUpdates.user_id;

    if (table === 'rabbits') {
      if (updates.birthDate) cleanedUpdates.birth_date = updates.birthDate;
      if (updates.tagId) cleanedUpdates.rabbit_id = updates.tagId;
      if (updates.weightHistory) cleanedUpdates.weight_history = updates.weightHistory;
      if (updates.cageId) cleanedUpdates.cage_number = updates.cageId;
      delete cleanedUpdates.birthDate;
      delete cleanedUpdates.tagId;
      delete cleanedUpdates.weightHistory;
      delete cleanedUpdates.cageId;
    }

    if (table === 'tasks') {
      if (updates.dueDate) cleanedUpdates.due_date = updates.dueDate;
      delete cleanedUpdates.dueDate;
    }

    const { data, error } = await supabase
      .from(table)
      .update(cleanedUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  delete: async (table: string, userId: string, id: string) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  },

  getRabbits: async (): Promise<Rabbit[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from('rabbits').select('*').eq('user_id', user.id);
    if (error) return [];
    return (data || []).map(r => ({
      ...r,
      tagId: r.rabbit_id || r.tagId || '',
      birthDate: r.birth_date || r.birthDate,
      weightHistory: r.weight_history || r.weightHistory || []
    }));
  },

  saveRabbits: async (rabbits: Rabbit[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    for (const rabbit of rabbits) {
      const isNew = !rabbit.id || rabbit.id.length < 10;
      const mapped = {
        user_id: user.id,
        name: rabbit.name,
        breed: rabbit.breed || 'Unknown',
        gender: rabbit.gender,
        birth_date: rabbit.birthDate,
        weight: rabbit.weight,
        status: rabbit.status,
        notes: rabbit.notes,
        rabbit_id: rabbit.tagId,
        weight_history: rabbit.weightHistory || [],
        cage_number: rabbit.cage_number || rabbit.cageId
      };

      if (isNew) {
        await supabase.from('rabbits').insert([mapped]);
      } else {
        await supabase.from('rabbits').update(mapped).eq('id', rabbit.id).eq('user_id', user.id);
      }
    }
  },

  getBreedingRecords: async (): Promise<BreedingRecord[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from('mating_history').select('*').eq('user_id', user.id);
    if (error) return [];
    return (data || []).map(r => ({
      ...r,
      buckId: r.male_id || r.buckId,
      doeId: r.female_id || r.doeId,
      date: r.mating_date || r.date,
      expectedKindlingDate: r.expected_birth_date || r.expectedKindlingDate
    }));
  },

  saveBreedingRecords: async (records: BreedingRecord[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    for (const record of records) {
      const isNew = !record.id || record.id.length < 10;
      const mapped = {
        user_id: user.id,
        male_id: record.buckId,
        female_id: record.doeId,
        mating_date: record.date,
        status: record.status,
        notes: record.notes,
        expected_birth_date: record.expectedKindlingDate
      };

      if (isNew) {
        await supabase.from('mating_history').insert([mapped]);
      } else {
        await supabase.from('mating_history').update(mapped).eq('id', record.id).eq('user_id', user.id);
      }
    }
  },

  getLitters: async (): Promise<Litter[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from('litters').select('*').eq('user_id', user.id);
    if (error) return [];
    return (data || []).map(l => ({
      ...l,
      birthDate: l.actual_birth_date || l.birthDate || l.mating_date,
      totalKits: l.kit_count || l.totalKits || 0,
      aliveKits: l.alive_kits || l.aliveKits || 0,
      deadKits: l.dead_kits || l.deadKits || 0
    }));
  },

  saveLitters: async (litters: Litter[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    for (const litter of litters) {
      const isNew = !litter.id || litter.id.length < 10;
      const mapped = {
        user_id: user.id,
        actual_birth_date: litter.birthDate,
        kit_count: litter.totalKits,
        alive_kits: litter.aliveKits,
        dead_kits: litter.deadKits,
        mother_id: litter.doeId || litter.mother_id,
        notes: litter.notes
      };

      if (isNew) {
        await supabase.from('litters').insert([mapped]);
      } else {
        await supabase.from('litters').update(mapped).eq('id', litter.id).eq('user_id', user.id);
      }
    }
  },

  getTasks: async (): Promise<Task[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from('tasks').select('*').eq('user_id', user.id);
    if (error) return [];
    return (data || []).map(t => ({
      ...t,
      dueDate: t.due_date || t.dueDate
    }));
  },

  saveTasks: async (tasks: Task[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    for (const task of tasks) {
      const isNew = !task.id || task.id.length < 10;
      const mapped = {
        user_id: user.id,
        title: task.title,
        due_date: task.dueDate,
        completed: task.completed,
        priority: task.priority,
        category: task.category
      };

      if (isNew) {
        await supabase.from('tasks').insert([mapped]);
      } else {
        await supabase.from('tasks').update(mapped).eq('id', task.id).eq('user_id', user.id);
      }
    }
  },

  getCages: async (): Promise<Cage[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from('cages').select('*').eq('user_id', user.id);
    if (error) return [];
    return data || [];
  },

  saveCages: async (cages: Cage[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    for (const cage of cages) {
      const isNew = !cage.id || cage.id.length < 10;
      const mapped = {
        user_id: user.id,
        number: cage.number,
        type: cage.type,
        location: cage.location,
        status: cage.status,
        capacity: cage.capacity
      };

      if (isNew) {
        await supabase.from('cages').insert([mapped]);
      } else {
        await supabase.from('cages').update(mapped).eq('id', cage.id).eq('user_id', user.id);
      }
    }
  },

  getSettings: async (): Promise<UserSettings> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { theme: 'light', language: 'en', farmName: 'My Hop Farm' };
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) return { theme: 'light', language: 'en', farmName: 'My Hop Farm' };
    return {
      theme: data.theme || 'light',
      language: data.language || 'en',
      aiKey: data.ai_key,
      aiProvider: data.ai_provider || 'openai',
      farmName: data.display_name || 'My Hop Farm'
    };
  },

  saveSettings: async (settings: UserSettings) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').upsert({
      id: user.id,
      theme: settings.theme,
      language: settings.language,
      ai_key: settings.aiKey,
      ai_provider: settings.aiProvider,
      display_name: settings.farmName
    });
  },

  processSyncQueue: async () => {
    // Placeholder for sync logic if needed
    return true;
  },

  getAuth: () => {
    const data = localStorage.getItem('hop_farm_auth');
    return data ? JSON.parse(data) : null;
  },
  saveAuth: (user: any) => {
    localStorage.setItem('hop_farm_auth', JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem('hop_farm_auth');
  }
};