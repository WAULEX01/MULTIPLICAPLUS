import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, User, mockMembers, mockAttendance, mockUsers, AttendanceRecord, DEPARTMENTS as INITIAL_DEPARTMENTS, Department } from '../data/mock';

interface AppContextType {
  members: Member[];
  users: User[];
  departments: Department[];
  attendance: AttendanceRecord[];
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  saveAttendance: (date: string, department: string, records: AttendanceRecord[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('multiplica_members');
    return saved ? JSON.parse(saved) : mockMembers;
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('multiplica_users');
    return saved ? JSON.parse(saved) : mockUsers;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('multiplica_departments');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });
  
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('multiplica_attendance');
    return saved ? JSON.parse(saved) : mockAttendance;
  });

  useEffect(() => {
    localStorage.setItem('multiplica_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('multiplica_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('multiplica_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('multiplica_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const addMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...memberData,
      id: `m${Date.now()}`
    };
    setMembers(prev => [...prev, newMember]);
  };

  const updateMember = (id: string, memberData: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...memberData } : m));
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addDepartment = (deptData: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...deptData,
      id: `d${Date.now()}`
    };
    setDepartments(prev => [...prev, newDept]);
  };

  const updateDepartment = (id: string, deptData: Partial<Department>) => {
    const oldDept = departments.find(d => d.id === id);
    if (!oldDept) return;

    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...deptData } : d));

    // If name changed, update all related records
    if (deptData.name && deptData.name !== oldDept.name) {
      const oldName = oldDept.name;
      const newName = deptData.name;
      setMembers(prev => prev.map(m => m.department === oldName ? { ...m, department: newName } : m));
      setUsers(prev => prev.map(u => u.department === oldName ? { ...u, department: newName } : u));
      setAttendance(prev => prev.map(a => a.department === oldName ? { ...a, department: newName } : a));
    }
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const saveAttendance = (date: string, department: string, records: AttendanceRecord[]) => {
    setAttendance(prev => {
      // Remove existing records for this date, department AND serviceType
      const serviceType = records[0]?.serviceType;
      const filtered = prev.filter(a => !(a.date === date && a.department === department && a.serviceType === serviceType));
      return [...filtered, ...records];
    });
  };

  return (
    <AppContext.Provider value={{
      members,
      users,
      departments,
      attendance,
      addMember,
      updateMember,
      deleteMember,
      addUser,
      updateUser,
      deleteUser,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      saveAttendance
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
