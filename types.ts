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
}

export interface Book {
  id: string;
  title: string;
  author: string;
  status: 'reading' | 'completed' | 'wishlist';
  rating: number; // 0-5
  coverPlaceholder: number; // For picsum
  review: string;
}

export type Tab = 'habits' | 'tasks' | 'calendar' | 'books';

export interface SuggestionResponse {
  suggestions: string[];
}