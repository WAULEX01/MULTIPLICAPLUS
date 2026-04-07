import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  BarChart3, 
  MessageSquare, 
  Network,
  Settings as SettingsIcon,
  Menu,
  Search,
  Bell,
  Plus,
  UserPlus,
  UsersRound,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { VerseBanner } from './VerseBanner';
import { useAuth } from '../context/AuthContext';

const VERSES: Record<string, { verse: string; reference: string }> = {
  '/': { verse: 'Ide por todo o mundo e pregai o evangelho a toda criatura.', reference: 'Marcos 16:15' },
  '/membros': { verse: 'Assim nós, que somos muitos, somos um só corpo em Cristo.', reference: 'Romanos 12:5' },
  '/novos-convertidos': { verse: 'De modo que, se alguém está em Cristo, nova criatura é.', reference: '2 Coríntios 5:17' },
  '/multiplicadores': { verse: 'E o que de mim ouviste... transmite a homens fiéis que sejam idôneos para também ensinarem os outros.', reference: '2 Timóteo 2:2' },
  '/lideres': { verse: 'O que governa, faça-o com diligência.', reference: 'Romanos 12:8' },
  '/departamentos': { verse: 'Tudo, porém, seja feito com decência e ordem.', reference: '1 Coríntios 14:40' },
  '/presenca': { verse: 'Não deixemos de congregar-nos, como é costume de alguns.', reference: 'Hebreus 10:25' },
  '/relatorios': { verse: 'Portanto, vede prudentemente como andais.', reference: 'Efésios 5:15' },
  '/mensagens': { verse: 'A palavra dita a seu tempo, quão boa é.', reference: 'Provérbios 15:23' },
  '/configuracoes': { verse: 'Tudo o que fizerem, façam de todo o coração, como para o Senhor.', reference: 'Colossenses 3:23' },
};

const NAVIGATION = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['pastor', 'lider', 'multiplicador', 'secretaria'] },
  { name: 'Membros', href: '/membros', icon: Users, roles: ['pastor', 'lider', 'secretaria'] },
  { name: 'Novos Convertidos', href: '/novos-convertidos', icon: UserPlus, roles: ['pastor', 'lider', 'secretaria'] },
  { name: 'Multiplicadores', href: '/multiplicadores', icon: Network, roles: ['pastor', 'lider', 'secretaria'] },
  { name: 'Líderes', href: '/lideres', icon: UsersRound, roles: ['pastor', 'secretaria'] },
  { name: 'Departamentos', href: '/departamentos', icon: Network, roles: ['pastor', 'secretaria'] },
  { name: 'Presença', href: '/presenca', icon: CheckSquare, roles: ['pastor', 'lider', 'multiplicador', 'secretaria'] },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3, roles: ['pastor', 'lider', 'secretaria'] },
  { name: 'Mensagens', href: '/mensagens', icon: MessageSquare, roles: ['pastor', 'lider'] },
  { name: 'Configurações', href: '/configuracoes', icon: SettingsIcon, roles: ['pastor', 'secretaria'] },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentVerse = VERSES[location.pathname] || VERSES['/'];

  const filteredNavigation = NAVIGATION.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const getRoleColor = () => {
    if (!user) return 'bg-gradient-primary';
    switch (user.role) {
      case 'pastor': return 'bg-blue-600';
      case 'lider': return 'bg-emerald-600';
      case 'multiplicador': return 'bg-orange-600';
      case 'secretaria': return 'bg-purple-600';
      default: return 'bg-gradient-primary';
    }
  };

  const getRoleLabel = () => {
    if (!user) return '';
    switch (user.role) {
      case 'pastor': return 'Pastor';
      case 'lider': return 'Líder';
      case 'multiplicador': return 'Multiplicador';
      case 'secretaria': return 'Secretaria Geral';
      default: return '';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row font-sans text-slate-900 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: collapsed ? 80 : 280,
          x: sidebarOpen || (typeof window !== 'undefined' && !window.matchMedia('(max-width: 768px)').matches) ? 0 : -280
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 40, mass: 0.8 }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col md:relative"
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0", getRoleColor())}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-display font-bold text-slate-900 tracking-tight whitespace-nowrap"
              >
                Multiplica+
              </motion.h1>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <nav className="space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive 
                      ? `${getRoleColor()} text-white shadow-lg` 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className={cn(
            "bg-slate-50 rounded-2xl p-3 flex items-center gap-3 transition-all",
            collapsed ? "justify-center" : ""
          )}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0", getRoleColor())}>
              {userInitials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{getRoleLabel()}</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all",
              collapsed ? "justify-center" : ""
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex mt-4 w-full items-center justify-center p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl md:hidden transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden md:flex items-center relative max-w-md w-full group">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 group-focus-within:text-primary-start transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar membros, departamentos..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 border-transparent border focus:bg-white focus:border-primary-start/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary-start/5 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button className="relative p-2.5 text-slate-500 hover:text-primary-start hover:bg-primary-start/5 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-alert rounded-full border-2 border-white"></span>
            </button>
            
            <button className={cn("hidden sm:flex items-center gap-2 hover:opacity-90 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-lg active:scale-95", getRoleColor())}>
              <Plus className="w-4 h-4" />
              Novo
            </button>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/configuracoes')}>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 leading-tight group-hover:text-primary-start transition-colors">{user?.name.split(' ')[0]}</p>
                <p className="text-xs text-slate-500">{getRoleLabel()}</p>
              </div>
              <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold border-2 border-white shadow-sm group-hover:scale-105 transition-transform", getRoleColor())}>
                {userInitials}
              </div>
            </div>
          </div>
        </header>

        <VerseBanner verse={currentVerse.verse} reference={currentVerse.reference} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-surface/50 custom-scrollbar">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
        
        {/* Floating Action Button for Mobile */}
        <button className={cn("md:hidden fixed bottom-6 right-6 w-14 h-14 text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40", getRoleColor())}>
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
