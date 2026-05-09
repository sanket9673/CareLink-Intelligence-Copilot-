import { create } from 'zustand';

interface PatientStore {
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  selectedPatientId: null,
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),
}));
