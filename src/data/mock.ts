import { useState } from 'react';

export type Role = 'pastor' | 'lider' | 'multiplicador' | 'secretaria';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  birthDate: string;
  department: string;
  isNewConvert: boolean;
  isBaptized: boolean;
  isIntegration: boolean;
  joinDate: string;
  plan?: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  department: string;
  memberId: string;
  present: boolean;
  serviceType?: 'Quinta' | 'Domingo' | 'Outro';
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  leaderId?: string;
}

export const DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Jovens', description: 'Departamento de Jovens' },
  { id: 'd2', name: 'Adolescentes', description: 'Departamento de Adolescentes' },
  { id: 'd3', name: 'Crianças em oração', description: 'Departamento de Crianças em oração' },
  { id: 'd4', name: 'Novos convertidos', description: 'Departamento de Novos Convertidos' },
  { id: 'd5', name: 'Homens', description: 'Departamento de Homens' },
  { id: 'd6', name: 'Mulheres', description: 'Departamento de Mulheres' }
];

export const mockUsers: User[] = [
  { 
    id: 'u0', 
    name: 'Pastor Administrador', 
    email: 'waulex2014@gmail.com', 
    role: 'pastor' 
  },
  { 
    id: 'u1', 
    name: 'Pastor João Silva', 
    email: 'pastor@igreja.com', 
    role: 'pastor' 
  },
  { 
    id: 'u2', 
    name: 'Secretária Geral', 
    email: 'secretaria@igreja.com', 
    role: 'secretaria' 
  },
  // Dynamic generation for leaders and multipliers
  ...DEPARTMENTS.flatMap((dept, deptIdx) => [
    // 2 Leaders per department
    ...Array.from({ length: 2 }).map((_, i) => ({
      id: `l-${dept.id}-${i + 1}`,
      name: `Líder ${i + 1} (${dept.name})`,
      email: `lider${i + 1}.${dept.id}@igreja.com`,
      role: 'lider' as Role,
      department: dept.name
    })),
    // 4 Multipliers per department
    ...Array.from({ length: 4 }).map((_, i) => ({
      id: `m-${dept.id}-${i + 1}`,
      name: `Multiplicador ${i + 1} (${dept.name})`,
      email: `multi${i + 1}.${dept.id}@igreja.com`,
      role: 'multiplicador' as Role,
      department: dept.name
    }))
  ])
];

export const mockLeaders: User[] = mockUsers.filter(u => u.role === 'lider');

export const mockMembers: Member[] = DEPARTMENTS.flatMap((dept) => 
  Array.from({ length: 40 }).map((_, i) => ({
    id: `mem-${dept.id}-${i + 1}`,
    name: `Membro ${i + 1} (${dept.name})`,
    phone: `119${Math.floor(Math.random() * 90000000 + 10000000)}`,
    birthDate: `${1970 + Math.floor(Math.random() * 40)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    department: dept.name,
    isNewConvert: Math.random() > 0.8,
    isBaptized: Math.random() > 0.3,
    isIntegration: Math.random() > 0.9,
    joinDate: `202${Math.floor(Math.random() * 5)}-01-01`,
    isActive: true,
    plan: ['Plano A', 'Plano B', 'Plano C'][Math.floor(Math.random() * 3)]
  }))
);

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  department: 'Geral' | string;
  createdBy: string;
  description?: string;
}

export interface AppSettings {
  id: string;
  logoUrl: string;
  churchName: string;
}

export const mockSettings: AppSettings = {
  id: 'global',
  logoUrl: '',
  churchName: 'Multiplica+'
};

export const mockMeetings: Meeting[] = [
  {
    id: 'mt1',
    title: 'Reunião Geral de Oração',
    date: '2024-04-15',
    time: '19:30',
    department: 'Geral',
    createdBy: 'u1',
    description: 'Reunião para todos os membros.'
  },
  {
    id: 'mt2',
    title: 'Encontro de Jovens',
    date: '2024-04-12',
    time: '20:00',
    department: 'Jovens',
    createdBy: 'l1',
    description: 'Encontro semanal dos jovens.'
  }
];

export const mockAttendance: AttendanceRecord[] = [
  { id: 'a1', date: '2024-03-24', department: 'Jovens', memberId: 'm1', present: true, serviceType: 'Domingo' },
  { id: 'a2', date: '2024-03-24', department: 'Jovens', memberId: 'm4', present: false, serviceType: 'Domingo' },
  { id: 'a3', date: '2024-03-24', department: 'Adultos', memberId: 'm2', present: true, serviceType: 'Domingo' },
  { id: 'a4', date: '2024-03-24', department: 'Adultos', memberId: 'm5', present: true, serviceType: 'Domingo' },
  { id: 'a5', date: '2024-03-24', department: 'Irmãos', memberId: 'm3', present: false, serviceType: 'Domingo' },
];
