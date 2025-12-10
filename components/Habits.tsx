import React, { useState } from 'react';
import { Plus, Check, Flame, Sparkles, Trash2, X } from 'lucide-react';
import { Habit } from '../types';
import { getHabitSuggestions } from '../services/geminiService';

interface HabitsProps {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}

const Habits: React.FC<HabitsProps> = ({ habits, setHabits }) => {
  const [newHabit, setNewHabit] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const isCompleted = h.completedDates.includes(today);
      let newDates = isCompleted
        ? h.completedDates.filter(d => d !== today)
        : [...h.completedDates, today];
      
      // Simple streak calculation (consecutive days ending today or yesterday)
      // This is a simplified version for UI demo
      const newStreak = isCompleted ? Math.max(0, h.streak - 1) : h.streak + 1; 

      return { ...h, completedDates: newDates, streak: newStreak };
    }));
  };

  const addHabit = (name: string) => {
    if (!name.trim()) return;
    const habit: Habit = {
      id: crypto.randomUUID(),
      name,
      category: 'Geral',
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

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Seus Hábitos</h2>
          <p className="text-slate-500 text-sm">Construa sua melhor versão, um dia de cada vez.</p>
        </div>
        <button 
          onClick={() => setShowAiModal(true)}
          className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-2 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
        >
          <Sparkles size={16} />
          <span>IA Sugere</span>
        </button>
      </header>

      {/* Input Area */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHabit(newHabit)}
          placeholder="Novo hábito (ex: Beber 2L de água)"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white shadow-sm"
        />
        <button 
          onClick={() => addHabit(newHabit)}
          className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map(habit => {
          const isDone = habit.completedDates.includes(today);
          return (
            <div key={habit.id} className={`p-4 rounded-2xl border transition-all duration-300 ${isDone ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDone ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                  >
                    <Check size={18} />
                  </button>
                  <div>
                    <h3 className={`font-semibold ${isDone ? 'text-indigo-900 line-through decoration-indigo-300' : 'text-slate-800'}`}>{habit.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <Flame size={12} className={habit.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300'} />
                      <span>{habit.streak} dias seguidos</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteHabit(habit.id)}
                  className="text-slate-300 hover:text-red-400 p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {habits.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p>Nenhum hábito cadastrado ainda.</p>
          </div>
        )}
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="text-indigo-500" size={20}/> 
                Coach de Hábitos
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Qual é o seu objetivo?</label>
              <input 
                type="text" 
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                placeholder="Ex: Melhorar meu sono, Aprender inglês..."
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {aiSuggestions.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Sugestões:</p>
                {aiSuggestions.map((sug, i) => (
                  <button 
                    key={i}
                    onClick={() => { addHabit(sug); setShowAiModal(false); setAiSuggestions([]); setAiGoal(''); }}
                    className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-900 text-sm transition-colors flex items-center justify-between group"
                  >
                    {sug}
                    <Plus size={16} className="opacity-0 group-hover:opacity-100 text-indigo-500"/>
                  </button>
                ))}
              </div>
            )}

            <button 
              onClick={handleAiSuggest}
              disabled={isAiLoading || !aiGoal}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
            >
              {isAiLoading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : 'Gerar Sugestões'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;
