import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, Loader2, Shield, Users, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleGuestLogin = async (role: 'pastor' | 'lider' | 'multiplicador' = 'pastor') => {
    setIsLoading(true);
    await loginAsGuest(role);
    const roleNames = {
      pastor: 'Pastor',
      lider: 'Líder',
      multiplicador: 'Auxiliar'
    };
    toast.success(`Entrando como ${roleNames[role]} (Teste)...`);
    navigate('/');
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    
    if (success) {
      toast.success('Bem-vindo de volta!');
      navigate('/');
    } else {
      toast.error('Credenciais inválidas. Tente novamente.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-white shadow-xl shadow-primary-start/20 mb-4">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Multiplica+</h1>
          <p className="text-slate-500 mt-2">Gestão inteligente para sua rede de multiplicação</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">E-mail ou Usuário</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-start transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@igreja.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-start transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary-start/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  Entrar no Sistema
                </>
              )}
            </button>

            <div className="space-y-3 mt-6">
              <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Acesso Rápido (Teste)</p>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button"
                  onClick={() => handleGuestLogin('pastor')}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  <Shield className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">Pastor</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleGuestLogin('lider')}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all disabled:opacity-50"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">Líder</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleGuestLogin('multiplicador')}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all disabled:opacity-50"
                >
                  <Zap className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">Auxiliar</span>
                </button>
              </div>
            </div>
          </form>

          {/* Remove the old static role grid since we now have interactive buttons */}
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          Esqueceu sua senha? Entre em contato com o suporte.
        </p>
      </motion.div>
    </div>
  );
}
