import { useState } from 'react';

export type Role = 'pastor' | 'lider' | 'multiplicador' | 'secretaria';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  function?: string; // For multipliers (e.g., reception, louvor)
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  department: string;
  isNewConvert: boolean;
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
  { id: 'd3', name: 'Conversão', description: 'Departamento de Conversão' },
  { id: 'd4', name: 'Adultos', description: 'Departamento de Adultos' },
  { id: 'd5', name: 'Novos convertidos', description: 'Departamento de Novos Convertidos' },
  { id: 'd6', name: 'Crianças', description: 'Departamento de Crianças' },
  { id: 'd7', name: 'Irmãos', description: 'Departamento de Irmãos' }
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
  { 
    id: 'l1', 
    name: 'Líder Marcos (Jovens)', 
    email: 'lider.jovens@igreja.com', 
    role: 'lider', 
    department: 'Jovens' 
  },
  { 
    id: 'l2', 
    name: 'Líder Ana (Adolescentes)', 
    email: 'lider.adolescentes@igreja.com', 
    role: 'lider', 
    department: 'Adolescentes' 
  },
  { 
    id: 'l3', 
    name: 'Líder Maria (Irmãos)', 
    email: 'lider.irmaos@igreja.com', 
    role: 'lider', 
    department: 'Irmãos' 
  },
  { 
    id: 'm1', 
    name: 'Multiplicador Lucas', 
    email: 'lucas@igreja.com', 
    role: 'multiplicador', 
    department: 'Jovens', 
    function: 'Louvor' 
  },
  { 
    id: 'm2', 
    name: 'Auxiliar Fernanda', 
    email: 'fernanda@igreja.com', 
    role: 'multiplicador', 
    department: 'Jovens', 
    function: 'Recepção' 
  },
];

export const mockLeaders: User[] = mockUsers.filter(u => u.role === 'lider');

export const mockMembers: Member[] = [
  { id: 'm1', name: 'Carlos Silva', phone: '11999999991', department: 'Jovens', isNewConvert: false, joinDate: '2023-01-15', isActive: true, plan: 'Plano A' },
  { id: 'm2', name: 'Maria Souza', phone: '11999999992', department: 'Adultos', isNewConvert: true, joinDate: '2024-02-10', isActive: true, plan: 'Plano B' },
  { id: 'm3', name: 'José Santos', phone: '11999999993', department: 'Irmãos', isNewConvert: false, joinDate: '2022-11-05', isActive: false, plan: 'Plano A' },
  { id: 'm4', name: 'Lucas Oliveira', phone: '11999999994', department: 'Jovens', isNewConvert: true, joinDate: '2024-03-01', isActive: true, plan: 'Plano C' },
  { id: 'm5', name: 'Fernanda Lima', phone: '11999999995', department: 'Adultos', isNewConvert: false, joinDate: '2023-05-20', isActive: true, plan: 'Plano A' },
];

export const mockAttendance: AttendanceRecord[] = [
  { id: 'a1', date: '2024-03-24', department: 'Jovens', memberId: 'm1', present: true, serviceType: 'Domingo' },
  { id: 'a2', date: '2024-03-24', department: 'Jovens', memberId: 'm4', present: false, serviceType: 'Domingo' },
  { id: 'a3', date: '2024-03-24', department: 'Adultos', memberId: 'm2', present: true, serviceType: 'Domingo' },
  { id: 'a4', date: '2024-03-24', department: 'Adultos', memberId: 'm5', present: true, serviceType: 'Domingo' },
  { id: 'a5', date: '2024-03-24', department: 'Irmãos', memberId: 'm3', present: false, serviceType: 'Domingo' },
];
