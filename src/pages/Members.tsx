import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Search, Filter, Plus, MoreVertical, X, Edit2, Phone, Calendar, Users as UsersIcon, Trash2, UserCheck, Star, Zap, Scan, Camera, ShieldCheck, RefreshCw, Download, Upload, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmModal } from '../components/ConfirmModal';
import { cn } from '../lib/utils';
import Webcam from 'react-webcam';
import * as XLSX from 'xlsx';

export function Members() {
  const { members, users, addMember, updateMember, deleteMember, departments } = useAppContext();
  const { user } = useAuth();
  const [filterDept, setFilterDept] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBiometryModalOpen, setIsBiometryModalOpen] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'idle' | 'capturing' | 'success'>('idle');
  const [capturedSamples, setCapturedSamples] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedMemberForBiometry, setSelectedMemberForBiometry] = useState<any>(null);
  
  const webcamRef = useRef<Webcam>(null);

  const defaultMemberState = {
    name: '',
    phone: '',
    department: user?.role === 'pastor' || user?.role === 'secretaria' ? '' : (user?.department || ''),
    isNewConvert: false,
    joinDate: new Date().toISOString().split('T')[0],
    plan: '',
    isActive: true
  };
  
  const [memberForm, setMemberForm] = useState(defaultMemberState);

  const downloadTemplate = () => {
    const template = [
      { Nome: 'João Silva', Telefone: '11999999999', Departamento: 'Jovens', Plano: 'Plano A', Ativo: 'Sim' },
      { Nome: 'Maria Oliveira', Telefone: '11888888888', Departamento: 'Adultos', Plano: 'Plano B', Ativo: 'Não' }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "modelo_membros.xlsx");
  };

  const handleImportSpreadsheet = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        let count = 0;
        data.forEach(row => {
          const newMember = {
            name: row.Nome || row.name || '',
            phone: row.Telefone || row.phone || '',
            department: row.Departamento || row.department || '',
            plan: row.Plano || row.plan || '',
            isActive: (row.Ativo || row.active || 'Sim').toString().toLowerCase() === 'sim' || row.active === true,
            isNewConvert: false,
            joinDate: new Date().toISOString().split('T')[0]
          };
          if (newMember.name && newMember.phone) {
            addMember(newMember);
            count++;
          }
        });
        toast.success(`${count} membros importados com sucesso!`);
      } catch (err) {
        toast.error('Erro ao processar planilha. Verifique o formato.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // Role-based filtering
      if (user?.role === 'lider' || user?.role === 'multiplicador') {
        if (m.department !== user.department) return false;
      }

      const matchesDept = filterDept ? m.department === filterDept : true;
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [members, filterDept, searchQuery, user]);

  const handleOpenModal = (member?: any) => {
    if (member) {
      setEditingId(member.id);
      setMemberForm({
        name: member.name,
        phone: member.phone,
        department: member.department,
        isNewConvert: member.isNewConvert || false,
        joinDate: member.joinDate || new Date().toISOString().split('T')[0],
        plan: member.plan || '',
        isActive: member.isActive ?? true
      });
    } else {
      setEditingId(null);
      setMemberForm(defaultMemberState);
    }
    setIsModalOpen(true);
  };

  const handleOpenBiometryModal = (member: any) => {
    setSelectedMemberForBiometry(member);
    setEnrollmentStatus('idle');
    setCapturedSamples(0);
    setIsBiometryModalOpen(true);
  };

  const startEnrollment = () => {
    setEnrollmentStatus('capturing');
    // Simulate capturing 5 samples
    let samples = 0;
    const interval = setInterval(() => {
      samples += 1;
      setCapturedSamples(samples);
      if (samples >= 5) {
        clearInterval(interval);
        setEnrollmentStatus('success');
        toast.success(`Biometria cadastrada para ${selectedMemberForBiometry.name}`);
      }
    }, 800);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.phone) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    
    if (editingId) {
      updateMember(editingId, memberForm);
      toast.success('Membro atualizado com sucesso!');
    } else {
      addMember(memberForm);
      toast.success('Membro adicionado com sucesso!');
    }
    
    setIsModalOpen(false);
    setMemberForm(defaultMemberState);
    setEditingId(null);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteMember(deleteConfirmId);
      toast.success('Membro removido com sucesso!');
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-8 relative pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Membros</h2>
          <p className="text-slate-500 mt-1">Gerencie a galera da sua rede com facilidade.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm shadow-sm"
          >
            <Download className="w-4 h-4" />
            Modelo
          </button>
          <label className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm shadow-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleImportSpreadsheet} />
          </label>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-gradient-primary text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all flex items-center gap-2 font-bold shadow-lg shadow-primary-start/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Novo Membro
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary-start transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all text-sm font-medium shadow-sm"
          />
        </div>
        <div className="relative min-w-[240px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select 
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all appearance-none text-sm font-bold text-slate-700 shadow-sm"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="">Todos os Departamentos</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMembers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <UsersIcon className="w-10 h-10" />
              </div>
              <p className="text-slate-500 font-medium">Nenhum membro encontrado por aqui.</p>
            </motion.div>
          ) : (
            filteredMembers.map((member, index) => {
              return (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary-start/5 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button 
                      onClick={() => handleOpenBiometryModal(member)}
                      title="Cadastrar Biometria"
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      <Scan className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleOpenModal(member)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(member.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-slate-50 to-slate-100 flex items-center justify-center text-2xl font-display font-bold text-primary-start border-2 border-white shadow-inner mb-4 group-hover:scale-110 transition-transform">
                      {member.name.charAt(0)}
                    </div>
                    
                    <h3 className="text-lg font-display font-bold text-slate-900 mb-1">{member.name}</h3>
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        member.department === 'Jovens' ? "bg-purple-100 text-purple-700" :
                        member.department === 'Líderes' ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {member.department}
                      </span>
                      {member.isActive ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Inativo
                        </span>
                      )}
                      {member.plan && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                          {member.plan}
                        </span>
                      )}
                      {member.isNewConvert && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Novo
                        </span>
                      )}
                    </div>

                    <div className="w-full space-y-2 text-sm text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4 text-slate-300" />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => handleOpenModal()}
        className="md:hidden fixed bottom-24 right-6 w-16 h-16 bg-gradient-primary text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Modal Biometria (Enrollment) */}
      <AnimatePresence>
        {isBiometryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBiometryModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                    <Scan className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-slate-900">Cadastro Biométrico</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedMemberForBiometry?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsBiometryModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden relative border-4 border-slate-50 shadow-inner">
                  {enrollmentStatus !== 'success' ? (
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      className="w-full h-full object-cover"
                      mirrored={true}
                      onUserMedia={() => {}}
                      onUserMediaError={() => {}}
                      disablePictureInPicture={true}
                      forceScreenshotSourceSize={false}
                      imageSmoothing={true}
                      screenshotQuality={0.92}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-500 text-white space-y-4">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                        <ShieldCheck className="w-12 h-12" />
                      </div>
                      <h4 className="text-2xl font-display font-bold">Sucesso!</h4>
                      <p className="text-white/80 font-medium">Biometria cadastrada com sucesso.</p>
                    </div>
                  )}

                  {enrollmentStatus === 'capturing' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
                      <div className="w-48 h-48 border-2 border-dashed border-white/50 rounded-full animate-pulse flex items-center justify-center">
                        <div className="w-40 h-40 border-2 border-white rounded-full flex items-center justify-center">
                          <RefreshCw className="w-10 h-10 text-white animate-spin" />
                        </div>
                      </div>
                      <div className="mt-8 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                        <p className="text-white font-bold text-sm">Capturando amostras: {capturedSamples}/5</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-primary-start" /> Instruções de Captura
                    </h5>
                    <ul className="text-sm text-slate-500 space-y-2 list-disc list-inside">
                      <li>Certifique-se de que o ambiente esteja bem iluminado.</li>
                      <li>Mantenha o rosto centralizado no círculo.</li>
                      <li>Remova óculos escuros ou acessórios que cubram o rosto.</li>
                      <li>O sistema capturará 5 amostras para maior precisão.</li>
                    </ul>
                  </div>

                  {enrollmentStatus === 'idle' && (
                    <button 
                      onClick={startEnrollment}
                      className="w-full bg-gradient-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary-start/20 active:scale-95"
                    >
                      Iniciar Captura
                    </button>
                  )}
                  
                  {enrollmentStatus === 'success' && (
                    <button 
                      onClick={() => setIsBiometryModalOpen(false)}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Adicionar/Editar Membro */}
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
                  {editingId ? 'Editar Membro' : 'Novo Membro'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSaveMember} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo *</label>
                    <input 
                      type="text" 
                      required
                      value={memberForm.name}
                      onChange={e => setMemberForm({...memberForm, name: e.target.value})}
                      placeholder="Ex: João das Neves"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Telefone *</label>
                    <input 
                      type="text" 
                      required
                      value={memberForm.phone}
                      onChange={e => setMemberForm({...memberForm, phone: e.target.value})}
                      placeholder="(00) 00000-0000"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Departamento</label>
                    <select 
                      value={memberForm.department}
                      disabled={user?.role !== 'pastor' && user?.role !== 'secretaria'}
                      onChange={e => setMemberForm({...memberForm, department: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-bold text-slate-700 disabled:opacity-60"
                    >
                      <option value="">Selecionar departamento</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Plano</label>
                    <input 
                      type="text" 
                      value={memberForm.plan}
                      onChange={e => setMemberForm({...memberForm, plan: e.target.value})}
                      placeholder="Ex: Plano Ouro"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all font-medium"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <input 
                      type="checkbox" 
                      id="newConvert"
                      checked={memberForm.isNewConvert}
                      onChange={e => setMemberForm({...memberForm, isNewConvert: e.target.checked})}
                      className="w-5 h-5 text-primary-start rounded-lg border-slate-300 focus:ring-primary-start"
                    />
                    <label htmlFor="newConvert" className="text-sm font-bold text-emerald-800 cursor-pointer flex items-center gap-2">
                      <Zap className="w-4 h-4" /> É novo convertido?
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={memberForm.isActive}
                      onChange={e => setMemberForm({...memberForm, isActive: e.target.checked})}
                      className="w-5 h-5 text-primary-start rounded-lg border-slate-300 focus:ring-primary-start"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-blue-800 cursor-pointer flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Membro Ativo?
                    </label>
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
                    Salvar Membro
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
        title="Remover Membro?"
        message="Essa ação não pode ser desfeita. O membro será removido permanentemente da base de dados."
        confirmText="Sim, remover"
        cancelText="Não, manter"
      />
    </div>
  );
}
