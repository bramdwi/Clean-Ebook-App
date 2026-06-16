import { Heart, ArrowLeft, BookOpen, FileText, Calendar, Bookmark, Trash2 } from 'lucide-react';
import { BookCover } from '../components/BookCover';
import styles from './BookDetail.module.css';

export function BookDetail({ book, onBack, onRead, onFavorite, onRemove }) {
  if (!book) return null;
  const progress = book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;
  const pagesLeft = book.pages - book.currentPage;

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div className={styles.topActions}>
          <button
            className={`${styles.actionBtn} ${book.favorite ? styles.favorited : ''}`}
            onClick={() => onFavorite(book.id)}
            aria-label="Favorite"
          >
            <Heart size={20} fill={book.favorite ? 'currentColor' : 'none'} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.danger}`}
            onClick={() => { onRemove(book.id); onBack(); }}
            aria-label="Remove"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} style={{ background: book.coverColor }} />
        <BookCover book={book} size="xl" />
      </div>

      {/* Info */}
      <div className={styles.content}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>{book.author}</p>
          <span className={styles.category}>{book.category}</span>
        </div>

        {/* Progress */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Reading Progress</span>
            <span className={styles.progressPct}>{progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progressDetail}>
            <span>Page {book.currentPage} of {book.pages}</span>
            {pagesLeft > 0 && progress > 0 && <span>{pagesLeft} pages left</span>}
            {progress === 0 && <span>Not started yet</span>}
            {progress === 100 && <span className={styles.finishedTag}>✓ Finished</span>}
          </div>
        </div>

        {/* Meta grid */}
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <BookOpen size={16} className={styles.metaIcon} />
            <span className={styles.metaValue}>{book.pages}</span>
            <span className={styles.metaLabel}>Pages</span>
          </div>
          <div className={styles.metaItem}>
            <FileText size={16} className={styles.metaIcon} />
            <span className={styles.metaValue}>{book.format}</span>
            <span className={styles.metaLabel}>Format</span>
          </div>
          <div className={styles.metaItem}>
            <Bookmark size={16} className={styles.metaIcon} />
            <span className={styles.metaValue}>{book.fileSize}</span>
            <span className={styles.metaLabel}>Size</span>
          </div>
          <div className={styles.metaItem}>
            <Calendar size={16} className={styles.metaIcon} />
            <span className={styles.metaValue}>{new Date(book.addedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
            <span className={styles.metaLabel}>Added</span>
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <div className={styles.description}>
            <h3 className={styles.descTitle}>About this book</h3>
            <p className={styles.descText}>{book.description}</p>
          </div>
        )}

        {/* Tags */}
        {book.tags?.length > 0 && (
          <div className={styles.tags}>
            {book.tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        <button className={styles.readBtn} onClick={() => onRead(book.id)}>
          <BookOpen size={20} />
          {progress === 0 ? 'Start Reading' : progress === 100 ? 'Read Again' : 'Continue Reading'}
        </button>
      </div>
    </div>
  );
}
