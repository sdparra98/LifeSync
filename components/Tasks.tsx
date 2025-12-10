import React, { useState } from 'react';
import { Plus, Circle, CheckCircle2, Trash2, AlertCircle, Wand2, Calendar, Clock } from 'lucide-react';
import { Task } from '../types';
import { breakDownTask } from '../services/geminiService';

interface TasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const Tasks: React.FC<TasksProps> = ({ tasks, setTasks }) => {
  const [newTask, setNewTask] = useState('');
  const [loadingTask, setLoadingTask] = useState<string | null>(null);

  const addTask = (title: string) => {
    if (!title.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0], // Default to today
      type: 'task'
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

  const handleBreakdown = async (task: Task) => {
    setLoadingTask(task.id);
    const subtasks = await breakDownTask(task.title);
    if (subtasks.length > 0) {
      // Remove original large task and add subtasks
      setTasks(prev => {
        const filtered = prev.filter(t => t.id !== task.id);
        const newTasks = subtasks.map(st => ({
            id: crypto.randomUUID(),
            title: st,
            completed: false,
            priority: task.priority,
            dueDate: task.dueDate,
            type: 'task'
        } as Task));
        return [...newTasks, ...filtered];
      });
    }
    setLoadingTask(null);
  };

  // Sort: Incomplete first, then by date/time
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

      <div className="relative">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask(newTask)}
          placeholder="Adicionar nova tarefa para hoje..."
          className="w-full pl-4 pr-12 py-4 rounded-xl shadow-sm border-none bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-pink-500 outline-none text-slate-700 placeholder:text-slate-400"
        />
        <button 
          onClick={() => addTask(newTask)}
          className="absolute right-2 top-2 p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {sortedTasks.map(task => (
          <div key={task.id} className={`group flex items-center gap-3 p-4 bg-white rounded-xl border ${task.completed ? 'border-slate-100 bg-slate-50' : 'border-slate-200 shadow-sm'} transition-all`}>
            {task.type !== 'event' ? (
              <button onClick={() => toggleTask(task.id)} className={`flex-shrink-0 ${task.completed ? 'text-pink-500' : 'text-slate-300 hover:text-pink-400'}`}>
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
                  <span className={`text-[10px] flex items-center gap-1 ${task.completed ? 'text-slate-300' : 'text-slate-400'}`}>
                    <Calendar size={10} />
                    {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                )}
                {task.time && (
                  <span className={`text-[10px] flex items-center gap-1 ${task.completed ? 'text-slate-300' : 'text-purple-500 font-medium'}`}>
                    <Clock size={10} />
                    {task.time}
                  </span>
                )}
                {task.type === 'event' && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 rounded-md font-medium">Evento</span>}
              </div>
            </div>

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
        ))}

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