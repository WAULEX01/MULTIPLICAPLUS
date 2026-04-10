import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Mail, Lock, User, UserPlus, Loader2, Zap, ArrowLeft, Shield, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'pastor' | 'lider' | 'multiplicador'>('multiplicador');
  const [isLoading, setIsLoading] = useState(false);
  const { settings } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      if (response.ok) {
        toast.success('Conta criada com sucesso! Faça login.');
        navigate('/login');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Erro de conexão com o servidor');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-white shadow-xl mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            Criar Nova Conta
          </h1>
          <p className="text-slate-500 mt-2">Junte-se à gestão da sua igreja</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Nome Completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-start transition-colors" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-start transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@igreja.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium"
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
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Sua Função</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('pastor')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${role === 'pastor' ? 'border-primary-start bg-primary-start/5 text-primary-start' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">Pastor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('lider')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${role === 'lider' ? 'border-primary-start bg-primary-start/5 text-primary-start' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">Líder</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('multiplicador')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${role === 'multiplicador' ? 'border-primary-start bg-primary-start/5 text-primary-start' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                >
                  <Zap className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">Multi</span>
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary-start/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-6 h-6" />
                  Cadastrar Agora
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-start transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
