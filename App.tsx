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
import { Bell } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('habits');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [logs, setLogs] = useState<StudyLog[]>([]);

  const isDirtyRef = useRef(false);

  const requestNotificationPermission = () => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  };

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
      }
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    setIsLoadingData(true);
    const userDocRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.metadata.hasPendingWrites || isDirtyRef.current) {
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
      setIsLoadingData(false);
    }, (error) => {
      console.error("Error fetching data:", error);
      setSyncStatus('error');
      setIsLoadingData(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !db || isLoadingData) return;
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
    switch (activeTab) {
      case 'habits': return <Habits habits={habits} setHabits={setHabits} />;
      case 'tasks': return <Tasks tasks={tasks} setTasks={setTasks} />;
      case 'calendar': return <CalendarView habits={habits} tasks={tasks} setTasks={setTasks} />;
      case 'books': return <Books books={books} setBooks={setBooks} />;
      case 'study': return <StudyManager logs={logs} setLogs={setLogs} />;
      default: return <Habits habits={habits} setHabits={setHabits} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        syncStatus={syncStatus} 
      />
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto pb-20 md:pb-0">
          <div className="flex items-center justify-end mb-4 md:hidden">
             {notificationPermission === 'default' && (
                <button onClick={requestNotificationPermission} className="p-2 text-indigo-600 bg-indigo-50 rounded-full">
                   <Bell size={20} />
                </button>
             )}
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;