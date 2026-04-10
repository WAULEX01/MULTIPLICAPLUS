import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Member, User, mockMembers, mockAttendance, mockUsers, 
  AttendanceRecord, DEPARTMENTS as INITIAL_DEPARTMENTS, Department,
  Meeting, mockMeetings, AppSettings, mockSettings
} from '../data/mock';
import { toast } from 'sonner';

interface AppContextType {
  members: Member[];
  users: User[];
  departments: Department[];
  attendance: AttendanceRecord[];
  meetings: Meeting[];
  settings: AppSettings | null;
  addMember: (member: Omit<Member, 'id'>) => Promise<void>;
  updateMember: (id: string, member: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addDepartment: (dept: Omit<Department, 'id'>) => Promise<void>;
  updateDepartment: (id: string, dept: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  saveAttendance: (date: string, department: string, records: AttendanceRecord[]) => Promise<void>;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  resetData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('multiplica_token');
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const [membersRes, usersRes, attendanceRes, settingsRes] = await Promise.all([
          fetch('/api/members', { headers }),
          fetch('/api/users', { headers }),
          fetch('/api/attendance', { headers }),
          fetch('/api/settings')
        ]);

        if (membersRes.ok) {
          const rawMembers = await membersRes.json();
          setMembers(rawMembers.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            phone: m.phone,
            department: m.department,
            joinDate: m.join_date,
            birthDate: m.birth_date,
            isBaptized: !!m.is_baptized,
            isNewConvert: !!m.is_new_convert,
            isActive: !!m.is_active
          })));
        }
        if (usersRes.ok) setUsers(await usersRes.json());
        if (attendanceRes.ok) {
          const rawAttendance = await attendanceRes.json();
          setAttendance(rawAttendance.map((a: any) => ({
            id: a.id,
            date: a.date,
            department: a.department,
            memberId: a.member_id,
            present: !!a.present,
            serviceType: a.service_type
          })));
        }
        if (settingsRes.ok) setSettings(await settingsRes.json());
        
        // Departments and Meetings would be similar
        setDepartments(INITIAL_DEPARTMENTS);
        setMeetings(mockMeetings);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const apiFetch = async (url: string, options: any = {}) => {
    const token = localStorage.getItem('multiplica_token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }
    return response.json();
  };

  const addMember = async (memberData: Omit<Member, 'id'>) => {
    const id = `m${Date.now()}`;
    const newMember = { ...memberData, id };
    await apiFetch('/api/members', {
      method: 'POST',
      body: JSON.stringify(newMember)
    });
    setMembers(prev => [...prev, newMember]);
  };

  const updateMember = async (id: string, memberData: Partial<Member>) => {
    await apiFetch(`/api/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData)
    });
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...memberData } : m));
  };

  const deleteMember = async (id: string) => {
    await apiFetch(`/api/members/${id}`, {
      method: 'DELETE'
    });
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    // Implementation for users API
    toast.info('Funcionalidade de adicionar usuário em desenvolvimento para SQL');
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    // Implementation for users API
    toast.info('Funcionalidade de atualizar usuário em desenvolvimento para SQL');
  };

  const deleteUser = async (id: string) => {
    // Implementation for users API
    toast.info('Funcionalidade de excluir usuário em desenvolvimento para SQL');
  };

  const addDepartment = async (deptData: Omit<Department, 'id'>) => {
    const id = `d${Date.now()}`;
    const newDept = { ...deptData, id };
    setDepartments(prev => [...prev, newDept]);
  };

  const updateDepartment = async (id: string, deptData: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...deptData } : d));
  };

  const deleteDepartment = async (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const saveAttendance = async (date: string, department: string, records: AttendanceRecord[]) => {
    await apiFetch('/api/attendance/batch', {
      method: 'POST',
      body: JSON.stringify({ records })
    });
    // Refresh local attendance
    const attendanceRes = await apiFetch('/api/attendance');
    setAttendance(attendanceRes);
  };

  const addMeeting = async (meetingData: Omit<Meeting, 'id'>) => {
    const id = `mt${Date.now()}`;
    const newMeeting = { ...meetingData, id };
    setMeetings(prev => [...prev, newMeeting]);
    toast.success('Reunião agendada com sucesso!');
  };

  const deleteMeeting = async (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const updateSettings = async (settingsData: Partial<AppSettings>) => {
    await apiFetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
    setSettings(prev => prev ? { ...prev, ...settingsData } : (settingsData as AppSettings));
  };

  const resetData = async () => {
    toast.error('Reset de dados não disponível em modo SQL via interface.');
  };

  return (
    <AppContext.Provider value={{
      members,
      users,
      departments,
      attendance,
      meetings,
      settings,
      addMember,
      updateMember,
      deleteMember,
      addUser,
      updateUser,
      deleteUser,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      saveAttendance,
      addMeeting,
      deleteMeeting,
      updateSettings,
      resetData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
