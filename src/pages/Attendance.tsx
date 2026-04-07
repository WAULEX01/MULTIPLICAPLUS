import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Calendar as CalendarIcon, Users, Check, X, ChevronLeft, ChevronRight, Save, PieChart, UserCheck, UserMinus, Camera, Scan, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Webcam from 'react-webcam';
import { FaceDetection, Results } from '@mediapipe/face_detection';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';

type AttendanceMode = 'manual' | 'facial';

export function Attendance() {
  const { members, attendance: globalAttendance, saveAttendance, departments } = useAppContext();
  const { user } = useAuth();

  const availableDepartments = useMemo(() => {
    if (user?.role === 'pastor' || user?.role === 'secretaria') return departments.map(d => d.name);
    return [user?.department].filter(Boolean) as string[];
  }, [user, departments]);

  const [selectedDept, setSelectedDept] = useState(availableDepartments[0] || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState<'Quinta' | 'Domingo' | 'Outro'>('Domingo');
  const [customService, setCustomService] = useState('');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<AttendanceMode>('manual');
  const [isScanning, setIsScanning] = useState(false);
  const [scanningStatus, setScanningStatus] = useState<'idle' | 'detecting' | 'recognized' | 'error'>('idle');
  const [lastRecognized, setLastRecognized] = useState<string | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const faceDetectionRef = useRef<FaceDetection | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);

  const deptMembers = members.filter(m => m.department === selectedDept && m.isActive);
  
  // Load existing attendance when department, date or serviceType changes
  useEffect(() => {
    const existingRecords = globalAttendance.filter(
      a => a.department === selectedDept && a.date === date && a.serviceType === (serviceType === 'Outro' ? customService : serviceType)
    );
    
    const newAttendanceState: Record<string, boolean> = {};
    existingRecords.forEach(record => {
      newAttendanceState[record.memberId] = record.present;
    });
    
    setAttendance(newAttendanceState);
  }, [selectedDept, date, serviceType, customService, globalAttendance]);

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalCount = deptMembers.length;
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const chartData = [
    { name: 'Presente', value: presentCount },
    { name: 'Ausente', value: totalCount - presentCount }
  ];

  const COLORS = ['#10b981', '#f1f5f9'];

  const toggleAttendance = (memberId: string, present: boolean) => {
    setAttendance(prev => ({ ...prev, [memberId]: present }));
  };

  const markAll = (present: boolean) => {
    const newState: Record<string, boolean> = {};
    deptMembers.forEach(m => {
      newState[m.id] = present;
    });
    setAttendance(newState);
    toast.info(present ? 'Todos marcados como presente' : 'Todos marcados como falta');
  };

  const handleSave = () => {
    const finalServiceType = serviceType === 'Outro' ? customService : serviceType;
    const records = deptMembers.map(member => ({
      id: `a${Date.now()}-${member.id}`,
      date,
      department: selectedDept,
      memberId: member.id,
      present: attendance[member.id] || false,
      serviceType: finalServiceType
    }));

    saveAttendance(date, selectedDept, records);
    toast.success('Presença salva com sucesso!', {
      description: `Registrada para ${selectedDept} em ${new Date(date).toLocaleDateString('pt-BR')} (${finalServiceType})`,
      icon: <UserCheck className="w-5 h-5 text-emerald-500" />
    });
  };

  // Facial Recognition Logic (Simulated for Prototype)
  const onResults = useCallback((results: Results) => {
    if (results.detections.length > 0) {
      setScanningStatus('detecting');
      
      // In a real app, here we would:
      // 1. Extract the face image from the canvas
      // 2. Generate an embedding using a model (e.g., FaceNet)
      // 3. Compare with stored embeddings of deptMembers
      
      // For this prototype, we'll simulate a recognition every few seconds
      // if a face is detected and not already recognized in this session
      const randomMember = deptMembers[Math.floor(Math.random() * deptMembers.length)];
      
      if (randomMember && !attendance[randomMember.id]) {
        // Simulate a delay for "processing"
        setTimeout(() => {
          setAttendance(prev => ({ ...prev, [randomMember.id]: true }));
          setLastRecognized(randomMember.name);
          setScanningStatus('recognized');
          toast.success(`Reconhecido: ${randomMember.name}`, {
            icon: <Scan className="w-4 h-4 text-emerald-500" />
          });
          
          // Reset status after a while
          setTimeout(() => {
            setScanningStatus('detecting');
            setLastRecognized(null);
          }, 2000);
        }, 1000);
      }
    } else {
      setScanningStatus('idle');
    }
  }, [deptMembers, attendance]);

  useEffect(() => {
    if (mode === 'facial' && isScanning) {
      faceDetectionRef.current = new FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });

      faceDetectionRef.current.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5
      });

      faceDetectionRef.current.onResults(onResults);

      if (webcamRef.current?.video) {
        cameraRef.current = new MediaPipeCamera(webcamRef.current.video, {
          onFrame: async () => {
            if (webcamRef.current?.video) {
              await faceDetectionRef.current?.send({ image: webcamRef.current.video });
            }
          },
          width: 640,
          height: 480
        });
        cameraRef.current.start();
      }
    } else {
      cameraRef.current?.stop();
    }

    return () => {
      cameraRef.current?.stop();
    };
  }, [mode, isScanning, onResults]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Registro de Presença</h2>
          <p className="text-slate-500 mt-1">Marque quem esteve presente no encontro de hoje.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center shadow-inner">
            <button
              onClick={() => setMode('manual')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                mode === 'manual' ? "bg-white text-primary-start shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Users className="w-4 h-4" /> Manual
            </button>
            <button
              onClick={() => setMode('facial')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                mode === 'facial' ? "bg-white text-primary-start shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Scan className="w-4 h-4" /> Facial
            </button>
          </div>

          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Frequência do Dia</span>
            <span className="text-2xl font-display font-bold text-primary-start">{percentage}%</span>
          </div>
          <div className="w-16 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={chartData}
                  innerRadius={20}
                  outerRadius={30}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8"
          >
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Departamento</label>
              <div className="space-y-2">
                {availableDepartments.map(dept => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left group",
                      selectedDept === dept 
                        ? "bg-primary-start/10 text-primary-start shadow-sm border border-primary-start/20" 
                        : "hover:bg-slate-50 text-slate-600 border border-transparent"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors",
                      selectedDept === dept ? "bg-primary-start text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                    )}>
                      {dept.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold truncate">{dept}</p>
                    </div>
                    {selectedDept === dept && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Tipo de Culto</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {['Quinta', 'Domingo', 'Outro'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setServiceType(type as any)}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                      serviceType === type 
                        ? "bg-primary-start text-white border-primary-start shadow-md" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {serviceType === 'Outro' && (
                <input 
                  type="text" 
                  placeholder="Nome do culto..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all text-sm font-bold text-slate-700"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                />
              )}
            </div>

            <div className="pt-8 border-t border-slate-100">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Data do Encontro</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-start w-5 h-5" />
                <input 
                  type="date" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-start/5 focus:border-primary-start/30 transition-all text-sm font-bold text-slate-700"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-primary rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-start/20 relative overflow-hidden"
          >
            <div className="relative z-10">
              <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                <PieChart className="w-5 h-5" /> Resumo
              </h4>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Presentes</p>
                  <p className="text-2xl font-display font-bold">{presentCount}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Ausentes</p>
                  <p className="text-2xl font-display font-bold">{totalCount - presentCount}</p>
                </div>
              </div>
              <button 
                onClick={handleSave}
                className="w-full mt-8 bg-white text-primary-start py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <Save className="w-5 h-5" /> Salvar Agora
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </motion.div>
        </div>

        {/* Members List / Facial Recognition */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {mode === 'manual' ? (
              <motion.div 
                key="manual-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
                  <div>
                    <h3 className="text-xl font-display font-bold text-slate-900">Lista de Chamada</h3>
                    <p className="text-xs text-slate-500 font-medium">{deptMembers.length} Membros ativos</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => markAll(true)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
                    >
                      Marcar todos presentes
                    </button>
                    <button 
                      onClick={() => markAll(false)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100"
                    >
                      Marcar todos faltaram
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-50">
                  <AnimatePresence mode="popLayout">
                    {deptMembers.map((member, index) => {
                      const isPresent = attendance[member.id] === true;
                      const isAbsent = attendance[member.id] === false;

                      return (
                        <motion.div 
                          key={member.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-all"
                        >
                          <div className="flex items-center gap-5">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-display font-bold transition-all shadow-inner",
                              isPresent ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-100" :
                              isAbsent ? "bg-rose-50 text-rose-600 border-2 border-rose-100" :
                              "bg-slate-50 text-slate-400 border-2 border-slate-100"
                            )}>
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-lg">{member.name}</p>
                              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{member.role}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleAttendance(member.id, true)}
                              className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90",
                                isPresent 
                                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                                  : "bg-slate-50 text-slate-300 hover:bg-emerald-50 hover:text-emerald-400"
                              )}
                            >
                              <Check className={cn("w-6 h-6 transition-transform", isPresent && "scale-110")} />
                            </button>
                            <button 
                              onClick={() => toggleAttendance(member.id, false)}
                              className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90",
                                isAbsent 
                                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30" 
                                  : "bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-400"
                              )}
                            >
                              <X className={cn("w-6 h-6 transition-transform", isAbsent && "scale-110")} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {deptMembers.length === 0 && (
                    <div className="p-20 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-slate-200" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 mb-2">Nenhum membro encontrado</h4>
                      <p className="text-slate-400 max-w-xs mx-auto">Selecione outro departamento ou adicione membros para começar a chamada.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="facial-recognition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]"
              >
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-start rounded-xl flex items-center justify-center text-white">
                      <Scan className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-slate-900">Chamada Facial</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tecnologia de Visão Computacional</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full animate-pulse",
                      isScanning ? "bg-emerald-500" : "bg-slate-300"
                    )} />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {isScanning ? 'Sistema Ativo' : 'Sistema Pausado'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 relative bg-slate-900 overflow-hidden">
                  {isScanning ? (
                    <div className="w-full h-full relative">
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover opacity-80"
                        videoConstraints={{
                          width: 1280,
                          height: 720,
                          facingMode: "user"
                        }}
                        mirrored={false}
                        screenshotQuality={0.92}
                        imageSmoothing={true}
                        forceScreenshotSourceSize={false}
                        disablePictureInPicture={true}
                        onUserMedia={() => {}}
                        onUserMediaError={() => {}}
                      />
                      
                      {/* Scanning Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Corners */}
                        <div className="absolute top-10 left-10 w-20 h-20 border-t-4 border-l-4 border-primary-start rounded-tl-3xl" />
                        <div className="absolute top-10 right-10 w-20 h-20 border-t-4 border-r-4 border-primary-start rounded-tr-3xl" />
                        <div className="absolute bottom-10 left-10 w-20 h-20 border-b-4 border-l-4 border-primary-start rounded-bl-3xl" />
                        <div className="absolute bottom-10 right-10 w-20 h-20 border-b-4 border-r-4 border-primary-start rounded-br-3xl" />
                        
                        {/* Scanning Line */}
                        <motion.div 
                          animate={{ top: ['10%', '90%', '10%'] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="absolute left-10 right-10 h-1 bg-gradient-to-r from-transparent via-primary-start to-transparent shadow-[0_0_15px_rgba(124,58,237,0.5)] z-20"
                        />

                        {/* Status Message */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                          <AnimatePresence mode="wait">
                            {scanningStatus === 'detecting' && (
                              <motion.div 
                                key="detecting"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="bg-primary-start/20 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 text-white"
                              >
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span className="font-bold text-sm tracking-wide">Analisando Rosto...</span>
                              </motion.div>
                            )}
                            {scanningStatus === 'recognized' && (
                              <motion.div 
                                key="recognized"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="bg-emerald-500/80 backdrop-blur-md border border-white/20 px-8 py-4 rounded-3xl flex flex-col items-center gap-2 text-white shadow-2xl"
                              >
                                <ShieldCheck className="w-10 h-10" />
                                <span className="font-black text-lg tracking-tight">{lastRecognized}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Presença Confirmada</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white p-12 text-center space-y-6">
                      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10">
                        <Camera className="w-12 h-12 text-white/40" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-display font-bold">Câmera Desativada</h4>
                        <p className="text-white/60 max-w-xs mx-auto">Ative a câmera para iniciar o reconhecimento facial automático dos membros.</p>
                      </div>
                      <button 
                        onClick={() => setIsScanning(true)}
                        className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl active:scale-95"
                      >
                        Ativar Reconhecimento
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-8 bg-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {deptMembers.slice(0, 5).map((m, i) => (
                        <div key={m.id} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                          {m.name.charAt(0)}
                        </div>
                      ))}
                      {deptMembers.length > 5 && (
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm">
                          +{deptMembers.length - 5}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {presentCount} de {totalCount} presentes
                    </p>
                  </div>
                  
                  {isScanning && (
                    <button 
                      onClick={() => setIsScanning(false)}
                      className="text-rose-500 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all"
                    >
                      <X className="w-4 h-4" /> Parar Scanner
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Security/Privacy Info (Stage 11) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-start gap-4"
      >
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h5 className="font-bold text-amber-900">Privacidade e Segurança (LGPD)</h5>
          <p className="text-sm text-amber-800/70 mt-1 leading-relaxed">
            Este sistema utiliza <strong>embeddings biométricos</strong> processados localmente. Nenhuma foto é armazenada permanentemente. 
            O reconhecimento facial é realizado on-device para garantir a privacidade dos membros conforme as diretrizes da LGPD.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
