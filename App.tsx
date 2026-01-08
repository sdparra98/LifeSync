
import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import Habits from './components/Habits';
import Tasks from './components/Tasks';
import CalendarView from './components/CalendarView';
import Books from './components/Books';
import StudyManager from './components/StudyManager';
import Login from './components/Login';
import { Tab, Habit, Task, Book, User, StudyLog } from './types';
import { auth, db } from './services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('habits');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');

  // Application Data States
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [logs, setLogs] = useState<StudyLog[]>([]);

  // Ref to track if there are unsaved local changes
  const isDirtyRef = useRef(false);

  // 1. Monitor Authentication State
  useEffect(() => {
    if (!auth) {
      setAuthInitialized(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuário',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || undefined
        });
      } else {
        setUser(null);
        setHabits([]);
        setTasks([]);
        setBooks([]);
        setLogs([]);
      }
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Data Sync (Read from Firestore)
  useEffect(() => {
    if (!user || !db) return;

    setIsLoadingData(true);
    setSyncStatus('synced');
    const userDocRef = doc(db, 'users', user.id);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      // Importante: hasPendingWrites indica que a mudança partiu daqui (local), 
      // então não precisamos resetar o estado com o que veio do servidor ainda.
      if (docSnapshot.metadata.hasPendingWrites) {
        setIsLoadingData(false);
        return;
      }

      // Se estamos com alterações locais pendentes de salvamento, ignoramos o snapshot remoto
      if (isDirtyRef.current) {
        setIsLoadingData(false);
        return;
      }

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.habits) setHabits(data.habits);
        if (data.tasks) setTasks(data.tasks);
        if (data.books) setBooks(data.books);
        if (data.studyLogs) setLogs(data.studyLogs);
      }
      
      // DESLIGA O CARREGAMENTO SEMPRE (mesmo se o documento for novo/vazio)
      setIsLoadingData(false);
    }, (error) => {
      console.error("Error fetching data:", error);
      setSyncStatus('error');
      setIsLoadingData(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Auto-Save changes to Firestore (Debounced)
  useEffect(() => {
    // Não salva se estiver carregando ou se não houver usuário
    if (!user || !db || isLoadingData) return;

    // Marca como "sujo" (tem alterações locais)
    isDirtyRef.current = true;

    const saveData = async () => {
      setSyncStatus('saving');
      try {
        await setDoc(doc(db, 'users', user.id), {
          habits,
          tasks,
          books,
          studyLogs: logs,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
        
        isDirtyRef.current = false;
        setSyncStatus('synced');
      } catch (error) {
        console.error("Error saving data:", error);
        setSyncStatus('error');
      }
    };

    const timeoutId = setTimeout(saveData, 2000); 
    return () => clearTimeout(timeoutId);
  }, [habits, tasks, books, logs, user, isLoadingData]);


  if (!authInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    // Mostra o spinner apenas se estiver carregando E os dados ainda estiverem vazios (primeiro load)
    if (isLoadingData && habits.length === 0 && tasks.length === 0 && books.length === 0 && logs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
           <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
           <p className="font-medium">Sincronizando seus dados...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'habits':
        return <Habits habits={habits} setHabits={setHabits} />;
      case 'tasks':
        return <Tasks tasks={tasks} setTasks={setTasks} />;
      case 'calendar':
        return <CalendarView habits={habits} tasks={tasks} setTasks={setTasks} />;
      case 'books':
        return <Books books={books} setBooks={setBooks} />;
      case 'study':
        return <StudyManager logs={logs} setLogs={setLogs} />;
      default:
        return <Habits habits={habits} setHabits={setHabits} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        syncStatus={syncStatus}
      />
      
      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20 md:pb-0">
          
          <div className="md:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                LS
              </div>
              <span className="font-bold text-slate-800">LifeSync</span>
            </div>
          </div>

          {!auth && (
             <div className="bg-amber-50 text-amber-800 p-4 rounded-xl mb-6 text-sm border border-amber-200">
               <strong>Atenção:</strong> Configure o arquivo <code>services/firebaseConfig.ts</code> para ativar o login e sincronização.
             </div>
          )}

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
