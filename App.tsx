import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Habits from './components/Habits';
import Tasks from './components/Tasks';
import CalendarView from './components/CalendarView';
import Books from './components/Books';
import { Tab, Habit, Task, Book } from './types';

// Initial Mock Data
const INITIAL_HABITS: Habit[] = [
  { id: '1', name: 'Beber 2L de Água', category: 'Saúde', streak: 5, completedDates: [] },
  { id: '2', name: 'Ler 10 Páginas', category: 'Intelecto', streak: 2, completedDates: [] }
];

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Comprar mantimentos', completed: false, priority: 'high', dueDate: new Date().toISOString().split('T')[0], type: 'task' },
  { id: '2', title: 'Dentista', completed: false, priority: 'medium', dueDate: new Date().toISOString().split('T')[0], time: '14:00', type: 'event' }
];

const INITIAL_BOOKS: Book[] = [
  { id: '1', title: 'O Poder do Hábito', author: 'Charles Duhigg', status: 'reading', rating: 5, coverPlaceholder: 10, review: 'Um guia essencial para entender como os hábitos funcionam.' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('habits');

  // Load state from localStorage or use initial mock data
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('ls_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('ls_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('ls_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  // Persist state
  useEffect(() => { localStorage.setItem('ls_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('ls_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('ls_books', JSON.stringify(books)); }, [books]);

  const renderContent = () => {
    switch (activeTab) {
      case 'habits':
        return <Habits habits={habits} setHabits={setHabits} />;
      case 'tasks':
        return <Tasks tasks={tasks} setTasks={setTasks} />;
      case 'calendar':
        return <CalendarView habits={habits} tasks={tasks} setTasks={setTasks} />;
      case 'books':
        return <Books books={books} setBooks={setBooks} />;
      default:
        return <Habits habits={habits} setHabits={setHabits} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
          <div className="md:hidden flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">LifeSync</h1>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              LS
            </div>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;