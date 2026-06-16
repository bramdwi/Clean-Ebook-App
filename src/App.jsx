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

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const booksState = useBooks();
  const [activePage, setActivePage] = useState('library');
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [readingBookId, setReadingBookId] = useState(null);

  const selectedBook = selectedBookId ? booksState.getBook(selectedBookId) : null;
  const readingBook = readingBookId ? booksState.getBook(readingBookId) : null;

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
