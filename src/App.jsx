import { useState } from 'react';
import { useBooks } from './hooks/useBooks';
import { useTheme } from './hooks/useTheme';
import { BottomNav } from './components/BottomNav';
import { Library } from './pages/Library';
import { BookDetail } from './pages/BookDetail';
import { Reader } from './pages/Reader';
import { UploadPage } from './pages/UploadPage';
import { FavoritesPage, ReadingPage, SearchPage } from './pages/SubPages';
import './index.css';

// --- DATA BUKU STATIS ---
const staticAsharoh = {
  id: 'static-asharoh',
  title: 'ASHAROH (Program Raiwind)',
  author: 'Ir. Soni Harsono',
  category: 'Agama',
  fileSize: 'Native Text',
  format: 'TEXT',
  pages: 1,
  currentPage: 0,
  coverColor: '#2c3e50', // Warna utama sampul (Biru gelap)
  coverAccent: '#e74c3c' // Warna aksen sampul (Merah)
};

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const booksState = useBooks();
  const [activePage, setActivePage] = useState('library');
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [readingBookId, setReadingBookId] = useState(null);

  // Jika yang dipilih adalah buku statis, gunakan data statisAsharoh. Jika tidak, cari di database.
  const selectedBook = selectedBookId === 'static-asharoh' 
    ? staticAsharoh 
    : (selectedBookId ? booksState.getBook(selectedBookId) : null);
    
  const readingBook = readingBookId === 'static-asharoh' 
    ? staticAsharoh 
    : (readingBookId ? booksState.getBook(readingBookId) : null);

  if (readingBook) {
    return (
      <Reader
        book={readingBook}
        onBack={() => setReadingBookId(null)}
        onUpdateProgress={booksState.updateProgress}
      />
    );
  }

  if (selectedBook) {
    return (
      <BookDetail
        book={selectedBook}
        onBack={() => setSelectedBookId(null)}
        onRead={(id) => { setSelectedBookId(null); setReadingBookId(id); }}
        onFavorite={booksState.toggleFavorite}
        onRemove={booksState.removeBook}
      />
    );
  }

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  return (
    <>
      {activePage === 'library' && (
        <Library
          {...booksState}
          onSelectBook={(id) => setSelectedBookId(id)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      {activePage === 'reading' && (
        <ReadingPage books={booksState.books} onSelectBook={(id) => setSelectedBookId(id)} />
      )}
      {activePage === 'upload' && (
        <UploadPage onAdd={booksState.addBook} onBack={() => setActivePage('library')} />
      )}
      {activePage === 'favorites' && (
        <FavoritesPage books={booksState.books} onSelectBook={(id) => setSelectedBookId(id)} />
      )}
      {activePage === 'search' && (
        <SearchPage books={booksState.books} onSelectBook={(id) => setSelectedBookId(id)}
          searchQuery={booksState.searchQuery} setSearchQuery={booksState.setSearchQuery}
          filteredBooks={booksState.filteredBooks} />
      )}
      <BottomNav activePage={activePage} onNavigate={handleNavigate} />
    </>
  );
}
