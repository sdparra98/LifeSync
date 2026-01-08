
import React, { useState } from 'react';
import { Plus, Check, Flame, Sparkles, Trash2, X, Heart, Wallet, GraduationCap, Briefcase, Layers } from 'lucide-react';
import { Habit } from '../types';
import { getHabitSuggestions } from '../services/geminiService';

interface HabitsProps {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}

const CATEGORIES = [
  { id: 'Saúde & Bem-estar', icon: Heart, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200', lightBg: 'bg-emerald-50/50' },
  { id: 'Finanças', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200', lightBg: 'bg-amber-50/50' },
  { id: 'Estudos', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', lightBg: 'bg-blue-50/50' },
  { id: 'Trabalho', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200', lightBg: 'bg-purple-50/50' },
  { id: 'Outros', icon: Layers, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', lightBg: 'bg-slate-50/50' },
];

const Habits: React.FC<HabitsProps> = ({ habits, setHabits }) => {
  const [newHabit, setNewHabit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Saúde & Bem-estar');
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString(new Date());

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const isCompleted = h.completedDates.includes(today);
      let newDates = isCompleted
        ? h.completedDates.filter(d => d !== today)
        : [...h.completedDates, today];
      
      const newStreak = isCompleted ? Math.max(0, h.streak - 1) : h.streak + 1; 

      return { ...h, completedDates: newDates, streak: newStreak };
    }));
  };

  const addHabit = (name: string) => {
    if (!name.trim()) return;
    const habit: Habit = {
      id: crypto.randomUUID(),
      name,
      category: selectedCategory,
      completedDates: [],
      streak: 0
    };
    setHabits(prev => [...prev, habit]);
    setNewHabit('');
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleAiSuggest = async () => {
    if (!aiGoal.trim()) return;
    setIsAiLoading(true);
    const suggestions = await getHabitSuggestions(aiGoal);
    setAiSuggestions(suggestions);
    setIsAiLoading(false);
  };

  const habitsByCategory = (category: string) => {
    if (category === 'Outros') {
      const mainCategories = CATEGORIES.slice(0, 4).map(c => c.id);
      return habits.filter(h => h.category === 'Outros' || !mainCategories.includes(h.category));
    }
    return habits.filter(h => h.category === category);
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Seus Hábitos</h2>
          <p className="text-slate-500 text-sm">Construa sua melhor versão, um dia de cada vez.</p>
        </div>
        <button 
          onClick={() => setShowAiModal(true)}
          className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-2 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
        >
          <Sparkles size={16} />
          <span className="hidden sm:inline">IA Sugere</span>
        </button>
      </header>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
                  ${isSelected ? `${cat.bg} ${cat.color} ring-1 ring-inset ${cat.border}` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
                `}
              >
                <Icon size={14} />
                {cat.id}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit(newHabit)}
            placeholder={`Novo hábito de ${selectedCategory}...`}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50/50"
          />
          <button 
            onClick={() => addHabit(newHabit)}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map(cat => {
          const catHabits = habitsByCategory(cat.id);
          const Icon = cat.icon;
          if (catHabits.length === 0) return null;
          return (
            <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 col-span-full">
              <div className="flex items-center gap-2 mb-4 ml-1">
                 <div className={`p-1.5 rounded-lg ${cat.bg} ${cat.color}`}>
                    <Icon size={16} />
                 </div>
                 <h3 className="font-bold text-slate-700">{cat.id}</h3>
                 <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                   {catHabits.filter(h => h.completedDates.includes(today)).length}/{catHabits.length}
                 </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catHabits.map(habit => {
                  const isDone = habit.completedDates.includes(today);
                  return (
                    <div key={habit.id} className={`p-4 rounded-2xl border transition-all duration-300 ${isDone ? `${cat.lightBg} ${cat.border}` : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleHabit(habit.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all 
                              ${isDone ? `bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200` : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}
                            `}
                          >
                            <Check size={16} strokeWidth={3} />
                          </button>
                          <div>
                            <h3 className={`font-semibold transition-colors ${isDone ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800'}`}>{habit.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                              <Flame size={12} className={habit.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300'} />
                              <span className={habit.streak > 0 ? 'text-orange-600 font-medium' : ''}>{habit.streak} dias seguidos</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => deleteHabit(habit.id)} className="text-slate-300 hover:text-red-400 p-2 transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        })}
        {habits.length === 0 && (
          <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200 col-span-full">
            <Sparkles className="mx-auto mb-3 text-slate-300" size={32} />
            <p className="font-medium">Nenhum hábito criado ainda.</p>
            <p className="text-sm mt-1">Escolha uma categoria acima e comece sua jornada!</p>
          </div>
        )}
      </div>

      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Sparkles className="text-indigo-500" size={20}/> 
                Coach de Hábitos
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Qual é o seu objetivo?</label>
              <input 
                type="text" 
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                placeholder="Ex: Melhorar meu sono, Aprender inglês..."
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
              />
            </div>
            {aiSuggestions.length > 0 && (
              <div className="mb-6 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sugestões da IA:</p>
                {aiSuggestions.map((sug, i) => (
                  <button 
                    key={i}
                    onClick={() => { addHabit(sug); setShowAiModal(false); setAiSuggestions([]); setAiGoal(''); }}
                    className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-indigo-900 text-sm transition-colors flex items-center justify-between group border border-indigo-100"
                  >
                    {sug}
                    <div className="bg-white p-1 rounded-full text-indigo-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                       <Plus size={14} strokeWidth={3}/>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button 
              onClick={handleAiSuggest}
              disabled={isAiLoading || !aiGoal}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-slate-200"
            >
              {isAiLoading ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span> : 'Gerar Sugestões'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;
