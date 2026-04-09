/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Multipliers } from './pages/Multipliers';
import { Members } from './pages/Members';
import { Attendance } from './pages/Attendance';
import { Reports } from './pages/Reports';
import { Messages } from './pages/Messages';
import { Settings } from './pages/Settings';
import { NewConverts } from './pages/NewConverts';
import { Meetings } from './pages/Meetings';
import { Departments } from './pages/Departments';
import { Leaders } from './pages/Leaders';
import { Login } from './pages/Login';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="membros" element={<Members />} />
              <Route path="novos-convertidos" element={<NewConverts />} />
              <Route path="multiplicadores" element={<Multipliers />} />
              <Route path="lideres" element={<Leaders />} />
              <Route path="departamentos" element={<Departments />} />
              <Route path="presenca" element={<Attendance />} />
              <Route path="reunioes" element={<Meetings />} />
              <Route path="relatorios" element={<Reports />} />
              <Route path="mensagens" element={<Messages />} />
              <Route path="configuracoes" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AppProvider>
    </AuthProvider>
  );
}
