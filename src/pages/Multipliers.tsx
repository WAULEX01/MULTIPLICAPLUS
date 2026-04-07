import React, { useState, useMemo } from 'react';
import { Search, Plus, Users, ArrowRight, UserCog, Network, Trophy, Star, Medal, Target, Zap, ChevronRight, TrendingUp, X, Edit2, Trash2, Mail } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ConfirmModal } from '../components/ConfirmModal';

export function Multipliers() {
  const { users, members, addUser, updateUser, deleteUser, departments } = useAppContext();
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const multipliers = useMemo(() => {
    let filtered = users.filter(u => u.role === 'multiplicador');
    if (currentUser?.role === 'lider' || currentUser?.role === 'multiplicador') {
      filtered = filtered.filter(u => u.department === currentUser.department);
    }
    if (searchQuery) {
      filtered = filtered.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [users, currentUser, searchQuery]);

  const totalMultipliers = multipliers.length;
  const totalMembersInDept = useMemo(() => {
    if (currentUser?.role === 'pastor' || currentUser?.role === 'secretaria') return members.length;
    return members.filter(m => m.department === currentUser?.department).length;
  }, [members, currentUser]);

  const defaultFormState = {
    name: '',
    email: '',
    role: 'multiplicador' as const,
    department: (currentUser?.role === 'pastor' || currentUser?.role === 'secretaria') 
      ? (departments[0]?.name || '') 
      : (currentUser?.department || departments[0]?.name || ''),
    function: 'Auxiliar'
  };

  const [form, setForm] = useState(defaultFormState);

  const handleOpenModal = (multiplier?: any) => {
    if (multiplier) {
      setEditingId(multiplier.id);
      setForm({
        name: multiplier.name,
        email: multiplier.email,
        role: 'multiplicador',
        department: multiplier.department || departments[0]?.name || '',
        function: multiplier.function || 'Auxiliar'
      });
    } else {
      setEditingId(null);
      setForm(defaultFormState);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (editingId) {
      updateUser(editingId, form);
      toast.success('Multiplicador atualizado com sucesso!');
    } else {
      addUser(form);
      toast.success('Multiplicador adicionado com sucesso!');
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteUser(deleteConfirmId);
      toast.success('Multiplicador removido com sucesso!');
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Multiplicadores & Auxiliares</h2>
          <p className="text-slate-500 mt-1">
            {currentUser?.role === 'pastor' 
              ? 'Acompanhe todos os multiplicadores da igreja.' 
              : `Multiplicadores do departamento ${currentUser?.department}.`}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleOpenModal()}
            className="bg-gradient-primary text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all flex items-center gap-2 font-bold shadow-lg shadow-primary-start/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Novo Multiplicador
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'Total de Multiplicadores', value: totalMultipliers, icon: Zap, color: 'orange' },
          { label: 'Membros no Departamento', value: totalMembersInDept, icon: Users, color: 'emerald' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all"
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
              stat.color === 'orange' ? "bg-orange-50 text-orange-600" :
              "bg-emerald-50 text-emerald-600"
            )}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-display font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Multipliers List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-500" />
            Equipe de Apoio
          </h3>
          <div className="relative w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary-start transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all text-sm font-medium shadow-sm"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {multipliers.map((m, index) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary-start/5 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(m)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(m.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-start gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-slate-50 to-slate-100 flex items-center justify-center text-2xl font-display font-bold text-primary-start border-2 border-white shadow-inner">
                      {m.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center border-4 border-white shadow-lg">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-display font-bold text-slate-900 mb-1">{m.name}</h4>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg w-fit">
                        {m.function || 'Auxiliar'}
                      </span>
                      <span className="text-xs font-medium text-slate-400">{m.department}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-500 px-3">
                  <Mail className="w-4 h-4 text-slate-300" />
                  <span className="truncate font-medium">{m.email}</span>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => handleOpenModal(m)}
                    className="flex-1 px-6 py-3.5 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    Editar Perfil
                  </button>
                  <button 
                    className="flex-1 px-6 py-3.5 bg-primary-start/10 text-primary-start rounded-2xl hover:bg-primary-start hover:text-white transition-all font-bold text-sm flex items-center justify-center gap-2 group/zap"
                  >
                    <Zap className="w-4 h-4 group-hover:animate-pulse" /> Atividades
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal Adicionar/Editar Multiplicador */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-50">
                <h3 className="text-2xl font-display font-bold text-slate-900">
                  {editingId ? 'Editar Multiplicador' : 'Novo Multiplicador'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo *</label>
                    <input 
                      type="text" 
                      required
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="Ex: Sarah Lima"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                    <input 
                      type="email" 
                      required
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="email@exemplo.com"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Função</label>
                    <input 
                      type="text" 
                      value={form.function}
                      onChange={e => setForm({...form, function: e.target.value})}
                      placeholder="Ex: Auxiliar de Louvor"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Departamento</label>
                    <select 
                      value={form.department}
                      disabled={currentUser?.role !== 'pastor' && currentUser?.role !== 'secretaria'}
                      onChange={e => setForm({...form, department: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-bold text-slate-700 disabled:opacity-60"
                    >
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-all font-bold shadow-lg shadow-primary-start/20 active:scale-95"
                  >
                    Salvar Multiplicador
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Remover Multiplicador?"
        message="Essa ação removerá o acesso deste multiplicador ao sistema."
        confirmText="Sim, remover"
        cancelText="Não, manter"
      />
    </div>
  );
}
