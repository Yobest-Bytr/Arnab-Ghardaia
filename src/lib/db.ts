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
  father_id?: string;
  mother_id?: string;
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

const cleanUUID = (id: any) => {
  if (!id || id === '' || id === 'undefined' || id === 'null') return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof id === 'string' && uuidRegex.test(id)) return id;
  return null;
};

const cleanDate = (date: any) => {
  if (!date || date === '' || date === 'undefined' || date === 'null') return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  } catch (e) {
    return null;
  }
};

const mapRabbitToDB = (rabbit: any, userId: string) => ({
  user_id: userId,
  name: rabbit.name || 'Unnamed',
  breed: rabbit.breed || 'Unknown',
  gender: rabbit.gender || 'Doe',
  birth_date: cleanDate(rabbit.birthDate || rabbit.birth_date),
  weight: parseFloat(rabbit.weight) || 0,
  status: rabbit.status || 'Active',
  notes: rabbit.notes || '',
  rabbit_id: rabbit.tagId || rabbit.rabbit_id || '',
  weight_history: rabbit.weightHistory || rabbit.weight_history || [],
  cage_number: rabbit.cage_number || rabbit.cageId || null,
  health_status: rabbit.health_status || 'Healthy',
  father_id: cleanUUID(rabbit.father_id),
  mother_id: cleanUUID(rabbit.mother_id)
});

const mapMatingToDB = (record: any, userId: string) => ({
  user_id: userId,
  female_id: cleanUUID(record.doeId || record.female_id),
  male_id: cleanUUID(record.buckId || record.male_id),
  mating_date: cleanDate(record.date || record.mating_date) || new Date().toISOString().split('T')[0],
  status: record.status || 'Pending',
  notes: record.notes || '',
  expected_birth_date: cleanDate(record.expectedKindlingDate || record.expected_birth_date)
});

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
    let mapped = { ...item, user_id: userId };
    
    if (table === 'rabbits') mapped = mapRabbitToDB(item, userId);
    else if (table === 'mating_history') mapped = mapMatingToDB(item, userId);
    else if (table === 'sales') {
      mapped = {
        user_id: userId,
        rabbit_id: cleanUUID(item.rabbit_id),
        sale_date: cleanDate(item.sale_date) || new Date().toISOString().split('T')[0],
        price: parseFloat(item.price) || 0,
        customer_name: item.customer_name || 'Guest',
        customer_phone: item.customer_phone || null,
        category: item.category || 'Natural',
        notes: item.notes || ''
      };
    } else if (table === 'expenses') {
      mapped = {
        user_id: userId,
        category: item.category || 'Other',
        amount: parseFloat(item.amount) || 0,
        date: cleanDate(item.date) || new Date().toISOString().split('T')[0],
        notes: item.notes || ''
      };
    } else if (table === 'litters') {
      mapped = {
        user_id: userId,
        mother_id: cleanUUID(item.doeId || item.mother_id),
        father_id: cleanUUID(item.buckId || item.father_id),
        mating_date: cleanDate(item.mating_date),
        actual_birth_date: cleanDate(item.birthDate || item.actual_birth_date),
        kit_count: parseInt(item.totalKits || item.kit_count) || 0,
        alive_kits: parseInt(item.aliveKits || item.alive_kits) || 0,
        dead_kits: parseInt(item.deadKits || item.dead_kits) || 0,
        notes: item.notes || '',
        status: item.status || 'Pregnant'
      };
    } else if (table === 'tasks') {
      mapped = {
        user_id: userId,
        title: item.title || 'Untitled Task',
        category: item.category || 'Other',
        priority: item.priority || 'Medium',
        due_date: cleanDate(item.due_date || item.dueDate) || new Date().toISOString().split('T')[0],
        notes: item.notes || '',
        completed: item.completed || false
      };
    }

    const { data, error } = await supabase.from(table).insert([mapped]).select();
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
    return data?.[0];
  },

  update: async (table: string, userId: string, id: string, updates: any) => {
    const cleanedUpdates = { ...updates };
    delete cleanedUpdates.id;
    delete cleanedUpdates.user_id;

    if (table === 'rabbits') {
      if (updates.birthDate) cleanedUpdates.birth_date = cleanDate(updates.birthDate);
      if (updates.tagId) cleanedUpdates.rabbit_id = updates.tagId;
      if (updates.weightHistory) cleanedUpdates.weight_history = updates.weightHistory;
      if (updates.cageId) cleanedUpdates.cage_number = updates.cageId;
      if (updates.weight) cleanedUpdates.weight = parseFloat(updates.weight);
      delete cleanedUpdates.birthDate;
      delete cleanedUpdates.tagId;
      delete cleanedUpdates.weightHistory;
      delete cleanedUpdates.cageId;
    } else if (table === 'tasks') {
      if (updates.dueDate) cleanedUpdates.due_date = cleanDate(updates.dueDate);
      delete cleanedUpdates.dueDate;
    }

    const { data, error } = await supabase
      .from(table)
      .update(cleanedUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select();
    if (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
    return data?.[0];
  },

  delete: async (table: string, userId: string, id: string) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
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
      const mapped = mapRabbitToDB(rabbit, user.id);

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
      const mapped = mapMatingToDB(record, user.id);

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
        actual_birth_date: cleanDate(litter.birthDate),
        kit_count: parseInt(litter.totalKits as any) || 0,
        alive_kits: parseInt(litter.aliveKits as any) || 0,
        dead_kits: parseInt(litter.deadKits as any) || 0,
        mother_id: cleanUUID(litter.doeId || litter.mother_id),
        notes: litter.notes || ''
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
        due_date: cleanDate(task.dueDate),
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
        capacity: parseInt(cage.capacity as any) || 1
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
    
    // Ensure we have the email for the profiles table which has email as NOT NULL
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('email').eq('id', user.id).single();
    const email = profileData?.email || user.email;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: email,
      theme: settings.theme,
      language: settings.language,
      ai_key: settings.aiKey,
      ai_provider: settings.aiProvider,
      display_name: settings.farmName,
      updated_at: new Date().toISOString()
    });
    
    if (error) {
      console.error('Error saving settings to profiles:', error);
      throw error;
    }
  },

  processSyncQueue: async () => {
    return true;
  },

  clearSyncQueue: () => {
    localStorage.removeItem('arnab_sync_queue');
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
