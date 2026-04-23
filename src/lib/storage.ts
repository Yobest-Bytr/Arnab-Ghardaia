
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

export interface StorageProvider {
  get: (table: string, userId: string) => Promise<any[]>;
  insert: (table: string, userId: string, item: any) => Promise<any>;
  update: (table: string, userId: string, id: string, updates: any) => Promise<any>;
  delete: (table: string, userId: string, id: string) => Promise<void>;
  processSyncQueue: () => Promise<boolean>;
  clearSyncQueue: () => void;
  getRabbits: () => Promise<Rabbit[]>;
  saveRabbits: (rabbits: Rabbit[]) => Promise<void>;
  getBreedingRecords: () => Promise<BreedingRecord[]>;
  saveBreedingRecords: (records: BreedingRecord[]) => Promise<void>;
  getLitters: () => Promise<Litter[]>;
  saveLitters: (litters: Litter[]) => Promise<void>;
  getTasks: () => Promise<Task[]>;
  saveTasks: (tasks: Task[]) => Promise<void>;
  getCages: () => Promise<Cage[]>;
  saveCages: (cages: Cage[]) => Promise<void>;
  getSettings: () => Promise<UserSettings>;
  saveSettings: (settings: UserSettings) => Promise<void>;
  getAuth: () => any;
  saveAuth: (user: any) => void;
  clearAuth: () => void;
}

export const storage: StorageProvider = {
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
    const { data, error } = await supabase
      .from(table)
      .insert([{ ...item, user_id: userId }])
      .select();
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
    return data?.[0];
  },

  update: async (table: string, userId: string, id: string, updates: any) => {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
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

  processSyncQueue: async () => {
    console.log("Sync queue processed");
    return true;
  },

  clearSyncQueue: () => {
    localStorage.removeItem('arnab_sync_queue');
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
      const { id, ...rest } = rabbit;
      await supabase.from('rabbits').upsert({
        ...rest,
        id: id.length > 10 ? id : undefined, // Only use ID if it's a UUID
        user_id: user.id,
        rabbit_id: rabbit.tagId,
        birth_date: rabbit.birthDate,
        weight_history: rabbit.weightHistory
      });
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
      const { id, ...rest } = record;
      await supabase.from('mating_history').upsert({
        ...rest,
        id: id.length > 10 ? id : undefined,
        user_id: user.id,
        male_id: record.buckId,
        female_id: record.doeId,
        mating_date: record.date,
        expected_birth_date: record.expectedKindlingDate
      });
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
      const { id, ...rest } = litter;
      await supabase.from('litters').upsert({
        ...rest,
        id: id.length > 10 ? id : undefined,
        user_id: user.id,
        actual_birth_date: litter.birthDate,
        kit_count: litter.totalKits,
        alive_kits: litter.aliveKits,
        dead_kits: litter.deadKits
      });
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
      const { id, ...rest } = task;
      await supabase.from('tasks').upsert({
        ...rest,
        id: id.length > 10 ? id : undefined,
        user_id: user.id,
        due_date: task.dueDate
      });
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
      const { id, ...rest } = cage;
      await supabase.from('cages').upsert({
        ...rest,
        id: id.length > 10 ? id : undefined,
        user_id: user.id
      });
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
