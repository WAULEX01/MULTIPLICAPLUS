import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Member, User, mockMembers, mockAttendance, mockUsers, 
  AttendanceRecord, DEPARTMENTS as INITIAL_DEPARTMENTS, Department,
  Meeting, mockMeetings, AppSettings, mockSettings
} from '../data/mock';
import { auth, db } from '../firebase';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, 
  writeBatch, getDocs, query, where 
} from 'firebase/firestore';
import { toast } from 'sonner';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
    let isMigrating = {
      members: false,
      users: false,
      departments: false,
      meetings: false,
      settings: false
    };

    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Member));
      if (data.length === 0 && !isMigrating.members) {
        isMigrating.members = true;
        console.log("Migrating members...");
        mockMembers.forEach(m => setDoc(doc(db, 'members', m.id), m).catch(e => console.error("Error migrating member:", e)));
      } else {
        setMembers(data);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'members'));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      if (data.length === 0 && !isMigrating.users) {
        isMigrating.users = true;
        console.log("Migrating users...");
        mockUsers.forEach(u => setDoc(doc(db, 'users', u.id), u).catch(e => console.error("Error migrating user:", e)));
      } else {
        setUsers(data);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));

    const unsubDepts = onSnapshot(collection(db, 'departments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Department));
      if (data.length === 0 && !isMigrating.departments) {
        isMigrating.departments = true;
        console.log("Migrating departments...");
        INITIAL_DEPARTMENTS.forEach(d => setDoc(doc(db, 'departments', d.id), d).catch(e => console.error("Error migrating department:", e)));
      } else {
        setDepartments(data);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'departments'));

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AttendanceRecord));
      setAttendance(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'attendance'));

    const unsubMeetings = onSnapshot(collection(db, 'meetings'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Meeting));
      if (data.length === 0 && !isMigrating.meetings) {
        isMigrating.meetings = true;
        console.log("Migrating meetings...");
        mockMeetings.forEach(m => setDoc(doc(db, 'meetings', m.id), m).catch(e => console.error("Error migrating meeting:", e)));
      } else {
        setMeetings(data);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'meetings'));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ ...snapshot.data(), id: snapshot.id } as AppSettings);
      } else if (!isMigrating.settings) {
        isMigrating.settings = true;
        console.log("Migrating settings...");
        setDoc(doc(db, 'settings', 'global'), mockSettings).catch(e => console.error("Error migrating settings:", e));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings'));

    return () => {
      unsubMembers();
      unsubUsers();
      unsubDepts();
      unsubAttendance();
      unsubMeetings();
      unsubSettings();
    };
  }, []);

  const addMember = async (memberData: Omit<Member, 'id'>) => {
    const id = `m${Date.now()}`;
    await setDoc(doc(db, 'members', id), { ...memberData, id });
  };

  const updateMember = async (id: string, memberData: Partial<Member>) => {
    await setDoc(doc(db, 'members', id), memberData, { merge: true });
  };

  const deleteMember = async (id: string) => {
    await deleteDoc(doc(db, 'members', id));
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    const id = `u${Date.now()}`;
    await setDoc(doc(db, 'users', id), { ...userData, id });
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    await setDoc(doc(db, 'users', id), userData, { merge: true });
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
  };

  const addDepartment = async (deptData: Omit<Department, 'id'>) => {
    const id = `d${Date.now()}`;
    await setDoc(doc(db, 'departments', id), { ...deptData, id });
  };

  const updateDepartment = async (id: string, deptData: Partial<Department>) => {
    await setDoc(doc(db, 'departments', id), deptData, { merge: true });
  };

  const deleteDepartment = async (id: string) => {
    await deleteDoc(doc(db, 'departments', id));
  };

  const saveAttendance = async (date: string, department: string, records: AttendanceRecord[]) => {
    const batch = writeBatch(db);
    
    // In a real app, we'd query and delete existing records for this date/dept/serviceType
    // For simplicity in this demo, we'll just add the new ones.
    // Ideally, we'd use a unique ID like `${date}_${department}_${serviceType}_${memberId}`
    
    records.forEach(record => {
      const id = record.id || `a${Date.now()}_${record.memberId}`;
      batch.set(doc(db, 'attendance', id), { ...record, id });
    });

    await batch.commit();
  };

  const addMeeting = async (meetingData: Omit<Meeting, 'id'>) => {
    const id = `mt${Date.now()}`;
    await setDoc(doc(db, 'meetings', id), { ...meetingData, id });
    toast.success('Reunião agendada com sucesso!');
  };

  const deleteMeeting = async (id: string) => {
    await deleteDoc(doc(db, 'meetings', id));
  };

  const updateSettings = async (settingsData: Partial<AppSettings>) => {
    await setDoc(doc(db, 'settings', 'global'), settingsData, { merge: true });
  };

  const resetData = async () => {
    const collections = ['members', 'users', 'departments', 'attendance', 'meetings', 'settings'];
    for (const collName of collections) {
      const snapshot = await getDocs(collection(db, collName));
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
    toast.success('Todos os dados foram resetados!');
    window.location.reload();
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
