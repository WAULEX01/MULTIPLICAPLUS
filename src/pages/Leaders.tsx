import React, { useState } from 'react';
import { UserCog, Search, Plus, ArrowRight, Filter, Mail, Phone, X, Trash2, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from '../components/ConfirmModal';

export function Leaders() {
  const { users, addUser, updateUser, deleteUser, departments } = useAppContext();
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const leaders = users.filter(u => u.role === 'lider' && u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const defaultFormState = {
    name: '',
    email: '',
    role: 'lider' as const,
    department: departments[0]?.name || ''
  };

  const [form, setForm] = useState(defaultFormState);

  const handleOpenModal = (leader?: any) => {
    if (leader) {
      setEditingId(leader.id);
      setForm({
        name: leader.name,
        email: leader.email,
        role: 'lider',
        department: leader.department || departments[0]?.name || ''
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
      toast.success('Líder atualizado com sucesso!');
    } else {
      addUser(form);
      toast.success('Líder adicionado com sucesso!');
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteUser(deleteConfirmId);
      toast.success('Líder removido com sucesso!');
      setDeleteConfirmId(null);
    }
  };

  if (currentUser?.role !== 'pastor' && currentUser?.role !== 'secretaria') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <UserCog className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-900">Acesso Restrito</h2>
        <p className="text-slate-500 mt-2 max-w-md">Apenas o Pastor e a Secretaria Geral têm permissão para gerenciar os líderes de departamentos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Líderes</h2>
          <p className="text-slate-500 mt-1">Gestão de líderes de departamentos.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-gradient-primary text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all font-bold shadow-lg shadow-primary-start/20 flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Líder
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96 group">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-start transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar líder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 text-slate-800 pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {leaders.map((leader) => (
          <div key={leader.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button 
                onClick={() => handleOpenModal(leader)}
                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setDeleteConfirmId(leader.id)}
                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-primary-start flex items-center justify-center font-bold text-2xl shadow-inner border border-white">
                {leader.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-lg">{leader.name}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 mt-1">
                  Ativo
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <UserCog className="w-4 h-4 text-primary-start" />
                <span className="font-bold text-slate-700">{leader.department}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 px-3">
                <Mail className="w-4 h-4 text-slate-300" />
                <span className="truncate">{leader.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Adicionar/Editar Líder */}
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
                  {editingId ? 'Editar Líder' : 'Novo Líder'}
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
                      placeholder="Ex: Marcos Silva"
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
                    <label className="block text-sm font-bold text-slate-700 mb-2">Departamento</label>
                    <select 
                      value={form.department}
                      onChange={e => setForm({...form, department: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-bold text-slate-700"
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
                    Salvar Líder
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
        title="Remover Líder?"
        message="Essa ação removerá o acesso deste líder ao sistema."
        confirmText="Sim, remover"
        cancelText="Não, manter"
      />
    </div>
  );
}
