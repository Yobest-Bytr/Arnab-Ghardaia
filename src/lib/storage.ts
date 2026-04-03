import { supabase } from '@/integrations/supabase/client';

const SYNC_QUEUE_KEY = 'arnab_sync_queue';
const DEMO_UUID = '00000000-0000-0000-0000-000000000000';

const ALLOWED_COLUMNS: Record<string, string[]> = {
  rabbits: ['id', 'user_id', 'rabbit_id', 'name', 'breed', 'gender', 'color', 'origin', 'health_status', 'status', 'cage_number', 'cage_type', 'price_dzd', 'weight', 'birth_date', 'notes', 'mother_id', 'father_id', 'mating_partner', 'vaccination_status', 'medical_history', 'weight_history', 'is_public', 'image_url', 'created_at', 'updated_at'],
  litters: ['id', 'user_id', 'mother_name', 'father_name', 'mating_date', 'expected_birth_date', 'actual_birth_date', 'kit_count', 'alive_kits', 'dead_kits', 'status', 'notes', 'created_at'],
  sales: ['id', 'user_id', 'rabbit_id', 'customer_name', 'price', 'sale_date', 'category', 'notes', 'created_at'],
  expenses: ['id', 'user_id', 'category', 'amount', 'date', 'notes', 'created_at'],
  weight_logs: ['id', 'user_id', 'rabbit_id', 'weight', 'log_date', 'created_at'],
  mating_history: ['id', 'user_id', 'female_id', 'male_id', 'mating_date', 'status', 'notes', 'created_at'],
  profiles: ['id', 'display_name', 'email', 'avatar_url', 'updated_at'],
  tasks: ['id', 'user_id', 'title', 'category', 'priority', 'due_date', 'notes', 'completed', 'created_at']
};

interface SyncItem {
  id: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
}

const isUUID = (str: any): boolean => {
  if (typeof str !== 'string' || !str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const sanitizePayload = (table: string, obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  const allowed = ALLOWED_COLUMNS[table] || [];
  const sanitized: any = {};
  for (const key of allowed) {
    let value = obj[key];
    if (value === undefined || value === "") {
      sanitized[key] = null;
      continue;
    }
    if (key.includes('price') || key === 'weight' || key.includes('count') || key.includes('kits') || key === 'amount') {
      sanitized[key] = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    } else if (key === 'weight_history') {
      sanitized[key] = Array.isArray(value) ? value : [];
    } else if (key === 'is_public' || key === 'completed') {
      sanitized[key] = !!value;
    } else if (key === 'user_id' || key === 'id') {
      sanitized[key] = isUUID(value) ? value : generateUUID();
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export const storage = {
  async get(table: string, userId: string) {
    const localKey = `${table}_${userId}`;
    const localData = localStorage.getItem(localKey);
    let data = localData ? JSON.parse(localData) : [];

    if (!isUUID(userId) || userId === DEMO_UUID || !navigator.onLine) {
      return data;
    }

    try {
      const { data: cloudData, error } = await supabase
        .from(table)
        .select('*')
        .eq(table === 'profiles' ? 'id' : 'user_id', userId)
        .order('created_at', { ascending: false });
      
      if (!error && cloudData) {
        localStorage.setItem(localKey, JSON.stringify(cloudData));
        return cloudData;
      }
    } catch (e) {
      console.warn(`Cloud fetch failed for ${table}.`);
    }
    return data;
  },

  async insert(table: string, userId: string, item: any) {
    const validId = isUUID(item.id) ? item.id : generateUUID();
    const newItem = { 
      ...item, 
      id: validId,
      [table === 'profiles' ? 'id' : 'user_id']: userId, 
      created_at: item.created_at || new Date().toISOString() 
    };
    
    const sanitizedItem = sanitizePayload(table, newItem);
    const localKey = `${table}_${userId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify([sanitizedItem, ...localData]));
    
    if (isUUID(userId) && userId !== DEMO_UUID) {
      this.addToSyncQueue({ id: validId, table, action: 'INSERT', data: sanitizedItem, timestamp: Date.now() });
    }
    return sanitizedItem;
  },

  async update(table: string, userId: string, id: string, updates: any) {
    const sanitizedUpdates = sanitizePayload(table, updates);
    const localKey = `${table}_${userId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    const updatedData = localData.map((item: any) => 
      item.id === id ? { ...item, ...sanitizedUpdates, updated_at: new Date().toISOString() } : item
    );
    localStorage.setItem(localKey, JSON.stringify(updatedData));
    
    if (isUUID(userId) && userId !== DEMO_UUID) {
      this.addToSyncQueue({ id, table, action: 'UPDATE', data: sanitizedUpdates, timestamp: Date.now() });
    }
    return sanitizedUpdates;
  },

  async delete(table: string, userId: string, id: string) {
    const localKey = `${table}_${userId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify(localData.filter((i: any) => i.id !== id)));
    
    if (isUUID(userId) && userId !== DEMO_UUID) {
      this.addToSyncQueue({ id, table, action: 'DELETE', data: null, timestamp: Date.now() });
    }
  },

  addToSyncQueue(item: SyncItem) {
    if (item.data?.user_id && !isUUID(item.data.user_id)) return;
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([...queue, item]));
    this.processSyncQueue().catch(() => {});
  },

  async processSyncQueue() {
    if (!navigator.onLine) return;
    let queue: SyncItem[] = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    
    const cleanQueue = queue.filter(item => {
      const dataStr = JSON.stringify(item.data || {});
      return !dataStr.includes('"yonr"') && !dataStr.includes('"demo-user"') && !dataStr.includes(DEMO_UUID);
    });

    if (cleanQueue.length !== queue.length) {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(cleanQueue));
      queue = cleanQueue;
    }

    if (queue.length === 0) return;

    const updatedQueue = [...queue];
    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      try {
        let error;
        const cleanData = item.data ? sanitizePayload(item.table, item.data) : null;
        if (item.action === 'INSERT') ({ error } = await supabase.from(item.table).upsert([cleanData]));
        else if (item.action === 'UPDATE') ({ error } = await supabase.from(item.table).update(cleanData).eq('id', item.id));
        else if (item.action === 'DELETE') ({ error } = await supabase.from(item.table).delete().eq('id', item.id));

        if (!error) {
          updatedQueue.splice(i, 1);
          i--;
        } else if (error.code.startsWith('22') || error.code.startsWith('23') || error.code === 'PGRST204') {
          updatedQueue.splice(i, 1);
          i--;
        } else {
          break; 
        }
      } catch (e) { break; }
    }
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
  },

  clearSyncQueue() {
    localStorage.setItem(SYNC_QUEUE_KEY, '[]');
  }
};

window.addEventListener('online', () => storage.processSyncQueue());