import React, { useState, useEffect } from 'react';
import { Book as BookType } from '../types';
import { Plus, Star, Check, Sparkles, PenLine, ChevronDown, ChevronUp, BookOpenCheck, ArrowRight, Trophy, Save } from 'lucide-react';
import { getBookReview } from '../services/geminiService';
import { searchBookCover } from '../services/bookService';

interface BooksProps {
  books: BookType[];
  setBooks: React.Dispatch<React.SetStateAction<BookType[]>>;
}

const Books: React.FC<BooksProps> = ({ books, setBooks }) => {
  const [showForm, setShowForm] = useState(false);
  
  // New Book Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newPages, setNewPages] = useState('');
  const [newStatus, setNewStatus] = useState<BookType['status']>('reading');

  // Reading Log State
  const [logBookId, setLogBookId] = useState('');
  const [logStartPage, setLogStartPage] = useState('');
  const [logEndPage, setLogEndPage] = useState('');
  
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const activeBooks = books.filter(b => b.status === 'reading' || (b.status === 'wishlist' && b.currentPage > 0));

  // Auto-fill start page when book is selected
  useEffect(() => {
    if (logBookId) {
      const book = books.find(b => b.id === logBookId);
      if (book) {
        setLogStartPage(book.currentPage.toString());
        setLogEndPage('');
      }
    } else {
      setLogStartPage('');
      setLogEndPage('');
    }
  }, [logBookId, books]);

  const addBook = async () => {
    if (!newTitle.trim()) return;

    // Async fetch review in background
    const tempId = crypto.randomUUID();
    const coverId = Math.floor(Math.random() * 50) + 1; // Random image id for picsum
    const totalPagesInt = parseInt(newPages) || 300; // Default if empty

    const newBook: BookType = {
      id: tempId,
      title: newTitle,
      author: newAuthor || 'Autor Desconhecido',
      status: newStatus,
      rating: 0,
      coverPlaceholder: coverId,
      review: 'Gerando resumo com IA...',
      totalPages: totalPagesInt,
      currentPage: 0,
      userNotes: ''
    };

    setBooks(prev => [newBook, ...prev]);
    setShowForm(false);
    setNewTitle('');
    setNewAuthor('');
    setNewPages('');
    setNewStatus('reading');

    // Parallel fetch for AI Review and Cover
    Promise.all([
      getBookReview(newBook.title, newBook.author),
      searchBookCover(newBook.title, newBook.author)
    ]).then(([review, coverUrl]) => {
      setBooks(prev => prev.map(b => b.id === tempId ? { 
        ...b, 
        review,
        coverUrl: coverUrl || undefined 
      } : b));
    });
  };

  const updateStatus = (id: string, status: BookType['status']) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const updateRating = (id: string, rating: number) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, rating } : b));
  };

  const updateProgress = (id: string, page: number, total: number) => {
    const safePage = Math.min(Math.max(0, page), total);
    const newStatus = safePage >= total ? 'completed' : 'reading';
    
    setBooks(prev => prev.map(b => b.id === id ? { 
      ...b, 
      currentPage: safePage,
      status: b.status === 'completed' && safePage < total ? 'reading' : newStatus
    } : b));
  };

  const handleLogReading = () => {
    if (!logBookId || !logEndPage) return;
    
    const start = parseInt(logStartPage) || 0;
    const end = parseInt(logEndPage);
    
    if (isNaN(end) || end <= start) {
      alert("A página final deve ser maior que a inicial.");
      return;
    }

    const book = books.find(b => b.id === logBookId);
    if (!book) return;

    // Update the book progress to the END page
    updateProgress(book.id, end, book.totalPages);
    
    setLogStartPage('');
    setLogEndPage('');
    setLogBookId('');
  };

  const updateUserNotes = (id: string, notes: string) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, userNotes: notes } : b));
  };

  const handleNoteChange = (id: string, text: string) => {
    setNoteDrafts(prev => ({ ...prev, [id]: text }));
  };

  const saveNotes = (id: string) => {
    const draft = noteDrafts[id];
    if (draft !== undefined) {
      updateUserNotes(id, draft);
      // Clear draft to indicate saved state (value will fall back to book.userNotes)
      setNoteDrafts(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
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

      {/* Daily Reading Log Section */}
      {books.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-indigo-800 font-bold">
             <BookOpenCheck size={20} />
             <h3>Leitura de Hoje</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
            
            {/* Book Selector */}
            <div className="flex-1 w-full">
               <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">Livro</label>
               <select 
                  value={logBookId} 
                  onChange={(e) => setLogBookId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 text-sm"
               >
                 <option value="">Selecione...</option>
                 {activeBooks.map(b => (
                   <option key={b.id} value={b.id}>{b.title}</option>
                 ))}
                 {activeBooks.length === 0 && <option disabled>Nenhum livro em andamento</option>}
               </select>
            </div>

            {/* Page Range Inputs */}
            <div className="flex gap-2 w-full md:w-auto">
              <div className="w-1/2 md:w-24">
                 <label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">De (Pág)</label>
                 <input 
                    type="number" 
                    value={logStartPage}
                    onChange={(e) => setLogStartPage(e.target.value)}
                    className="w-full p-3 rounded-xl border border-indigo-200 bg-slate-100 text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    readOnly 
                  />
              </div>
              <div className="w-1/2 md:w-24">
                 <label className="text-xs font-semibold text-indigo-600 ml-1 mb-1 block">Até (Pág)</label>
                 <input 
                    type="number" 
                    value={logEndPage}
                    onChange={(e) => setLogEndPage(e.target.value)}
                    placeholder="..."
                    className="w-full p-3 rounded-xl border border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold text-sm"
                 />
              </div>
            </div>

            <button 
              onClick={handleLogReading}
              disabled={!logBookId || !logEndPage}
              className="w-full md:w-auto bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 font-medium text-sm min-w-[100px]"
            >
              Salvar
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add Book Form */}
      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Título do Livro"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <input
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Autor"
              value={newAuthor}
              onChange={e => setNewAuthor(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="number"
                className="w-2/3 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Total de Páginas"
                value={newPages}
                onChange={e => setNewPages(e.target.value)}
              />
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as BookType['status'])}
                className="w-1/3 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm"
              >
                <option value="reading">Lendo</option>
                <option value="wishlist">Na Lista</option>
                <option value="completed">Lido</option>
              </select>
            </div>
          </div>
          <button onClick={addBook} className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium">Salvar Livro</button>
        </div>
      )}

      {/* Books List */}
      <div className="grid grid-cols-1 gap-6">
        {books.map(book => {
          const progressPercent = Math.round((book.currentPage / (book.totalPages || 1)) * 100);
          const isNotesExpanded = expandedNotes === book.id;
          const pagesLeft = (book.totalPages || 0) - book.currentPage;
          
          // Draft Logic
          const draft = noteDrafts[book.id];
          const currentNotes = draft !== undefined ? draft : (book.userNotes || '');
          const hasUnsavedChanges = draft !== undefined && draft !== (book.userNotes || '');

          return (
            <div key={book.id} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
              
              {/* Cover Image */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <img 
                  src={book.coverUrl || `https://picsum.photos/seed/${book.id}/200/300`} 
                  alt={book.title} 
                  className="w-32 h-48 object-cover rounded-lg shadow-md bg-slate-200"
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">{book.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">{book.author}</p>
                  </div>
                  
                  {/* Status Dropdown Badge */}
                  <div className="relative group/status">
                     <select 
                        value={book.status}
                        onChange={(e) => updateStatus(book.id, e.target.value as BookType['status'])}
                        className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-bold uppercase tracking-wider outline-none border-none
                            ${book.status === 'reading' ? 'bg-blue-100 text-blue-700' : 
                              book.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}
                        `}
                     >
                        <option value="wishlist">Lista</option>
                        <option value="reading">Lendo</option>
                        <option value="completed">Lido</option>
                     </select>
                     <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none 
                        ${book.status === 'reading' ? 'text-blue-700' : 
                          book.status === 'completed' ? 'text-emerald-700' : 'text-slate-600'}`}>
                        <ChevronDown size={12} />
                     </div>
                  </div>
                </div>

                {/* Enhanced Progress Section */}
                <div className="mb-4 mt-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                   <div className="flex justify-between items-end mb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Seu Progresso</span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl font-black ${book.status === 'completed' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                            {progressPercent}%
                          </span>
                          <span className="text-xs font-medium text-slate-500">concluído</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {book.status === 'completed' ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                            <Trophy size={14} />
                            <span>Livro Finalizado!</span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                             Faltam <span className="text-slate-700">{pagesLeft}</span> pág.
                          </span>
                        )}
                      </div>
                   </div>

                   {/* Visual Bar */}
                   <div className="relative w-full h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out flex items-center justify-end pr-1
                          ${book.status === 'completed' 
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500' 
                            : 'bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500'}
                        `} 
                        style={{ width: `${progressPercent}%` }}
                      >
                         {/* Shimmer Effect */}
                         <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                      </div>
                   </div>

                   {/* Quick Edit Pages */}
                   <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/50">
                      <span className="text-xs text-slate-400">Atualizar página:</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min="0"
                          max={book.totalPages}
                          value={book.currentPage}
                          onChange={(e) => updateProgress(book.id, parseInt(e.target.value) || 0, book.totalPages)}
                          className="w-16 p-1 text-center text-sm font-bold border-b-2 border-slate-200 focus:border-indigo-500 bg-transparent outline-none transition-colors"
                        />
                        <span className="text-xs font-medium text-slate-400">/ {book.totalPages}</span>
                      </div>
                   </div>
                </div>
                
                {/* Actions & Rating */}
                <div className="flex flex-wrap justify-between items-center gap-4 mt-auto">
                   <div className="flex gap-1">
                     {[1, 2, 3, 4, 5].map(star => (
                       <button key={star} onClick={() => updateRating(book.id, star)} className="hover:scale-110 transition-transform">
                         <Star size={18} className={`${star <= book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                       </button>
                     ))}
                   </div>
                   
                   <div className="flex gap-2">
                      <button 
                        onClick={() => setExpandedNotes(isNotesExpanded ? null : book.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${book.userNotes ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        <PenLine size={14} />
                        {isNotesExpanded ? 'Fechar Notas' : 'Minhas Notas'}
                        {isNotesExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                      </button>
                      
                      {book.status !== 'completed' && (
                        <button 
                          onClick={() => updateStatus(book.id, 'completed')}
                          className="p-2 rounded-lg transition-colors bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500"
                          title="Marcar como Lido"
                        >
                          <Check size={18} />
                        </button>
                      )}
                   </div>
                </div>
              </div>

              {/* Collapsible Notes & Review Section */}
              {(isNotesExpanded || book.userNotes) && (
                 <div className={`w-full md:w-1/3 bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col ${!isNotesExpanded && 'hidden md:flex'}`}>
                    
                    {/* AI Review Snippet */}
                    <div className="mb-4 pb-4 border-b border-slate-200/60">
                      <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold uppercase mb-2">
                        <Sparkles size={12} />
                        <span>Resumo da IA</span>
                      </div>
                      <p className="text-xs text-slate-600 italic leading-relaxed">"{book.review}"</p>
                    </div>

                    {/* User Notes Input */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                          <PenLine size={12} />
                          Suas Anotações
                        </label>
                        {hasUnsavedChanges ? (
                           <button 
                             onClick={() => saveNotes(book.id)}
                             className="text-xs flex items-center gap-1 bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shadow-sm animate-pulse"
                           >
                             <Save size={12} /> Salvar
                           </button>
                        ) : (
                           <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                             <Check size={10} /> Salvo
                           </span>
                        )}
                      </div>
                      <textarea 
                        value={currentNotes}
                        onChange={(e) => handleNoteChange(book.id, e.target.value)}
                        placeholder="Escreva o que você aprendeu com este livro..."
                        className={`w-full flex-1 bg-white p-3 rounded-lg border text-sm text-slate-700 outline-none resize-none min-h-[100px] transition-all
                          ${hasUnsavedChanges ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'}`}
                      />
                    </div>
                 </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Books;