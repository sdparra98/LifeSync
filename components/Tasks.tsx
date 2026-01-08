
import React, { useState } from 'react';
import { Plus, Circle, CheckCircle2, Trash2, Wand2, Calendar, Clock, Sun, AlertTriangle, CalendarDays, Bell, BellOff } from 'lucide-react';
import { Task } from '../types';
import { breakDownTask } from '../services/geminiService';

interface TasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const Tasks: React.FC<TasksProps> = ({ tasks, setTasks }) => {
  const [newTask, setNewTask] = useState('');
  const [loadingTask, setLoadingTask] = useState<string | null>(null);

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(new Date());

  const tasksTodayCount = tasks.filter(t => !t.completed && t.dueDate === todayStr).length;
  const tasksPendingCount = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
  const tasksFutureCount = tasks.filter(t => !t.completed && t.dueDate && t.dueDate > todayStr).length;

  const addTask = (title: string) => {
    if (!title.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      priority: 'medium',
      dueDate: todayStr,
      type: 'task',
      reminderSet: false,
      notified: false
    };
    setTasks(prev => [task, ...prev]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleReminder = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, reminderSet: !t.reminderSet, notified: false } : t));
  };

  const handleBreakdown = async (task: Task) => {
    setLoadingTask(task.id);
    const subtasks = await breakDownTask(task.title);
    if (subtasks.length > 0) {
      setTasks(prev => {
        const filtered = prev.filter(t => t.id !== task.id);
        const newTasks = subtasks.map(st => ({
            id: crypto.randomUUID(),
            title: st,
            completed: false,
            priority: task.priority,
            dueDate: task.dueDate,
            type: 'task',
            reminderSet: false,
            notified: false
        } as Task));
        return [...newTasks, ...filtered];
      });
    }
    setLoadingTask(null);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
    if (a.dueDate !== b.dueDate) return (a.dueDate || '').localeCompare(b.dueDate || '');
    return 0;
  });

  return (
    <div className="space-y-6 pb-24">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Tarefas</h2>
        <p className="text-slate-500 text-sm">Organize seu dia com eficiência.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200 col-span-2 md:col-span-1">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sun size={20} className="text-white" />
            </div>
            <span className="text-3xl font-bold">{tasksTodayCount}</span>
          </div>
          <p className="font-medium text-sm text-blue-100">Para Hoje</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <span className="text-3xl font-bold text-slate-800">{tasksPendingCount}</span>
          </div>
          <p className="font-medium text-sm text-slate-500">Pendentes</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CalendarDays size={20} className="text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-slate-800">{tasksFutureCount}</span>
          </div>
          <p className="font-medium text-sm text-slate-500">Futuras</p>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask(newTask)}
          placeholder="Adicionar nova tarefa para hoje..."
          className="w-full pl-4 pr-12 py-4 rounded-xl shadow-sm border-none bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-pink-500 outline-none text-slate-700 placeholder:text-slate-400"
        />
        <button onClick={() => addTask(newTask)} className="absolute right-2 top-2 p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {sortedTasks.map(task => {
          const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
          const isFuture = !task.completed && task.dueDate && task.dueDate > todayStr;
          
          return (
            <div key={task.id} className={`group flex items-center gap-3 p-4 bg-white rounded-xl border transition-all
              ${task.completed ? 'border-slate-100 bg-slate-50' : isOverdue ? 'border-amber-200 shadow-sm bg-amber-50/30' : 'border-slate-200 shadow-sm'} 
            `}>
              {task.type !== 'event' ? (
                <button onClick={() => toggleTask(task.id)} className={`flex-shrink-0 ${task.completed ? 'text-pink-500' : isOverdue ? 'text-amber-500' : 'text-slate-300 hover:text-pink-400'}`}>
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
              ) : (
                <div className="flex-shrink-0 w-6 flex justify-center"><div className="w-1.5 h-6 bg-purple-400 rounded-full"></div></div>
              )}
              
              <div className="flex-1">
                <span className={`text-base block ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {task.title}
                </span>
                <div className="flex gap-3 mt-1">
                  {task.dueDate && (
                    <span className={`text-[10px] flex items-center gap-1 
                      ${task.completed ? 'text-slate-300' : isOverdue ? 'text-amber-600 font-bold' : isFuture ? 'text-purple-500 font-medium' : 'text-slate-400'}`}
                    >
                      <Calendar size={10} />
                      {new Date(task.dueDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      {isOverdue && !task.completed && " (Atrasada)"}
                    </span>
                  )}
                  {task.time && (
                    <span className={`text-[10px] flex items-center gap-1 ${task.completed ? 'text-slate-300' : 'text-purple-500 font-medium'}`}>
                      <Clock size={10} />
                      {task.time}
                    </span>
                  )}
                  {task.reminderSet && !task.completed && (
                    <span className="text-[10px] flex items-center gap-1 text-indigo-500 font-bold">
                       <Bell size={10} /> Ativo
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!task.completed && task.time && (
                  <button 
                    onClick={() => toggleReminder(task.id)}
                    className={`p-2 rounded-lg transition-all ${task.reminderSet ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-indigo-400'}`}
                    title={task.reminderSet ? "Desativar Lembrete" : "Ativar Lembrete"}
                  >
                    {task.reminderSet ? <Bell size={16} /> : <BellOff size={16} />}
                  </button>
                )}

                {!task.completed && task.type === 'task' && (
                  <button 
                    onClick={() => handleBreakdown(task)}
                    disabled={!!loadingTask}
                    className="opacity-0 group-hover:opacity-100 text-purple-500 hover:bg-purple-50 p-2 rounded-lg transition-all"
                    title="Dividir tarefa com IA"
                  >
                    {loadingTask === task.id ? <span className="animate-spin block w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"/> : <Wand2 size={16} />}
                  </button>
                )}

                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-2 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}

        {sortedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <CheckCircle2 size={48} className="mb-4 text-slate-200" />
            <p>Tudo limpo por aqui!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
