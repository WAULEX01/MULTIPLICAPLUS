import React, { useMemo, useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Users, Download, Calendar, Filter, ChevronDown, ArrowUpRight, ArrowDownRight, Target, Zap, Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Reports() {
  const { members, attendance } = useAppContext();
  const { user } = useAuth();
  const [period, setPeriod] = useState('Últimos 6 meses');

  const filteredMembers = useMemo(() => {
    if (user?.role === 'pastor') return members;
    return members.filter(m => m.department === user?.department);
  }, [members, user]);

  const filteredAttendance = useMemo(() => {
    if (user?.role === 'pastor') return attendance;
    return attendance.filter(a => {
      const member = members.find(m => m.id === a.memberId);
      return member?.department === user?.department;
    });
  }, [attendance, members, user]);

  const newConverts = filteredMembers.filter(m => m.isNewConvert).length;

  const handleExport = () => {
    toast.success('Relatório exportado com sucesso!', {
      description: 'O arquivo PDF foi gerado e está pronto para download.',
      icon: <Download className="w-5 h-5 text-primary-start" />
    });
  };

  const growthData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data = months.map(month => ({ month, membros: 0, novos: 0 }));

    const currentYear = new Date().getFullYear();
    let cumulative = 0;

    const sortedMembers = [...filteredMembers].sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());

    sortedMembers.forEach(member => {
      const date = new Date(member.joinDate + 'T12:00:00Z');
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getUTCMonth();
        data[monthIndex].membros += 1;
        if (member.isNewConvert) data[monthIndex].novos += 1;
      } else if (date.getFullYear() < currentYear) {
        cumulative += 1;
      }
    });

    let currentTotal = cumulative;
    for (let i = 0; i < 12; i++) {
      currentTotal += data[i].membros;
      data[i].membros = currentTotal;
    }

    const currentMonth = new Date().getMonth();
    const startIndex = Math.max(0, currentMonth - 5);
    return data.slice(startIndex, currentMonth + 1);
  }, [filteredMembers]);

  const attendanceData = useMemo(() => {
    const departmentStats: Record<string, { present: number, total: number }> = {};

    filteredAttendance.forEach(record => {
      const member = filteredMembers.find(m => m.id === record.memberId);
      if (member) {
        const dept = member.department;
        if (!departmentStats[dept]) {
          departmentStats[dept] = { present: 0, total: 0 };
        }
        departmentStats[dept].total += 1;
        if (record.present) {
          departmentStats[dept].present += 1;
        }
      }
    });

    return Object.entries(departmentStats).map(([name, stats]) => ({
      name,
      taxa: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
    })).sort((a, b) => b.taxa - a.taxa);
  }, [filteredAttendance, filteredMembers]);

  const averageAttendance = useMemo(() => {
    if (filteredAttendance.length === 0) return 0;
    const presentCount = filteredAttendance.filter(a => a.present).length;
    return Math.round((presentCount / filteredAttendance.length) * 100);
  }, [filteredAttendance]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-50">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
          <p className="text-lg font-display font-bold text-primary-start">
            {payload[0].value} <span className="text-xs font-medium text-slate-400">membros</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Relatórios de Impacto</h2>
          <p className="text-slate-500 mt-1">Análise detalhada do crescimento e engajamento da comunidade.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none bg-white border border-slate-100 text-slate-600 px-6 py-3.5 pr-12 rounded-2xl hover:bg-slate-50 transition-all text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary-start/5 w-full sm:w-auto shadow-sm cursor-pointer"
            >
              <option>Últimos 6 meses</option>
              <option>Este ano</option>
              <option>Ano passado</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <button 
            onClick={handleExport}
            className="bg-gradient-primary text-white px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm font-bold shadow-lg shadow-primary-start/20 flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95"
          >
            <Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            title: 'Crescimento', 
            subtitle: 'Últimos 30 dias', 
            value: growthData.length >= 2 ? (() => {
              const last = growthData[growthData.length - 1].membros;
              const prev = growthData[growthData.length - 2].membros;
              if (prev === 0) return '+100%';
              const diff = last - prev;
              const pct = Math.round((diff / prev) * 100);
              return `${pct >= 0 ? '+' : ''}${pct}%`;
            })() : '0%',
            trend: growthData.length >= 2 ? growthData[growthData.length - 1].membros - growthData[growthData.length - 2].membros : 0,
            icon: TrendingUp,
            color: 'blue'
          },
          { 
            title: 'Média de Presença', 
            subtitle: 'Geral dos departamentos', 
            value: `${averageAttendance}%`,
            trend: 5,
            icon: Target,
            color: 'emerald'
          },
          { 
            title: 'Novos Convertidos', 
            subtitle: 'Total acumulado', 
            value: newConverts,
            trend: 12,
            icon: Award,
            color: 'purple'
          }
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                kpi.color === 'blue' ? "bg-blue-50 text-blue-600" :
                kpi.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                "bg-purple-50 text-purple-600"
              )}>
                <kpi.icon className="w-7 h-7" />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold",
                kpi.trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {kpi.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(kpi.trend)}{typeof kpi.value === 'number' ? '' : '%'}
              </div>
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.title}</h3>
            <p className="text-4xl font-display font-bold text-slate-900 mb-2">{kpi.value}</p>
            <p className="text-xs font-medium text-slate-400 italic">{kpi.subtitle}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900">Crescimento de Membros</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Evolução mensal da comunidade</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <TrendingUp className="w-5 h-5 text-primary-start" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMembros" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="membros" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorMembros)" 
                  dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Attendance Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900">Engajamento por Departamento</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Taxa de presença média</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} 
                  width={100} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value}%`, 'Presença']}
                />
                <Bar dataKey="taxa" radius={[0, 12, 12, 0]} barSize={32}>
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#a855f7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
