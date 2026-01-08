
import React, { useState, useMemo } from 'react';
import { Plus, BookOpen, Clock, BarChart3, History, Trash2, Calendar, FileText, ChevronRight, Tag, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { StudyLog } from '../types';

interface StudyManagerProps {
  logs: StudyLog[];
  setLogs: React.Dispatch<React.SetStateAction<StudyLog[]>>;
}

const StudyManager: React.FC<StudyManagerProps> = ({ logs, setLogs }) => {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [notes, setNotes] = useState('');
  const [chartRange, setChartRange] = useState(7); // Default to 7 days

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString(new Date());

  // Derive unique subjects from logs for suggestions
  const recentSubjects = useMemo(() => {
    const subjects = logs.map(l => l.subject);
    return Array.from(new Set(subjects)).slice(0, 5);
  }, [logs]);

  const addLog = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    
    if (!subject.trim() || (h === 0 && m === 0)) return;
    
    // Convert to float hours for the log
    const totalDuration = h + (m / 60);

    const newLog: StudyLog = {
      id: crypto.randomUUID(),
      date: today,
      subject: subject.trim(),
      duration: parseFloat(totalDuration.toFixed(2)),
      notes
    };

    setLogs(prev => [newLog, ...prev]);
    setSubject('');
    setHours('0');
    setMinutes('0');
    setNotes('');
    setShowForm(false);
  };

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const formatDuration = (decimalHours: number) => {
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Stats Calculations
  const totalHours = useMemo(() => logs.reduce((acc, l) => acc + l.duration, 0), [logs]);
  const sessionsCount = logs.length;
  const avgHours = sessionsCount > 0 ? (totalHours / sessionsCount) : 0;

  // Chart Data Preparation based on selected range
  const chartData = useMemo(() => {
    const days = Array.from({ length: chartRange }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (chartRange - 1 - i));
      return getLocalDateString(d);
    });

    return days.map(date => {
      const dayLogs = logs.filter(l => l.date === date);
      const total = dayLogs.reduce((acc, l) => acc + l.duration, 0);
      const d = new Date(date + 'T12:00:00');
      
      // Label formatting depends on range
      let label = '';
      if (chartRange <= 7) {
        label = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      } else if (chartRange <= 30) {
        label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      } else {
        label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }

      return {
        date,
        name: label,
        hours: parseFloat(total.toFixed(1))
      };
    });
  }, [logs, chartRange]);

  // Determine tick interval for XAxis to keep it clean
  const tickInterval = useMemo(() => {
    if (chartRange <= 7) return 0;
    if (chartRange <= 14) return 1;
    if (chartRange <= 30) return 4;
    if (chartRange <= 60) return 9;
    return 14;
  }, [chartRange]);

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciador de Estudos</h2>
          <p className="text-slate-500 text-sm">Contabilize seu tempo e acompanhe sua evolução.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          {showForm ? 'Cancelar' : 'Registrar Estudo'}
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Tempo Total</p>
            <p className="text-2xl font-black text-slate-800">{formatDuration(totalHours)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Sessões</p>
            <p className="text-2xl font-black text-slate-800">{sessionsCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Média Diária</p>
            <p className="text-2xl font-black text-slate-800">{formatDuration(avgHours)}</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/50 animate-in zoom-in-95 duration-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FileText className="text-indigo-500" size={20} />
            Nova Sessão de Estudo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 ml-1">Matéria / Conteúdo</label>
              <div className="relative">
                <input 
                  list="subjects-list"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="O que você estudou?"
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 transition-all"
                />
                <datalist id="subjects-list">
                  {recentSubjects.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              {recentSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 ml-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 w-full mb-1">
                    <Tag size={10} /> Sugestões:
                  </span>
                  {recentSubjects.map(s => (
                    <button 
                      key={s}
                      onClick={() => setSubject(s)}
                      className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 ml-1">Duração da Sessão</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input 
                    type="number"
                    min="0"
                    value={hours}
                    onChange={e => setHours(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 transition-all font-bold text-center"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Horas</span>
                </div>
                <div className="flex-1 relative">
                  <input 
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={e => setMinutes(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 transition-all font-bold text-center"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Min</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Anotações do Dia</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Resumo do capítulo 3, exercícios de lógica..."
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 min-h-[100px] resize-none transition-all"
              />
            </div>
          </div>
          <button 
            onClick={addLog}
            className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            Salvar Registro
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Analytics Chart */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="font-bold text-slate-800">Desempenho</h3>
            <p className="text-xs text-slate-400">Tempo de estudo no período selecionado</p>
          </div>
          
          <div className="relative group/range w-full sm:w-auto">
            <select 
              value={chartRange}
              onChange={(e) => setChartRange(parseInt(e.target.value))}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold py-2 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-full cursor-pointer"
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={14}>Últimos 14 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={60}>Últimos 60 dias</option>
              <option value={90}>Últimos 90 dias</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                dy={10}
                interval={tickInterval}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(val: number) => [`${val}h`, 'Horas']}
              />
              <Bar dataKey="hours" radius={[4, 4, 4, 4]} barSize={chartRange > 30 ? 6 : chartRange > 14 ? 12 : 32}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.date === today ? '#6366f1' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold mb-2 px-1">
          <History size={20} className="text-indigo-500" />
          <h3>Histórico de Sessões</h3>
        </div>
        
        {logs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400">
            <BookOpen className="mx-auto mb-4 opacity-20" size={48} />
            <p>Nenhuma sessão registrada ainda.</p>
            <p className="text-sm">Seu progresso começará a aparecer aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {logs.map(log => (
              <div key={log.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 text-slate-500 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{log.subject}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(log.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-indigo-600">
                          <Clock size={12} />
                          {formatDuration(log.duration)}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-slate-600 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteLog(log.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyManager;
