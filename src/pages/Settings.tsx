import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Key, Database, User, Globe, Moon, Sun, Check, ChevronRight, LogOut, Trash2, Plus, ChevronDown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { ConfirmModal } from '../components/ConfirmModal';

type SettingsTab = 'geral' | 'seguranca' | 'notificacoes' | 'backup' | 'perfil';

export function Settings() {
  const { user, logout } = useAuth();
  const { resetData, settings, updateSettings } = useAppContext();
  const [activeTab, setActiveTab] = useState<SettingsTab>('geral');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    churchName: settings?.churchName || '',
    logoUrl: settings?.logoUrl || ''
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        churchName: settings.churchName,
        logoUrl: settings.logoUrl
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'geral', label: 'Geral', icon: SettingsIcon },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'backup', label: 'Backup', icon: Database },
  ];

  return (
    <div className="space-y-10 pb-24 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Configurações</h2>
          <p className="text-slate-500 mt-2 font-medium text-lg">Gerencie as preferências do sistema e sua conta.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl transition-all flex items-center gap-3 font-black shadow-xl shadow-blue-600/20 disabled:opacity-50"
        >
          {isSaving ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <Check className="w-5 h-5" />
          )}
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </motion.button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Navigation */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm sticky top-24">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all relative overflow-hidden group ${
                    activeTab === tab.id 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-r-full"
                    />
                  )}
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100">
              <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-rose-500 hover:bg-rose-50 transition-all group">
                <LogOut className="w-5 h-5 text-rose-400 group-hover:text-rose-500" />
                Sair da Conta
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {activeTab === 'perfil' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Seu Perfil</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-10">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl group-hover:scale-105 transition-transform">
                          {user?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-xl border border-slate-100 flex items-center justify-center text-blue-600 hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex-1 space-y-6 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                            <input 
                              type="text" 
                              readOnly
                              value={user?.name}
                              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-bold text-slate-800"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                            <input 
                              type="email" 
                              readOnly
                              value={user?.email}
                              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-bold text-slate-800"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'geral' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Configurações Gerais</h3>
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Igreja / Instituição</label>
                          <input 
                            type="text" 
                            value={formData.churchName}
                            onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-bold text-slate-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">URL da Logo (PNG/JPG)</label>
                          <input 
                            type="text" 
                            value={formData.logoUrl}
                            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                            placeholder="https://exemplo.com/logo.png"
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      {formData.logoUrl && (
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-6">
                          <div className="w-20 h-20 rounded-2xl bg-white shadow-sm overflow-hidden flex items-center justify-center border border-slate-200">
                            <img src={formData.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900">Prévia da Logo</h4>
                            <p className="text-sm text-slate-500">Esta imagem aparecerá no topo do menu lateral.</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Idioma do Sistema</label>
                          <div className="relative">
                            <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <select className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-bold text-slate-800 appearance-none">
                              <option>Português (Brasil)</option>
                              <option>English (US)</option>
                              <option>Español</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fuso Horário</label>
                          <div className="relative">
                            <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <select className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-bold text-slate-800 appearance-none">
                              <option>Horário de Brasília (UTC-3)</option>
                              <option>Horário do Amazonas (UTC-4)</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-slate-100">
                        <h4 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">Aparência</h4>
                        <div className="grid grid-cols-2 gap-6">
                          <button className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-blue-600 bg-blue-50/50 text-blue-600 font-black transition-all">
                            <div className="flex items-center gap-4">
                              <Sun className="w-6 h-6" />
                              Claro
                            </div>
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </button>
                          <button className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-slate-100 bg-slate-50 text-slate-400 font-black hover:border-slate-200 transition-all">
                            <div className="flex items-center gap-4">
                              <Moon className="w-6 h-6" />
                              Escuro
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seguranca' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Segurança</h3>
                    <div className="space-y-8">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                              <Key className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900">Autenticação em Duas Etapas</h4>
                              <p className="text-sm font-medium text-slate-500">Adicione uma camada extra de segurança à sua conta.</p>
                            </div>
                          </div>
                          <div className="w-14 h-8 bg-slate-200 rounded-full relative cursor-pointer transition-colors hover:bg-slate-300">
                            <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                              <Shield className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900">Sessões Ativas</h4>
                              <p className="text-sm font-medium text-slate-500">Gerencie os dispositivos conectados à sua conta.</p>
                            </div>
                          </div>
                          <ChevronRight className="w-6 h-6 text-slate-300" />
                        </div>
                      </div>

                      <div className="pt-8 border-t border-slate-100">
                        <h4 className="text-sm font-black text-rose-500 mb-6 uppercase tracking-widest">Zona de Perigo</h4>
                        <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-rose-50 text-rose-600 font-black hover:bg-rose-100 transition-all">
                          <Trash2 className="w-5 h-5" />
                          Excluir minha conta permanentemente
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notificacoes' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Notificações</h3>
                    <div className="space-y-6">
                      {[
                        { title: 'Novos Membros', desc: 'Receba alertas quando novos membros forem cadastrados.' },
                        { title: 'Lembretes de Chamada', desc: 'Notificações para realizar a chamada dos grupos.' },
                        { title: 'Relatórios Semanais', desc: 'Resumo semanal do crescimento da rede no seu e-mail.' },
                        { title: 'Mensagens do Sistema', desc: 'Atualizações importantes e novidades do Multiplica Mais.' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                          <div>
                            <h4 className="font-black text-slate-900">{item.title}</h4>
                            <p className="text-sm font-medium text-slate-500">{item.desc}</p>
                          </div>
                          <div className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${i % 2 === 0 ? 'bg-blue-600' : 'bg-slate-200'}`}>
                            <motion.div 
                              animate={{ x: i % 2 === 0 ? 24 : 0 }}
                              className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Backup & Dados</h3>
                    <div className="space-y-8">
                      <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/10">
                            <Database className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-900">Backup Automático</h4>
                            <p className="text-sm font-bold text-slate-500">Último backup realizado: <span className="text-blue-600">Hoje às 04:30</span></p>
                          </div>
                        </div>
                        <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-600/10 hover:bg-blue-50 transition-all whitespace-nowrap">
                          Fazer Backup Agora
                        </button>
                      </div>

                      {user?.role === 'pastor' && (
                        <div className="bg-rose-50 rounded-[2rem] p-8 border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white text-rose-600 flex items-center justify-center shadow-xl shadow-rose-600/10">
                              <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-slate-900">Resetar Sistema</h4>
                              <p className="text-sm font-bold text-slate-500">Apaga todos os membros, presenças e reuniões.</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setIsResetModalOpen(true)}
                            className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all whitespace-nowrap"
                          >
                            Resetar Todos os Dados
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                          <h4 className="text-lg font-black text-slate-900 mb-2">Exportar Dados</h4>
                          <p className="text-sm font-medium text-slate-500 mb-6">Baixe todos os seus dados em formato JSON ou CSV.</p>
                          <button className="text-blue-600 font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                            Configurar Exportação <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                          <h4 className="text-lg font-black text-slate-900 mb-2">Importar Dados</h4>
                          <p className="text-sm font-medium text-slate-500 mb-6">Importe membros e grupos de outro sistema.</p>
                          <button className="text-blue-600 font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                            Iniciar Importação <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <ConfirmModal 
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={async () => {
          await resetData();
          setIsResetModalOpen(false);
        }}
        title="Resetar Todos os Dados?"
        message="Esta ação é IRREVERSÍVEL. Todos os membros, presenças, reuniões e usuários (exceto você) serão apagados permanentemente."
        confirmText="Sim, Resetar Tudo"
        cancelText="Cancelar"
      />
    </div>
  );
}
