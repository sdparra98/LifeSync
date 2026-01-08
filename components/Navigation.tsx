
import React from 'react';
import { LayoutList, CheckSquare, CalendarDays, BookOpen, GraduationCap, LogOut, User as UserIcon, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Tab, User } from '../types';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';

interface NavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  user: User | null;
  syncStatus: 'synced' | 'saving' | 'error';
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, user, syncStatus }) => {
  const tabs = [
    { id: 'habits' as Tab, icon: LayoutList, label: 'Hábitos' },
    { id: 'tasks' as Tab, icon: CheckSquare, label: 'Tarefas' },
    { id: 'calendar' as Tab, icon: CalendarDays, label: 'Calendário' },
    { id: 'books' as Tab, icon: BookOpen, label: 'Livros' },
    // Added Study tab for easier access to the new module
    { id: 'study' as Tab, icon: GraduationCap, label: 'Estudos' },
  ];

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  const getStatusDisplay = () => {
    switch (syncStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
            <RefreshCw size={12} className="animate-spin" />
            <span className="hidden md:inline">Salvando...</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-xs text- red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100" title="Verifique se o Firestore está criado no console">
            <CloudOff size={12} />
            <span className="hidden md:inline">Erro no Sync</span>
          </div>
        );
      case 'synced':
      default:
        return (
          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
            <Cloud size={12} />
            <span className="hidden md:inline">Sincronizado</span>
          </div>
        );
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 md:static md:w-64 md:h-screen md:border-r md:border-t-0 md:flex md:flex-col md:justify-between md:p-6 z-50">
      
      <div>
        <div className="hidden md:flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-200">
            LS
          </div>
          <h1 className="text-xl font-bold text-slate-800">LifeSync</h1>
        </div>

        <div className="flex justify-between items-center md:flex-col md:gap-2 md:items-stretch">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col md:flex-row items-center md:gap-3 gap-1 md:px-4 md:py-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'text-indigo-600 md:bg-indigo-50 font-semibold' 
                    : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50'}`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300 md:w-5 md:h-5 group-hover:scale-110 md:group-hover:scale-100" />
                <span className="text-[10px] md:text-sm whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block">
         <div className="border-t border-slate-100 pt-6 mb-2">
            <div className="mb-4 flex justify-center md:justify-start">
               {getStatusDisplay()}
            </div>

            <div className="flex items-center gap-3 mb-4 px-2">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : <UserIcon size={16} />}
               </div>
               <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-700 truncate">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
               </div>
            </div>
            <button 
               onClick={handleLogout}
               className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
               <LogOut size={18} />
               Sair
            </button>
         </div>
      </div>
    </nav>
  );
};

export default Navigation;