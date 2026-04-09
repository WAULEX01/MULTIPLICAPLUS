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
    department: 'Jovens'
  },
  { 
    id: 'm2', 
    name: 'Auxiliar Fernanda', 
    email: 'fernanda@igreja.com', 
    role: 'multiplicador', 
    department: 'Jovens'
  },
];

export const mockLeaders: User[] = mockUsers.filter(u => u.role === 'lider');

export const mockMembers: Member[] = [
  // Jovens
  { id: 'mj1', name: 'Alice Ferreira', phone: '11911111111', birthDate: '1995-05-10', department: 'Jovens', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2023-01-10', isActive: true, plan: 'Plano A' },
  { id: 'mj2', name: 'Bruno Costa', phone: '11911111112', birthDate: '1998-02-15', department: 'Jovens', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-02-15', isActive: true, plan: 'Plano B' },
  { id: 'mj3', name: 'Carla Dias', phone: '11911111113', birthDate: '1992-05-20', department: 'Jovens', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2023-05-20', isActive: true, plan: 'Plano A' },
  { id: 'mj4', name: 'Daniel Souza', phone: '11911111114', birthDate: '1990-11-05', department: 'Jovens', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2022-11-05', isActive: true, plan: 'Plano C' },
  { id: 'mj5', name: 'Eduarda Lima', phone: '11911111115', birthDate: '2000-03-01', department: 'Jovens', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-01', isActive: true, plan: 'Plano A' },
  { id: 'mj6', name: 'Fabio Santos', phone: '11911111116', birthDate: '1988-08-12', department: 'Jovens', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2023-08-12', isActive: true, plan: 'Plano B' },
  { id: 'mj7', name: 'Giovanna Rocha', phone: '11911111117', birthDate: '1997-10-25', department: 'Jovens', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2023-10-25', isActive: true, plan: 'Plano A' },
  { id: 'mj8', name: 'Henrique Alves', phone: '11911111118', birthDate: '1994-01-15', department: 'Jovens', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-01-15', isActive: true, plan: 'Plano C' },
  { id: 'mj9', name: 'Isabela Martins', phone: '11911111119', birthDate: '1996-12-30', department: 'Jovens', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2022-12-30', isActive: true, plan: 'Plano B' },
  { id: 'mj10', name: 'João Pedro', phone: '11911111120', birthDate: '1993-04-18', department: 'Jovens', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2023-04-18', isActive: true, plan: 'Plano A' },

  // Adolescentes
  { id: 'ma1', name: 'Kaique Silva', phone: '11922222221', birthDate: '2008-01-05', department: 'Adolescentes', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-01-05', isActive: true, plan: 'Plano A' },
  { id: 'ma2', name: 'Larissa Manoela', phone: '11922222222', birthDate: '2007-03-12', department: 'Adolescentes', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2023-03-12', isActive: true, plan: 'Plano B' },
  { id: 'ma3', name: 'Murilo Benício', phone: '11922222223', birthDate: '2009-06-20', department: 'Adolescentes', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2023-06-20', isActive: true, plan: 'Plano A' },
  { id: 'ma4', name: 'Natália Guimarães', phone: '11922222224', birthDate: '2008-02-28', department: 'Adolescentes', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-02-28', isActive: true, plan: 'Plano C' },
  { id: 'ma5', name: 'Otávio Mesquita', phone: '11922222225', birthDate: '2007-09-15', department: 'Adolescentes', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2022-09-15', isActive: true, plan: 'Plano A' },
  { id: 'ma6', name: 'Patrícia Abravanel', phone: '11922222226', birthDate: '2008-11-02', department: 'Adolescentes', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2023-11-02', isActive: true, plan: 'Plano B' },
  { id: 'ma7', name: 'Quiteria Chagas', phone: '11922222227', birthDate: '2009-03-10', department: 'Adolescentes', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-10', isActive: true, plan: 'Plano A' },
  { id: 'ma8', name: 'Rafael Portugal', phone: '11922222228', birthDate: '2008-07-22', department: 'Adolescentes', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2023-07-22', isActive: true, plan: 'Plano C' },
  { id: 'ma9', name: 'Sabrina Sato', phone: '11922222229', birthDate: '2007-10-30', department: 'Adolescentes', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2022-10-30', isActive: true, plan: 'Plano B' },
  { id: 'ma10', name: 'Tiago Leifert', phone: '11922222230', birthDate: '2008-04-01', department: 'Adolescentes', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-04-01', isActive: true, plan: 'Plano A' },

  // Conversão
  { id: 'mc1', name: 'Ursula Corbero', phone: '11933333331', birthDate: '1989-08-11', department: 'Conversão', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-15', isActive: true, plan: 'Plano A' },
  { id: 'mc2', name: 'Vitor Kley', phone: '11933333332', birthDate: '1994-08-18', department: 'Conversão', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-18', isActive: true, plan: 'Plano B' },
  { id: 'mc3', name: 'Wagner Moura', phone: '11933333333', birthDate: '1976-06-27', department: 'Conversão', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-20', isActive: true, plan: 'Plano A' },
  { id: 'mc4', name: 'Xuxa Meneghel', phone: '11933333334', birthDate: '1963-03-27', department: 'Conversão', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-22', isActive: true, plan: 'Plano C' },
  { id: 'mc5', name: 'Yudi Tamashiro', phone: '11933333335', birthDate: '1992-08-04', department: 'Conversão', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-25', isActive: true, plan: 'Plano A' },
  { id: 'mc6', name: 'Zeca Pagodinho', phone: '11933333336', birthDate: '1959-02-04', department: 'Conversão', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-28', isActive: true, plan: 'Plano B' },
  { id: 'mc7', name: 'Anitta', phone: '11933333337', birthDate: '1993-03-30', department: 'Conversão', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-04-01', isActive: true, plan: 'Plano A' },
  { id: 'mc8', name: 'Belo', phone: '11933333338', birthDate: '1974-04-22', department: 'Conversão', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-04-03', isActive: true, plan: 'Plano C' },
  { id: 'mc9', name: 'Caetano Veloso', phone: '11933333339', birthDate: '1942-08-07', department: 'Conversão', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-04-05', isActive: true, plan: 'Plano B' },
  { id: 'mc10', name: 'Djavan', phone: '11933333340', birthDate: '1949-01-27', department: 'Conversão', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-04-07', isActive: true, plan: 'Plano A' },

  // Adultos
  { id: 'mad1', name: 'Eliana Michaelichen', phone: '11944444441', birthDate: '1973-11-22', department: 'Adultos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2022-01-10', isActive: true, plan: 'Plano A' },
  { id: 'mad2', name: 'Fausto Silva', phone: '11944444442', birthDate: '1950-05-02', department: 'Adultos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2021-05-15', isActive: true, plan: 'Plano B' },
  { id: 'mad3', name: 'Gugu Liberato', phone: '11944444443', birthDate: '1959-04-10', department: 'Adultos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2020-08-20', isActive: true, plan: 'Plano A' },
  { id: 'mad4', name: 'Hebe Camargo', phone: '11944444444', birthDate: '1929-03-08', department: 'Adultos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2019-11-05', isActive: true, plan: 'Plano C' },
  { id: 'mad5', name: 'Ione Borges', phone: '11944444445', birthDate: '1951-01-17', department: 'Adultos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2021-03-01', isActive: true, plan: 'Plano A' },
  { id: 'mad6', name: 'Jô Soares', phone: '11944444446', birthDate: '1938-01-16', department: 'Adultos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2020-12-12', isActive: true, plan: 'Plano B' },
  { id: 'mad7', name: 'Luciano Huck', phone: '11944444447', birthDate: '1971-09-03', department: 'Adultos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2022-07-25', isActive: true, plan: 'Plano A' },
  { id: 'mad8', name: 'Marcos Mion', phone: '11944444448', birthDate: '1979-06-20', department: 'Adultos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2023-01-15', isActive: true, plan: 'Plano C' },
  { id: 'mad9', name: 'Otaviano Costa', phone: '11944444449', birthDate: '1973-05-13', department: 'Adultos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2021-10-30', isActive: true, plan: 'Plano B' },
  { id: 'mad10', name: 'Rodrigo Faro', phone: '11944444450', birthDate: '1973-10-20', department: 'Adultos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2022-04-18', isActive: true, plan: 'Plano A' },

  // Novos convertidos
  { id: 'mnc1', name: 'Sandy Leah', phone: '11955555551', birthDate: '1983-01-28', department: 'Novos convertidos', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-01', isActive: true, plan: 'Plano A' },
  { id: 'mnc2', name: 'Junior Lima', phone: '11955555552', birthDate: '1984-04-11', department: 'Novos convertidos', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-05', isActive: true, plan: 'Plano B' },
  { id: 'mnc3', name: 'Wanessa Camargo', phone: '11955555553', birthDate: '1982-12-28', department: 'Novos convertidos', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-10', isActive: true, plan: 'Plano A' },
  { id: 'mnc4', name: 'Zezé Di Camargo', phone: '11955555554', birthDate: '1962-08-17', department: 'Novos convertidos', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-15', isActive: true, plan: 'Plano C' },
  { id: 'mnc5', name: 'Luciano Camargo', phone: '11955555555', birthDate: '1973-01-20', department: 'Novos convertidos', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-20', isActive: true, plan: 'Plano A' },
  { id: 'mnc6', name: 'Leonardo', phone: '11955555556', birthDate: '1963-07-25', department: 'Novos convertidos', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-25', isActive: true, plan: 'Plano B' },
  { id: 'mnc7', name: 'Daniel', phone: '11955555557', birthDate: '1968-09-09', department: 'Novos convertidos', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-03-30', isActive: true, plan: 'Plano A' },
  { id: 'mnc8', name: 'Chitãozinho', phone: '11955555558', birthDate: '1954-05-05', department: 'Novos convertidos', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-04-01', isActive: true, plan: 'Plano C' },
  { id: 'mnc9', name: 'Xororó', phone: '11955555559', birthDate: '1957-09-30', department: 'Novos convertidos', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-04-05', isActive: true, plan: 'Plano B' },
  { id: 'mnc10', name: 'Sérgio Reis', phone: '11955555560', birthDate: '1940-06-23', department: 'Novos convertidos', isNewConvert: true, isBaptized: false, isIntegration: true, joinDate: '2024-04-08', isActive: true, plan: 'Plano A' },

  // Crianças
  { id: 'mcr1', name: 'Peppa Pig', phone: '11966666661', birthDate: '2018-05-10', department: 'Crianças', isNewConvert: false, isBaptized: false, isIntegration: false, joinDate: '2023-05-10', isActive: true, plan: 'Plano A' },
  { id: 'mcr2', name: 'George Pig', phone: '11966666662', birthDate: '2020-06-15', department: 'Crianças', isNewConvert: false, isBaptized: false, isIntegration: false, joinDate: '2023-06-15', isActive: true, plan: 'Plano B' },
  { id: 'mcr3', name: 'Mickey Mouse', phone: '11966666663', birthDate: '1928-11-18', department: 'Crianças', isNewConvert: false, isBaptized: false, isIntegration: false, joinDate: '2023-08-20', isActive: true, plan: 'Plano A' },
  { id: 'mcr4', name: 'Minnie Mouse', phone: '11966666664', birthDate: '1928-11-18', department: 'Crianças', isNewConvert: false, isBaptized: false, isIntegration: false, joinDate: '2023-11-05', isActive: true, plan: 'Plano C' },
  { id: 'mcr5', name: 'Pato Donald', phone: '11966666665', birthDate: '1934-06-09', department: 'Crianças', isNewConvert: false, isBaptized: false, isIntegration: false, joinDate: '2024-01-01', isActive: true, plan: 'Plano A' },
  { id: 'mcr6', name: 'Pateta', phone: '11966666666', birthDate: '1932-05-25', department: 'Crianças', isNewConvert: false, isBaptized: false, isIntegration: false, joinDate: '2024-02-12', isActive: true, plan: 'Plano B' },
  { id: 'mcr7', name: 'Pluto', phone: '11966666667', birthDate: '1930-09-05', department: 'Crianças', isNewConvert: false, isBaptized: false, isIntegration: false, joinDate: '2024-03-25', isActive: true, plan: 'Plano A' },
  { id: 'mcr8', name: 'Bob Esponja', phone: '11966666668', birthDate: '1999-07-14', department: 'Crianças', isNewConvert: false, isBaptized: false, isIntegration: false, joinDate: '2024-04-01', isActive: true, plan: 'Plano C' },
  { id: 'mcr9', name: 'Patrick Estrela', phone: '11966666669', birthDate: '1999-07-14', department: 'Crianças', isNewConvert: false, isBaptized: false, isIntegration: false, joinDate: '2024-04-05', isActive: true, plan: 'Plano B' },
  { id: 'mcr10', name: 'Lula Molusco', phone: '11966666670', birthDate: '1999-07-14', department: 'Crianças', isNewConvert: false, isBaptized: false, isIntegration: false, joinDate: '2024-04-08', isActive: true, plan: 'Plano A' },

  // Irmãos
  { id: 'mi1', name: 'Roberto Carlos', phone: '11977777771', birthDate: '1941-04-19', department: 'Irmãos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2020-01-10', isActive: true, plan: 'Plano A' },
  { id: 'mi2', name: 'Erasmo Carlos', phone: '11977777772', birthDate: '1941-06-05', department: 'Irmãos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2020-05-15', isActive: true, plan: 'Plano B' },
  { id: 'mi3', name: 'Wanderléa', phone: '11977777773', birthDate: '1944-06-05', department: 'Irmãos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2020-08-20', isActive: true, plan: 'Plano A' },
  { id: 'mi4', name: 'Ronnie Von', phone: '11977777774', birthDate: '1944-07-17', department: 'Irmãos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2019-11-05', isActive: true, plan: 'Plano C' },
  { id: 'mi5', name: 'Eduardo Araújo', phone: '11977777775', birthDate: '1942-07-23', department: 'Irmãos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2021-03-01', isActive: true, plan: 'Plano A' },
  { id: 'mi6', name: 'Sylvinha Araújo', phone: '11977777776', birthDate: '1951-09-16', department: 'Irmãos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2020-12-12', isActive: true, plan: 'Plano B' },
  { id: 'mi7', name: 'Martinha', phone: '11977777777', birthDate: '1949-01-17', department: 'Irmãos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2022-07-25', isActive: true, plan: 'Plano A' },
  { id: 'mi8', name: 'Jerry Adriani', phone: '11977777778', birthDate: '1947-01-29', department: 'Irmãos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2023-01-15', isActive: true, plan: 'Plano C' },
  { id: 'mi9', name: 'Wanderley Cardoso', phone: '11977777779', birthDate: '1945-03-10', department: 'Irmãos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2021-10-30', isActive: true, plan: 'Plano B' },
  { id: 'mi10', name: 'Paulo Sérgio', phone: '11977777780', birthDate: '1944-03-10', department: 'Irmãos', isNewConvert: false, isBaptized: true, isIntegration: false, joinDate: '2022-04-18', isActive: true, plan: 'Plano A' },
];

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
