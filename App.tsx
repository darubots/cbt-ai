
import React, { useState, createContext, useContext, useMemo, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User, Question, ExamSettings, StudentResult, UserRole } from './types.ts';
import Login from './components/Login.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import StudentDashboard from './components/StudentDashboard.tsx';
import ExamPage from './components/ExamPage.tsx';

// --- CONTEXTS ---
interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, nisnOrPass: string) => boolean;
  logout: () => void;
  addUser: (username: string, nisn: string) => { success: boolean, message: string };
}
const AuthContext = createContext<AuthContextType | null>(null);

interface ExamContextType {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  settings: ExamSettings | null;
  setSettings: React.Dispatch<React.SetStateAction<ExamSettings | null>>;
  results: StudentResult[];
  addResult: (result: StudentResult) => void;
}
const ExamContext = createContext<ExamContextType | null>(null);


// --- MOCK DATA (REPLACE WITH DATABASE) ---
const INITIAL_MOCK_USERS: User[] = [
    { id: 'admin', username: 'admin', password: 'password', role: 'Admin' },
    { id: '123456789', username: 'Budi Santoso', nisn: '123456789', role: 'Siswa' },
    { id: '987654321', username: 'Ani Yudhoyono', nisn: '987654321', role: 'Siswa' },
];


// --- APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_MOCK_USERS);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<ExamSettings | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);

  const login = useCallback((username: string, nisnOrPass: string): boolean => {
    const foundUser = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        (u.role === 'Admin' ? u.password === nisnOrPass : u.nisn === nisnOrPass)
    );
    if (foundUser) {
        setUser(foundUser);
        return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);
  
  const addUser = useCallback((username: string, nisn: string): { success: boolean, message: string } => {
    if (users.some(u => u.nisn === nisn)) {
        return { success: false, message: `Siswa dengan NISN ${nisn} sudah terdaftar.` };
    }
    const newUser: User = {
        id: nisn,
        username,
        nisn,
        role: 'Siswa'
    };
    setUsers(prev => [...prev, newUser]);
    return { success: true, message: `Siswa ${username} berhasil ditambahkan.` };
  }, [users]);

  const addResult = useCallback((result: StudentResult) => {
    setResults(prev => [...prev, result]);
  }, []);

  const authContextValue = useMemo(() => ({ user, users, login, logout, addUser }), [user, users, login, logout, addUser]);
  const examContextValue = useMemo(() => ({ questions, setQuestions, settings, setSettings, results, addResult }), [questions, settings, results, addResult]);

  return (
    <AuthContext.Provider value={authContextValue}>
      <ExamContext.Provider value={examContextValue}>
        <HashRouter>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/admin" element={
              <ProtectedRoute role="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student" element={
              <ProtectedRoute role="Siswa">
                <StudentDashboard />
              </ProtectedRoute>
            } />
             <Route path="/exam" element={
              <ProtectedRoute role="Siswa">
                <ExamPage />
              </ProtectedRoute>
            } />
            <Route path="/" element={<HomeRedirect />} />
          </Routes>
        </HashRouter>
      </ExamContext.Provider>
    </AuthContext.Provider>
  );
}

// --- HOOKS for easier context access ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const useExam = () => {
    const context = useContext(ExamContext);
    if (!context) throw new Error('useExam must be used within an ExamProvider');
    return context;
};


// --- HELPER COMPONENTS ---
function HomeRedirect() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return <Navigate to={user.role === 'Admin' ? '/admin' : '/student'} />;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: UserRole;
}

function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (user.role !== role) return <Navigate to="/" />;
    return <>{children}</>;
}