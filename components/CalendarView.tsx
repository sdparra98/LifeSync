
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Habit, Task } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, CheckCircle2, Circle, Trophy } from 'lucide-react';

interface CalendarViewProps {
  habits: Habit[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const CalendarView: React.FC<CalendarViewProps> = ({ habits, tasks, setTasks }) => {
  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskType, setNewTaskType] = useState<'task' | 'event'>('task');

  // Helpers for Calendar Grid
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const addTaskToDate = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      completed: false,
      priority: 'medium',
      dueDate: selectedDate,
      time: newTaskTime || undefined,
      type: newTaskType
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskTime('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const tasksForSelectedDate = tasks.filter(t => t.dueDate === selectedDate).sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    return 0;
  });

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="h-24 bg-slate-50/50 border border-slate-100/50"></div>);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = todayStr === dateStr;
    const isSelected = selectedDate === dateStr;
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    const hasEvents = dayTasks.some(t => t.type === 'event');
    const hasTasks = dayTasks.some(t => t.type === 'task');

    calendarCells.push(
      <div 
        key={d} 
        onClick={() => handleDayClick(d)}
        className={`h-24 border border-slate-100 p-2 cursor-pointer transition-colors relative group
          ${isSelected ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-500 z-10' : 'hover:bg-slate-50 bg-white'}
        `}
      >
        <div className="flex justify-between items-start">
          <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
            ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}
          `}>
            {d}
          </span>
        </div>
        <div className="flex flex-col gap-1 mt-2">
           {hasEvents && <div className="h-1.5 w-full bg-purple-200 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-full"></div></div>}
           {hasTasks && <div className="flex gap-0.5 flex-wrap">
              {dayTasks.filter(t => t.type !== 'event').slice(0, 5).map((_, i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
              ))}
           </div>}
        </div>
      </div>
    );
  }

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = getLocalDateString(d);
    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const completionCount = habits.reduce((acc, habit) => acc + (habit.completedDates.includes(dateStr) ? 1 : 0), 0);
    return { name: dayName, completions: completionCount, date: dateStr };
  });

  const bestStreak = habits.reduce((acc, h) => Math.max(acc, h.streak), 0);

  // Parse date for display to avoid timezone shift (adding time to force local interp)
  const displayDate = new Date(selectedDate + 'T12:00:00');

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Planner</h2>
          <p className="text-slate-500 text-sm">Organize seus compromissos e tarefas do mês.</p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 capitalize">{monthNames[month]} {year}</h3>
              <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><ChevronLeft size={20}/></button>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><ChevronRight size={20}/></button>
              </div>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-100">
              {weekDays.map(d => (
                <div key={d} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarCells}
            </div>
          </div>
        </div>

        <div className="lg:w-80 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
             <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CalendarIcon className="text-indigo-500" size={20}/>
                  {displayDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-sm text-slate-500 capitalize">{displayDate.toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
             </div>

             <div className="mb-6 space-y-3">
               <div className="flex gap-2 bg-slate-50 p-1 rounded-lg">
                 <button 
                   onClick={() => setNewTaskType('task')}
                   className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${newTaskType === 'task' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                 >
                   Tarefa
                 </button>
                 <button 
                   onClick={() => setNewTaskType('event')}
                   className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${newTaskType === 'event' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'}`}
                 >
                   Evento
                 </button>
               </div>
               <input 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={newTaskType === 'task' ? "O que precisa ser feito?" : "Nome do compromisso"}
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
               />
               <div className="flex gap-2">
                 <div className="relative flex-1">
                    <Clock size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="time" 
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className="w-full text-sm pl-9 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600"
                    />
                 </div>
                 <button 
                   onClick={addTaskToDate}
                   className={`px-4 rounded-xl text-white shadow-lg transition-colors flex items-center justify-center
                     ${newTaskType === 'task' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'}
                   `}
                 >
                   <Plus size={20} />
                 </button>
               </div>
             </div>

             <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
               {tasksForSelectedDate.length === 0 && (
                 <div className="text-center py-8 text-slate-400 text-sm">
                   Nenhum item para este dia.
                 </div>
               )}
               {tasksForSelectedDate.map(task => (
                 <div 
                   key={task.id} 
                   className={`p-3 rounded-xl border flex items-center gap-3 transition-all
                     ${task.type === 'event' 
                        ? 'bg-purple-50 border-purple-100' 
                        : task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'}
                   `}
                 >
                   {task.type === 'task' ? (
                     <button onClick={() => toggleTask(task.id)} className={`${task.completed ? 'text-indigo-500' : 'text-slate-300 hover:text-indigo-400'}`}>
                       {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                     </button>
                   ) : (
                     <div className="w-1.5 h-8 bg-purple-400 rounded-full"></div>
                   )}
                   <div className="flex-1 min-w-0">
                     <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                       {task.title}
                     </p>
                     {task.time && (
                       <p className={`text-xs flex items-center gap-1 ${task.type === 'event' ? 'text-purple-600' : 'text-slate-400'}`}>
                         <Clock size={10} />
                         {task.time}
                       </p>
                     )}
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <Trophy size={20} className="text-yellow-500" />
             Estatísticas de Hábitos
           </h3>
           <span className="text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-medium">Melhor Streak: {bestStreak} dias</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <Tooltip cursor={{ fill: '#f1f5f9', radius: 8 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="completions" radius={[4, 4, 4, 4]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.date === todayStr ? '#6366f1' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
