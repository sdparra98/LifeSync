import React, { useState } from 'react';
import { Book as BookType } from '../types';
import { Plus, Star, BookOpen, Check, Clock, Sparkles } from 'lucide-react';
import { getBookReview } from '../services/geminiService';

interface BooksProps {
  books: BookType[];
  setBooks: React.Dispatch<React.SetStateAction<BookType[]>>;
}

const Books: React.FC<BooksProps> = ({ books, setBooks }) => {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  const addBook = async () => {
    if (!newTitle.trim()) return;

    // Async fetch review in background
    const tempId = crypto.randomUUID();
    const coverId = Math.floor(Math.random() * 50) + 1; // Random image id for picsum

    const newBook: BookType = {
      id: tempId,
      title: newTitle,
      author: newAuthor || 'Autor Desconhecido',
      status: 'wishlist',
      rating: 0,
      coverPlaceholder: coverId,
      review: 'Gerando resumo com IA...'
    };

    setBooks(prev => [newBook, ...prev]);
    setShowForm(false);
    setNewTitle('');
    setNewAuthor('');

    // Fetch AI Review
    const review = await getBookReview(newBook.title, newBook.author);
    setBooks(prev => prev.map(b => b.id === tempId ? { ...b, review } : b));
  };

  const updateStatus = (id: string, status: BookType['status']) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const updateRating = (id: string, rating: number) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, rating } : b));
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Biblioteca</h2>
          <p className="text-slate-500 text-sm">Acompanhe suas leituras e insights.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Adicionar
        </button>
      </header>

      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-2">
          <input
            className="w-full mb-3 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Título do Livro"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <input
            className="w-full mb-3 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Autor"
            value={newAuthor}
            onChange={e => setNewAuthor(e.target.value)}
          />
          <button onClick={addBook} className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium">Salvar Livro</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {books.map(book => (
          <div key={book.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4">
            <img 
              src={`https://picsum.photos/seed/${book.id}/200/300`} 
              alt="Cover" 
              className="w-24 h-36 object-cover rounded-lg shadow-md flex-shrink-0 bg-slate-200"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 line-clamp-2">{book.title}</h3>
                  <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${book.status === 'reading' ? 'bg-blue-100 text-blue-700' : 
                      book.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {book.status === 'reading' ? 'Lendo' : book.status === 'completed' ? 'Lido' : 'Lista'}
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-2">{book.author}</p>
                
                {/* AI Review Snippet */}
                <div className="bg-slate-50 p-2 rounded-lg mb-2">
                  <div className="flex items-center gap-1 text-xs text-indigo-500 font-semibold mb-1">
                    <Sparkles size={10} />
                    <span>IA Resumo</span>
                  </div>
                  <p className="text-xs text-slate-600 italic line-clamp-3 leading-relaxed">"{book.review}"</p>
                </div>
              </div>

              <div className="flex justify-between items-end">
                 <div className="flex gap-1">
                   {[1, 2, 3, 4, 5].map(star => (
                     <button key={star} onClick={() => updateRating(book.id, star)}>
                       <Star size={16} className={`${star <= book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                     </button>
                   ))}
                 </div>
                 
                 <div className="flex gap-2">
                    <button 
                      onClick={() => updateStatus(book.id, 'reading')}
                      className={`p-2 rounded-full ${book.status === 'reading' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                    >
                      <BookOpen size={16} />
                    </button>
                    <button 
                      onClick={() => updateStatus(book.id, 'completed')}
                      className={`p-2 rounded-full ${book.status === 'completed' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                    >
                      <Check size={16} />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Books;
