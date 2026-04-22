
export interface Rabbit {
  id: string;
  tagId: string;
  name: string;
  breed: string;
  gender: 'Buck' | 'Doe';
  birthDate: string;
  weight: number;
  status: 'Active' | 'Sold' | 'Deceased' | 'Quarantine';
  cageNumber: string;
  notes?: string;
  imageUrl?: string;
}

export interface BreedingRecord {
  id: string;
  buckId: string;
  doeId: string;
  date: string;
  palpationDate?: string;
  palpationResult?: 'Positive' | 'Negative' | 'Pending';
  expectedKindlingDate?: string;
  actualKindlingDate?: string;
  status: 'Planned' | 'Mated' | 'Confirmed' | 'Failed' | 'Kindled' | 'Weaned';
  notes?: string;
}

export interface Litter {
  id: string;
  breedingId: string;
  doeId: string;
  birthDate: string;
  totalKits: number;
  aliveKits: number;
  deadKits: number;
  weaningDate?: string;
  weanedKits?: number;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  category: 'Feeding' | 'Cleaning' | 'Breeding' | 'Medical' | 'Other';
}

const STORAGE_KEYS = {
  RABBITS: 'hop_farm_rabbits',
  BREEDING: 'hop_farm_breeding',
  LITTERS: 'hop_farm_litters',
  TASKS: 'hop_farm_tasks',
};

export const storage = {
  getRabbits: (): Rabbit[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RABBITS);
    return data ? JSON.parse(data) : [];
  },
  saveRabbits: (rabbits: Rabbit[]) => {
    localStorage.setItem(STORAGE_KEYS.RABBITS, JSON.stringify(rabbits));
  },
  
  getBreedingRecords: (): BreedingRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BREEDING);
    return data ? JSON.parse(data) : [];
  },
  saveBreedingRecords: (records: BreedingRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.BREEDING, JSON.stringify(records));
  },

  getLitters: (): Litter[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LITTERS);
    return data ? JSON.parse(data) : [];
  },
  saveLitters: (litters: Litter[]) => {
    localStorage.setItem(STORAGE_KEYS.LITTERS, JSON.stringify(litters));
  },

  getTasks: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },
  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },
};
