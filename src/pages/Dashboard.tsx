import React, { useMemo, useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  ChevronRight, 
  Activity,
  Zap,
  Star,
  Target,
  MessageCircle,
  Shield,
  UsersRound,
  AlertTriangle,
  Phone,
  Home,
  Award
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue}</>;
}

export function Dashboard() {
  const { members, users, attendance, departments } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const filteredMembers = useMemo(() => {
    if (user?.role === 'pastor' || user?.role === 'secretaria') return members;
    if (user?.role === 'lider' || user?.role === 'multiplicador') {
      return members.filter(m => m.department === user.department);
    }
    return [];
  }, [user, members]);

  const filteredAttendance = useMemo(() => {
    if (user?.role === 'pastor' || user?.role === 'secretaria') return attendance;
    if (user?.role === 'lider' || user?.role === 'multiplicador') {
      return attendance.filter(a => a.department === user.department);
    }
    return [];
  }, [user, attendance]);
  
  const totalMembers = filteredMembers.length;
  const totalDepartments = (user?.role === 'pastor' || user?.role === 'secretaria') ? departments.length : 1;
  const totalLeaders = (user?.role === 'pastor' || user?.role === 'secretaria') ? users.filter(u => u.role === 'lider').length : (user?.role === 'lider' ? 1 : 0);
  
  const { novatosCount, veteranosCount } = useMemo(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const novatos = filteredMembers.filter(m => {
      const joinDate = new Date(m.joinDate);
      return joinDate >= threeMonthsAgo || m.isNewConvert;
    }).length;
    
    return {
      novatosCount: novatos,
      veteranosCount: totalMembers - novatos
    };
  }, [filteredMembers, totalMembers]);

  const attendanceData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days.map((day, index) => {
      const dayRecords = filteredAttendance.filter(record => {
        const date = new Date(record.date + 'T12:00:00Z');
        return date.getUTCDay() === index;
      });
      
      const present = dayRecords.filter(r => r.present).length;
      return { name: day, present };
    });
  }, [filteredAttendance]);

  // Radar Inteligente Logic
  const radarData = useMemo(() => {
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    return filteredMembers.map(member => {
      const memberAttendance = attendance
        .filter(a => a.memberId === member.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let absences = 0;
      if (memberAttendance.length > 0) {
        // Count consecutive absences from the most recent record
        for (const record of memberAttendance) {
          if (!record.present) absences++;
          else break;
        }
      } else {
        // If no attendance records, assume they've been absent since joining
        const joinDate = new Date(member.joinDate);
        const weeksSinceJoining = Math.floor((now.getTime() - joinDate.getTime()) / oneWeek);
        absences = Math.max(0, weeksSinceJoining);
      }

      let action = '';
      let color = '';
      let icon = null;
      let alertColor = '';

      if (absences >= 3) {
        action = 'Visitar';
        color = 'text-rose-600 bg-rose-50 border-rose-100';
        icon = Home;
        alertColor = 'bg-rose-500';
      } else if (absences === 2) {
        action = 'Ligar';
        color = 'text-orange-600 bg-orange-50 border-orange-100';
        icon = Phone;
        alertColor = 'bg-orange-500';
      } else if (absences === 1) {
        action = 'Enviar mensagem';
        color = 'text-amber-600 bg-amber-50 border-amber-100';
        icon = MessageCircle;
        alertColor = 'bg-amber-500';
      }

      return {
        ...member,
        absences,
        action,
        color,
        icon,
        alertColor
      };
    }).filter(m => m.absences > 0 && m.isActive).sort((a, b) => b.absences - a.absences);
  }, [filteredMembers, attendance]);

  const getRoleColor = () => {
    if (!user) return 'from-blue-500 to-blue-600';
    switch (user.role) {
      case 'pastor': return 'from-blue-500 to-blue-600';
      case 'lider': return 'from-emerald-500 to-emerald-600';
      case 'multiplicador': return 'from-orange-500 to-orange-600';
      case 'secretaria': return 'from-purple-500 to-purple-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getRoleBg = () => {
    if (!user) return 'bg-blue-50';
    switch (user.role) {
      case 'pastor': return 'bg-blue-50';
      case 'lider': return 'bg-emerald-50';
      case 'multiplicador': return 'bg-orange-50';
      case 'secretaria': return 'bg-purple-50';
      default: return 'bg-blue-50';
    }
  };

  const getWelcomeMessage = () => {
    if (!user) return 'E aí!';
    const firstName = user.name.split(' ')[0];
    const lastName = user.name.split(' ').length > 1 ? user.name.split(' ')[1] : '';
    
    if (user.role === 'pastor') return `E aí, Pastor ${lastName || firstName}! 👋`;
    if (user.role === 'lider') return `E aí, Líder ${lastName || firstName}! 👋`;
    if (user.role === 'secretaria') return `E aí, ${firstName}! 👋`;
    return `E aí, Multiplicador ${lastName || firstName}! 👋`;
  };

  const getWelcomeSub = () => {
    if (user?.role === 'pastor' || user?.role === 'secretaria') return 'Veja como está o crescimento da sua rede hoje.';
    if (user?.role === 'lider') return `Acompanhe o crescimento do departamento ${user.department}.`;
    return `Veja suas atividades e o departamento ${user.department}.`;
  };

  const stats = [
    { 
      label: 'Membros', 
      value: totalMembers, 
      icon: Users, 
      color: getRoleColor(), 
      trend: '+12%',
      bg: getRoleBg()
    },
    { 
      label: (user?.role === 'pastor' || user?.role === 'secretaria') ? 'Departamentos' : 'Meu Departamento', 
      value: totalDepartments, 
      icon: (user?.role === 'pastor' || user?.role === 'secretaria') ? Activity : UsersRound, 
      color: 'from-purple-500 to-purple-600', 
      trend: (user?.role === 'pastor' || user?.role === 'secretaria') ? 'Ativos' : 'Ativo',
      bg: 'bg-purple-50'
    },
    { 
      label: (user?.role === 'pastor' || user?.role === 'secretaria') ? 'Líderes' : (user?.role === 'lider' ? 'Minha Liderança' : 'Função'), 
      value: user?.role === 'multiplicador' ? 1 : totalLeaders, 
      icon: user?.role === 'multiplicador' ? Zap : Star, 
      color: 'from-emerald-500 to-emerald-600', 
      trend: (user?.role === 'pastor' || user?.role === 'secretaria') ? '+2' : 'OK',
      bg: 'bg-emerald-50'
    },
    { 
      label: 'Novatos', 
      value: novatosCount, 
      icon: Zap, 
      color: 'from-orange-500 to-orange-600', 
      trend: 'Recentes',
      bg: 'bg-orange-50'
    },
    { 
      label: 'Veteranos', 
      value: veteranosCount, 
      icon: Award, 
      color: 'from-blue-500 to-blue-600', 
      trend: 'Antigos',
      bg: 'bg-blue-50'
    },
  ];

  const quickActions = [
    { label: 'Nova Chamada', icon: CheckCircle2, path: '/presenca', color: 'text-emerald-600', bg: 'bg-emerald-50', roles: ['pastor', 'lider', 'multiplicador', 'secretaria'] },
    { label: 'Novo Membro', icon: UserPlus, path: '/membros', color: 'text-blue-600', bg: 'bg-blue-50', roles: ['pastor', 'lider', 'secretaria'] },
    { label: 'Mensagens', icon: MessageCircle, path: '/mensagens', color: 'text-purple-600', bg: 'bg-purple-50', roles: ['pastor', 'lider'] },
    { label: 'Relatórios', icon: Target, path: '/relatorios', color: 'text-orange-600', bg: 'bg-orange-50', roles: ['pastor', 'lider', 'secretaria'] },
  ].filter(action => action.roles.includes(user?.role || ''));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{getWelcomeMessage()}</h2>
          <p className="text-slate-500 mt-1">{getWelcomeSub()}</p>
        </div>
        <div className="flex gap-3">
          {(user?.role === 'pastor' || user?.role === 'secretaria' || user?.role === 'lider') && (
            <button 
              onClick={() => navigate('/relatorios')}
              className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              Relatórios
            </button>
          )}
          <button 
            onClick={() => navigate('/presenca')}
            className={cn("text-white px-6 py-2.5 rounded-2xl hover:opacity-90 transition-all text-sm font-semibold shadow-lg flex items-center gap-2 active:scale-95", user?.role === 'pastor' ? 'bg-gradient-primary shadow-primary-start/20' : (user?.role === 'lider' ? 'bg-emerald-600 shadow-emerald-600/20' : (user?.role === 'secretaria' ? 'bg-purple-600 shadow-purple-600/20' : 'bg-orange-600 shadow-orange-600/20')))}
          >
            <Calendar className="w-4 h-4" />
            Nova Reunião
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group cursor-default"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl text-white bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-display font-bold text-slate-900 mt-1">
              <AnimatedNumber value={stat.value} />
            </p>
          </motion.div>
        ))}
      </div>

      {/* Radar Inteligente */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900">Radar Inteligente dos Faltosos</h3>
          </div>
          <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs font-bold border border-rose-100">
            {radarData.length} Alertas Ativos
          </span>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Membro</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Departamento</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Faltas</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ação Recomendada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {radarData.slice(0, 5).map((m, i) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm",
                          m.alertColor
                        )}>
                          {m.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                        {m.department}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          m.alertColor
                        )} />
                        <span className="font-bold text-slate-900">{m.absences} semanas</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all group-hover:scale-105",
                        m.color
                      )}>
                        {m.icon && React.createElement(m.icon as any, { className: "w-4 h-4" })}
                        {m.action}
                      </div>
                    </td>
                  </tr>
                ))}
                {radarData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      </div>
                      <p className="text-slate-500 font-bold">Nenhum alerta no momento!</p>
                      <p className="text-slate-400 text-sm">Todos os membros estão frequentes.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {radarData.length > 5 && (
            <div className="p-6 bg-slate-50/50 border-t border-slate-50 text-center">
              <button className="text-primary-start font-black text-xs uppercase tracking-widest hover:underline">
                Ver todos os {radarData.length} alertas
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900">Engajamento Semanal</h3>
              <p className="text-sm text-slate-500">Presença média nas reuniões</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-4 py-2 focus:outline-none focus:ring-4 focus:ring-primary-start/5 transition-all">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={user?.role === 'pastor' ? '#3b82f6' : (user?.role === 'lider' ? '#10b981' : '#f97316')} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={user?.role === 'pastor' ? '#3b82f6' : (user?.role === 'lider' ? '#10b981' : '#f97316')} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ fontWeight: 700, color: '#0f172a' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="present" 
                  stroke={user?.role === 'pastor' ? '#3b82f6' : (user?.role === 'lider' ? '#10b981' : '#f97316')} 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorPresent)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Lists */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold text-slate-900">Novos Rostos</h3>
              <button 
                onClick={() => navigate('/membros')}
                className="text-primary-start hover:underline text-xs font-bold flex items-center gap-1"
              >
                Ver todos <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {filteredMembers.slice(-4).reverse().map(member => (
                <div key={member.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm group-hover:bg-primary-start group-hover:text-white transition-all">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.department}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-start group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>

          <div className={cn("rounded-3xl p-8 text-white relative overflow-hidden shadow-xl", user?.role === 'pastor' ? 'bg-gradient-primary shadow-primary-start/20' : (user?.role === 'lider' ? 'bg-emerald-600 shadow-emerald-600/20' : (user?.role === 'secretaria' ? 'bg-purple-600 shadow-purple-600/20' : 'bg-orange-600 shadow-orange-600/20')))}>
            <div className="relative z-10">
              <h3 className="text-xl font-display font-bold mb-2">Meta de Crescimento</h3>
              <p className="text-white/80 text-sm mb-6">Estamos quase lá! Faltam apenas 15 novos membros para a meta do semestre.</p>
              <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                <div className="bg-white h-full rounded-full" style={{ width: '70%' }}></div>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span>70 Membros</span>
                <span>Meta: 100</span>
              </div>
            </div>
            <Star className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
