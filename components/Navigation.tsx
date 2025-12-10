import React from 'react';
import { LayoutList, CheckSquare, CalendarDays, BookOpen } from 'lucide-react';
import { Tab } from '../types';

interface NavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'habits' as Tab, icon: LayoutList, label: 'Hábitos' },
    { id: 'tasks' as Tab, icon: CheckSquare, label: 'Tarefas' },
    { id: 'calendar' as Tab, icon: CalendarDays, label: 'Calendário' },
    { id: 'books' as Tab, icon: BookOpen, label: 'Livros' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 md:static md:w-64 md:h-screen md:border-r md:border-t-0 md:flex md:flex-col md:justify-start md:p-6 z-50">
      <div className="hidden md:block mb-8">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">LifeSync</h1>
      </div>
      <div className="flex justify-between items-center md:flex-col md:gap-2 md:items-stretch">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col md:flex-row items-center md:gap-3 gap-1 md:px-4 md:py-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'text-indigo-600 md:bg-indigo-50 font-semibold' 
                  : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50'}`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
