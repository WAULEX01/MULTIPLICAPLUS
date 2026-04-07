import React, { useState, useMemo } from 'react';
import { Users, Search, Plus, ArrowRight, Filter, X, Trash2, Edit2, Calendar, Clock, User, MapPin, ChevronRight, Network } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from '../components/ConfirmModal';
import { cn } from '../lib/utils';

export function Departments() {
  const { departments, members, addDepartment, updateDepartment, deleteDepartment, users } = useAppContext();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const defaultDeptState = {
    name: '',
    description: '',
    leaderId: ''
  };
  
  const [deptForm, setDeptForm] = useState(defaultDeptState);

  const filteredDepts = useMemo(() => {
    return departments.filter(d => {
      // Role-based filtering: leaders/multipliers only see their own department
      if (user?.role === 'lider' || user?.role === 'multiplicador') {
        if (d.name !== user.department) return false;
      }

      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [departments, searchQuery, user]);

  const handleOpenModal = (dept?: any) => {
    if (dept) {
      setEditingId(dept.id);
      setDeptForm({
        name: dept.name,
        description: dept.description || '',
        leaderId: dept.leaderId || ''
      });
    } else {
      setEditingId(null);
      setDeptForm(defaultDeptState);
    }
    setIsModalOpen(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name) {
      toast.error('Preencha o nome do departamento');
      return;
    }
    
    if (editingId) {
      updateDepartment(editingId, deptForm);
      toast.success('Departamento atualizado com sucesso!');
    } else {
      addDepartment(deptForm);
      toast.success('Departamento criado com sucesso!');
    }
    
    setIsModalOpen(false);
    setDeptForm(defaultDeptState);
    setEditingId(null);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteDepartment(deleteConfirmId);
      toast.success('Departamento removido com sucesso!');
      setDeleteConfirmId(null);
    }
  };

  const canManage = user?.role === 'pastor' || user?.role === 'secretaria';

  return (
    <div className="space-y-8 relative pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Departamentos</h2>
          <p className="text-slate-500 mt-1">Gerencie os departamentos da igreja e suas lideranças.</p>
        </div>
        {canManage && (
          <button 
            onClick={() => handleOpenModal()}
            className="hidden md:flex bg-gradient-primary text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all items-center gap-2 font-bold shadow-lg shadow-primary-start/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Novo Departamento
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary-start transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar departamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all text-sm font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredDepts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Network className="w-10 h-10" />
              </div>
              <p className="text-slate-500 font-medium">Nenhum departamento encontrado.</p>
            </motion.div>
          ) : (
            filteredDepts.map((dept, index) => {
              const membersCount = members.filter(m => m.department === dept.name).length;
              const leader = users.find(u => u.id === dept.leaderId);

              return (
                <motion.div
                  key={dept.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary-start/5 transition-all group relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-start/10 to-primary-end/10 text-primary-start flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                        {dept.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-slate-900 text-xl leading-tight">{dept.name}</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">{dept.description}</p>
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(dept)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(dept.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Líder Responsável</p>
                        <p className="text-sm font-bold text-slate-700">{leader?.name || 'Não definido'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-600">{membersCount} Membros</span>
                    </div>
                    <button 
                      onClick={() => navigate('/membros', { state: { department: dept.name } })}
                      className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-primary-start hover:text-white transition-all group/btn"
                    >
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button for Mobile */}
      {canManage && (
        <button 
          onClick={() => handleOpenModal()}
          className="md:hidden fixed bottom-24 right-6 w-16 h-16 bg-gradient-primary text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      {/* Modal Adicionar/Editar Departamento */}
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
                  {editingId ? 'Editar Departamento' : 'Novo Departamento'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSaveDept} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Departamento *</label>
                    <input 
                      type="text" 
                      required
                      value={deptForm.name}
                      onChange={e => setDeptForm({...deptForm, name: e.target.value})}
                      placeholder="Ex: Jovens"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Descrição</label>
                    <textarea 
                      value={deptForm.description}
                      onChange={e => setDeptForm({...deptForm, description: e.target.value})}
                      placeholder="Breve descrição do departamento..."
                      rows={3}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Líder Responsável</label>
                    <select 
                      value={deptForm.leaderId}
                      onChange={e => setDeptForm({...deptForm, leaderId: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-bold text-slate-700"
                    >
                      <option value="">Selecione um líder</option>
                      {users.filter(u => u.role === 'lider').map(l => (
                         <option key={l.id} value={l.id}>{l.name}</option>
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
                    Salvar Departamento
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
        title="Remover Departamento?"
        message="Essa ação não pode ser desfeita. O departamento e seus vínculos serão removidos permanentemente."
        confirmText="Sim, remover"
        cancelText="Não, manter"
      />
    </div>
  );
}
