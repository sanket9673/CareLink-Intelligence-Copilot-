import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePatientStore } from '../../store/usePatientStore';
import { api } from '../../services/api';
import { Users } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  last_updated: string;
}

export const PatientSelector = () => {
  const { selectedPatientId, setSelectedPatientId } = usePatientStore();

  const { data: patients, isLoading, isError } = useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data } = await api.get('/patients');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-slate-50 rounded-lg animate-pulse">
        <div className="w-4 h-4 bg-slate-200 rounded-full" />
        <div className="w-24 h-4 bg-slate-200 rounded" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-sm text-red-500">Failed to load patients</div>;
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600">
        <Users className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <label htmlFor="patient-select" className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 mb-0.5">
          Select Patient
        </label>
        <select
          id="patient-select"
          value={selectedPatientId || ""}
          onChange={(e) => setSelectedPatientId(e.target.value || null)}
          className="text-sm font-medium text-slate-900 bg-transparent border-0 p-0 pr-6 focus:ring-0 cursor-pointer appearance-none outline-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
        >
          <option value="" disabled>Choose a patient...</option>
          {patients?.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name} ({patient.id})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
