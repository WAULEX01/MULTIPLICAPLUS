import React from 'react';
import { HeartHandshake, Search, Calendar, UserPlus, Filter, ArrowRight, CheckCircle2, Clock, BookOpen, Waves, UserCheck, MoreVertical, MessageCircle, Phone } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function NewConverts() {
  const { members } = useAppContext();
  const newConverts = members.filter(m => m.isNewConvert || m.isIntegration);
  const navigate = useNavigate();

  // Updated status logic based on user requirements
  const getStatusInfo = (member: any) => {
    if (member.isBaptized) {
      return { label: 'Batizado', color: 'emerald', icon: Waves, progress: 100 };
    }
    if (member.isIntegration) {
      return { label: 'Em Integração', color: 'amber', icon: UserPlus, progress: 50 };
    }
    return { label: 'Novo Membro', color: 'blue', icon: Clock, progress: 25 };
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Novos Convertidos</h2>
          <p className="text-slate-500 mt-1">Acompanhe a jornada de integração e discipulado.</p>
        </div>
        <button 
          onClick={() => navigate('/membros')}
          className="bg-gradient-primary text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all flex items-center gap-2 font-bold shadow-lg shadow-primary-start/20 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Registrar Novo
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-start transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar novo convertido..."
            className="w-full bg-white border border-slate-100 text-slate-800 pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all text-sm font-medium shadow-sm"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-600 shadow-sm">
            <Filter className="w-4 h-4" /> Filtros
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-600 shadow-sm">
            <Calendar className="w-4 h-4" /> Período
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {newConverts.map((member, index) => {
            const status = getStatusInfo(member);
            const StatusIcon = status.icon;

            return (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary-start/5 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-50 to-slate-100 flex items-center justify-center text-xl font-display font-bold text-primary-start border-2 border-white shadow-inner">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-display font-bold text-slate-900 leading-tight">{member.name}</h4>
                      <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> {new Date(member.joinDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Status Card */}
                <div className={cn(
                  "rounded-3xl p-5 mb-6 flex items-center gap-4 border",
                  status.color === 'blue' ? "bg-blue-50/50 border-blue-100 text-blue-700" :
                  status.color === 'purple' ? "bg-purple-50/50 border-purple-100 text-purple-700" :
                  status.color === 'emerald' ? "bg-emerald-50/50 border-emerald-100 text-emerald-700" :
                  "bg-amber-50/50 border-amber-100 text-amber-700"
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                    status.color === 'blue' ? "bg-blue-500 text-white" :
                    status.color === 'purple' ? "bg-purple-500 text-white" :
                    status.color === 'emerald' ? "bg-emerald-500 text-white" :
                    "bg-amber-500 text-white"
                  )}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Atual</p>
                    <p className="font-bold text-base">{status.label}</p>
                  </div>
                </div>

                {/* Integration Timeline/Progress */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jornada de Integração</span>
                    <span className="text-sm font-black text-slate-900">{status.progress}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${status.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        status.color === 'blue' ? "bg-blue-500" :
                        status.color === 'purple' ? "bg-purple-500" :
                        status.color === 'emerald' ? "bg-emerald-500" :
                        "bg-amber-500"
                      )}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Início</span>
                    <span>Integração</span>
                    <span>Batismo</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 px-4 py-3.5 bg-primary-start/10 text-primary-start rounded-2xl hover:bg-primary-start hover:text-white transition-all font-bold text-sm flex items-center justify-center gap-2 group/btn"
                  >
                    <HeartHandshake className="w-4 h-4 group-hover:scale-110 transition-transform" /> Acompanhar
                  </button>
                  <div className="flex gap-2">
                    <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-500 transition-all">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-all">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {newConverts.length === 0 && (
          <div className="col-span-full p-20 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartHandshake className="w-12 h-12 text-slate-200" />
            </div>
            <h4 className="text-xl font-display font-bold text-slate-800 mb-2">Nenhum novo convertido</h4>
            <p className="text-slate-400 max-w-sm mx-auto">Comece registrando novas decisões para acompanhar a jornada de integração.</p>
            <button 
              onClick={() => navigate('/membros')}
              className="mt-8 px-8 py-3.5 bg-primary-start text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary-start/20"
            >
              Registrar Primeira Decisão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
