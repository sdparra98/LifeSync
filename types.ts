
export interface Habit {
  id: string;
  name: string;
  category: string;
  completedDates: string[]; // ISO Date strings YYYY-MM-DD
  streak: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  time?: string; // HH:MM format
  priority: 'low' | 'medium' | 'high';
  type?: 'task' | 'event'; // 'task' is checkable, 'event' is a schedule item
  reminderSet?: boolean; // Se o usuário quer ser notificado
  notified?: boolean; // Se a notificação já foi enviada
}

export interface Book {
  id: string;
  title: string;
  author: string;
  status: 'reading' | 'completed' | 'wishlist';
  rating: number; // 0-5
  coverPlaceholder: number; // For picsum
  coverUrl?: string; // Official book cover URL
  review: string; // AI Review
  totalPages: number;
  currentPage: number;
  userNotes?: string;
}

export interface StudyLog {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  duration: number; // Duration in decimal hours
  notes?: string;
}

export type Tab = 'habits' | 'tasks' | 'calendar' | 'books' | 'study';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface SuggestionResponse {
  suggestions: string[];
}
