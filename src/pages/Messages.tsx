import React, { useState } from 'react';
import { Send, Users, AlertCircle, Search, Paperclip, Image as ImageIcon, Copy, MessageCircle, Shield } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';

export function Messages() {
  const { members, attendance, users, departments } = useAppContext();
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const commonEmojis = ['🙏', '🙌', '❤️', '🔥', '✨', '📢', '✅', '⛪', '📖', '🤝'];

  const toggleDeptSelection = (deptName: string) => {
    setSelectedDepartments(prev => 
      prev.includes(deptName) 
        ? prev.filter(d => d !== deptName)
        : [...prev, deptName]
    );
  };

  const getRecipients = () => {
    if (target === 'all') return members;
    if (target === 'leaders') {
      const leaderEmails = new Set(users.filter(u => u.role === 'lider' || u.role === 'multiplicador').map(u => u.email));
      return members.filter(m => leaderEmails.has(m.email));
    }
    if (target === 'absent') {
      const absentMemberIds = new Set<string>();
      const memberAttendance: Record<string, any[]> = {};
      attendance.forEach(record => {
        if (!memberAttendance[record.memberId]) memberAttendance[record.memberId] = [];
        memberAttendance[record.memberId].push(record);
      });
      Object.entries(memberAttendance).forEach(([memberId, records]) => {
        records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (records.length > 0 && !records[0].present) absentMemberIds.add(memberId);
      });
      return members.filter(m => absentMemberIds.has(m.id));
    }
    if (target === 'departments') {
      return members.filter(m => selectedDepartments.includes(m.department));
    }
    return [];
  };

  const recipients = getRecipients();

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error('Por favor, insira o conteúdo da mensagem.');
      return;
    }

    if (recipients.length === 0) {
      toast.warning(`Nenhum destinatário encontrado.`);
      return;
    }

    // Simulate sending message
    toast.success(`Mensagem enviada com sucesso para ${recipients.length} pessoas!`);
    setMessage('');
    setSelectedDepartments([]);
  };

  const handleCopy = () => {
    if (!message.trim()) {
      toast.error('Não há mensagem para copiar.');
      return;
    }
    navigator.clipboard.writeText(message);
    toast.success('Mensagem copiada!');
  };

  const sendToWhatsApp = (member: any) => {
    if (!message.trim()) {
      toast.error('Não há mensagem para enviar.');
      return;
    }
    const personalizedMessage = message.replace(/{nome}/g, member.name.split(' ')[0]);
    const encodedMessage = encodeURIComponent(personalizedMessage);
    const phone = member.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const previewMessage = message.replace(/{nome}/g, 'João');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Comunicação</h2>
          <p className="text-slate-500 mt-1">Envie mensagens personalizadas via WhatsApp.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Nova Mensagem</h3>
              <div className="relative">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-xl"
                  title="Inserir Emoji"
                >
                  😊
                </button>
                {showEmojiPicker && (
                  <div className="absolute right-0 top-12 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-10 grid grid-cols-5 gap-2 w-48">
                    {commonEmojis.map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => addEmoji(emoji)}
                        className="text-xl hover:bg-slate-100 p-1 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-medium text-slate-700">Conteúdo da Mensagem</label>
                  <span className="text-xs text-slate-500">Use <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">{'{nome}'}</code></span>
                </div>
                <textarea 
                  rows={8}
                  placeholder="Olá {nome}, tudo bem? Gostaríamos de convidar você para..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-slate-400 italic">A mensagem será enviada individualmente para cada membro.</span>
                  <span className="text-xs text-slate-400">{message.length} caracteres</span>
                </div>
              </div>

              {message && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                  <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">Pré-visualização (Exemplo)</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{previewMessage}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopy}
                    className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-2 text-sm font-bold"
                  >
                    <Copy className="w-5 h-5" />
                    Copiar
                  </button>
                </div>
                <button 
                  onClick={handleSendMessage}
                  className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar via WhatsApp
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Lista de Envio</h3>
                <p className="text-xs text-slate-500 mt-0.5">{recipients.length} destinatários selecionados</p>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {recipients.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {recipients.map((member) => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.department} • {member.phone}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => sendToWhatsApp(member)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Enviar individualmente"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Selecione os destinatários ao lado para ver a lista.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Destinatários</h3>
            <div className="space-y-3">
              {[
                { id: 'all', label: 'Todos os Membros', sub: 'Toda a igreja', icon: Users, color: 'blue' },
                { id: 'leaders', label: 'Liderança', sub: 'Líderes e Multiplicadores', icon: Shield, color: 'emerald' },
                { id: 'absent', label: 'Ausentes', sub: 'Faltaram recentemente', icon: AlertCircle, color: 'rose' },
                { id: 'departments', label: 'Por Departamentos', sub: 'Escolha os depts', icon: Users, color: 'orange' },
              ].map((opt) => (
                <label key={opt.id} className={`
                  w-full flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group text-left
                  ${target === opt.id ? `border-${opt.color}-500 bg-${opt.color}-50` : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                `}>
                  <input 
                    type="radio" 
                    name="target" 
                    value={opt.id} 
                    checked={target === opt.id} 
                    onChange={() => setTarget(opt.id as any)}
                    className="hidden"
                  />
                  <div className={`p-2 rounded-lg transition-colors ${target === opt.id ? `bg-${opt.color}-100 text-${opt.color}-600` : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                    <opt.icon className={`w-5 h-5 ${target === opt.id ? `text-${opt.color}-600` : 'text-slate-600'}`} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${target === opt.id ? `text-${opt.color}-700` : 'text-slate-800'}`}>{opt.label}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {target === 'departments' && (
            <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-6 animate-in fade-in slide-in-from-top-2">
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Selecionar Departamentos</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {departments.map((dept) => (
                  <label key={dept.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500" 
                      checked={selectedDepartments.includes(dept.name)}
                      onChange={() => toggleDeptSelection(dept.name)}
                    />
                    <span className="text-sm text-slate-700 font-medium">{dept.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
