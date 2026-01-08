import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Habits from './components/Habits';
import Tasks from './components/Tasks';
import CalendarView from './components/CalendarView';
import Books from './components/Books';
import Login from './components/Login';
import { Tab, Habit, Task, Book, User } from './types';
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
    // Subscribe to the user's document
    const userDocRef = doc(db, 'users', user.id);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        // Only update if data exists, otherwise keep defaults or empty
        // Use functional updates to prevent overwrite if local state is newer? 
        // For simplicity in this architecture, server wins on incoming sync, 
        // but local changes trigger immediate save which pushes back.
        if (data.habits) setHabits(data.habits);
        if (data.tasks) setTasks(data.tasks);
        if (data.books) setBooks(data.books);
      } else {
        // New user document doesn't exist yet, we will create it on first save
      }
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
    if (!user || !db || isLoadingData) return;

    const saveData = async () => {
      setSyncStatus('saving');
      try {
        await setDoc(doc(db, 'users', user.id), {
          habits,
          tasks,
          books,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
        setSyncStatus('synced');
      } catch (error) {
        console.error("Error saving data:", error);
        setSyncStatus('error');
      }
    };

    const timeoutId = setTimeout(saveData, 2000); // Autosave after 2s of inactivity
    return () => clearTimeout(timeoutId);
  }, [habits, tasks, books, user, isLoadingData]);


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
    if (isLoadingData && habits.length === 0 && tasks.length === 0 && books.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
           <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
           <p>Sincronizando seus dados...</p>
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
          
          {/* Mobile Header */}
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