import { Heart, BookOpen } from 'lucide-react';
import { BookCover } from '../components/BookCover';
import styles from './SubPage.module.css';

function EmptyState({ icon: Icon, message }) {
  return (
    <div className={styles.empty}>
      <Icon size={48} strokeWidth={1} />
      <p>{message}</p>
    </div>
  );
}

function BookRow({ book, onSelect }) {
  const progress = book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;
  return (
    <div className={styles.row} onClick={() => onSelect(book.id)}>
      <BookCover book={book} size="sm" />
      <div className={styles.rowInfo}>
        <p className={styles.rowTitle}>{book.title}</p>
        <p className={styles.rowAuthor}>{book.author}</p>
        <div className={styles.rowProgress}>
          <div className={styles.rowBar}>
            <div className={styles.rowBarFill} style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}

export function FavoritesPage({ books, onSelectBook }) {
  const favBooks = books.filter(b => b.favorite);
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Favorites</h1>
        <p className={styles.sub}>{favBooks.length} books</p>
      </header>
      <main className={styles.main}>
        {favBooks.length === 0
          ? <EmptyState icon={Heart} message="No favorites yet. Tap the heart on any book!" />
          : favBooks.map(b => <BookRow key={b.id} book={b} onSelect={onSelectBook} />)
        }
      </main>
    </div>
  );
}

export function ReadingPage({ books, onSelectBook }) {
  const reading = books.filter(b => b.currentPage > 0 && b.currentPage < b.pages);
  const finished = books.filter(b => b.currentPage >= b.pages && b.pages > 0);
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Reading</h1>
        <p className={styles.sub}>{reading.length} in progress</p>
      </header>
      <main className={styles.main}>
        {reading.length > 0 && (
          <>
            <p className={styles.sectionLabel}>In Progress</p>
            {reading.map(b => <BookRow key={b.id} book={b} onSelect={onSelectBook} />)}
          </>
        )}
        {finished.length > 0 && (
          <>
            <p className={styles.sectionLabel}>Finished</p>
            {finished.map(b => <BookRow key={b.id} book={b} onSelect={onSelectBook} />)}
          </>
        )}
        {reading.length === 0 && finished.length === 0 && (
          <EmptyState icon={BookOpen} message="Start reading a book from your library!" />
        )}
      </main>
    </div>
  );
}

export function SearchPage({ books, onSelectBook }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Search</h1>
        <p className={styles.sub}>Use the search bar in Library</p>
      </header>
      <main className={styles.main}>
        <EmptyState icon={BookOpen} message="Go to Library and use the search bar to find books." />
      </main>
    </div>
  );
}
