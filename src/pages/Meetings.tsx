import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Users, Plus, Trash2, Bell, Shield, User as UserIcon, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { format, isAfter, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export function Meetings() {
  const { meetings, addMeeting, deleteMeeting, departments } = useAppContext();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '19:30',
    department: user?.role === 'pastor' ? 'Geral' : user?.department || '',
    description: ''
  });

  const canSchedule = user?.role === 'pastor' || user?.role === 'lider';

  const filteredMeetings = useMemo(() => {
    if (user?.role === 'pastor' || user?.role === 'secretaria') return meetings;
    return meetings.filter(m => m.department === 'Geral' || m.department === user?.department);
  }, [meetings, user]);

  const upcomingMeetings = filteredMeetings
    .filter(m => isAfter(parseISO(`${m.date}T${m.time}`), new Date()))
    .sort((a, b) => parseISO(`${a.date}T${a.time}`).getTime() - parseISO(`${b.date}T${b.time}`).getTime());

  const pastMeetings = filteredMeetings
    .filter(m => !isAfter(parseISO(`${m.date}T${m.time}`), new Date()))
    .sort((a, b) => parseISO(`${b.date}T${b.time}`).getTime() - parseISO(`${a.date}T${a.time}`).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    await addMeeting({
      ...newMeeting,
      createdBy: user?.id || 'unknown'
    });
    setIsModalOpen(false);
    setNewMeeting({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '19:30',
      department: user?.role === 'pastor' ? 'Geral' : user?.department || '',
      description: ''
    });
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Reuniões e Avisos</h2>
          <p className="text-slate-500 mt-1">Agende e acompanhe as reuniões da igreja.</p>
        </div>
        {canSchedule && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-primary text-white px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm font-bold shadow-lg shadow-primary-start/20 flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Agendar Reunião
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-start" />
              Próximas Reuniões
            </h3>
            <div className="space-y-4">
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.map((meeting, i) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className={cn(
                      "absolute top-0 left-0 w-1.5 h-full",
                      meeting.department === 'Geral' ? "bg-primary-start" : "bg-purple-500"
                    )} />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            meeting.department === 'Geral' ? "bg-primary-start/10 text-primary-start" : "bg-purple-50 text-purple-600"
                          )}>
                            {meeting.department}
                          </span>
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(meeting.date), "dd 'de' MMMM", { locale: ptBR })}
                          </span>
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {meeting.time}
                          </span>
                        </div>
                        <h4 className="text-xl font-display font-bold text-slate-900 group-hover:text-primary-start transition-colors">
                          {meeting.title}
                        </h4>
                        {meeting.description && (
                          <p className="text-sm text-slate-500 line-clamp-2">{meeting.description}</p>
                        )}
                      </div>
                      {user?.role === 'pastor' && (
                        <button 
                          onClick={() => deleteMeeting(meeting.id)}
                          className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Nenhuma reunião agendada no momento.</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-400 mb-6">Histórico de Reuniões</h3>
            <div className="space-y-3 opacity-60">
              {pastMeetings.slice(0, 5).map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-2xl p-4 border border-slate-100 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-700">{meeting.title}</h5>
                    <p className="text-xs text-slate-400">{format(parseISO(meeting.date), "dd/MM/yyyy")} às {meeting.time}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{meeting.department}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <Shield className="w-10 h-10 text-primary-start mb-6" />
            <h3 className="text-xl font-display font-bold mb-2">Regras de Agendamento</h3>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</div>
                O Pastor pode agendar reuniões Gerais ou por Departamento.
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</div>
                Líderes podem agendar apenas para seu próprio departamento.
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</div>
                Todos os membros do departamento recebem notificações automáticas.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Estatísticas</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total este mês</p>
                    <p className="text-xl font-display font-bold text-slate-900">{filteredMeetings.length}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Presença Média</p>
                    <p className="text-xl font-display font-bold text-slate-900">85%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Agendamento */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-8 sm:p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-display font-bold text-slate-900">Agendar Reunião</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Título da Reunião</label>
                    <input 
                      type="text"
                      required
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                      placeholder="Ex: Reunião de Líderes"
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary-start/5 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                      <input 
                        type="date"
                        required
                        value={newMeeting.date}
                        onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 focus:ring-4 focus:ring-primary-start/5 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                      <input 
                        type="time"
                        required
                        value={newMeeting.time}
                        onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 focus:ring-4 focus:ring-primary-start/5 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Departamento</label>
                    <select 
                      value={newMeeting.department}
                      onChange={(e) => setNewMeeting({...newMeeting, department: e.target.value})}
                      disabled={user?.role !== 'pastor'}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 focus:ring-4 focus:ring-primary-start/5 transition-all disabled:opacity-50"
                    >
                      {user?.role === 'pastor' && <option value="Geral">Geral (Todos)</option>}
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descrição (Opcional)</label>
                    <textarea 
                      value={newMeeting.description}
                      onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                      placeholder="Pauta da reunião..."
                      rows={3}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary-start/5 transition-all resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-primary text-white py-5 rounded-2xl font-bold shadow-xl shadow-primary-start/20 hover:opacity-90 transition-all active:scale-[0.98] mt-4"
                  >
                    Confirmar Agendamento
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
