import { useState } from 'react';
import { Search, SlidersHorizontal, Grid3X3, List, Sun, Moon, BookOpen } from 'lucide-react';
import { BookCover } from '../components/BookCover';
import { CATEGORIES } from '../data/books';
import styles from './Library.module.css';

export function Library({ books, filteredBooks, searchQuery, setSearchQuery,
  activeCategory, setActiveCategory, sortBy, setSortBy,
  onSelectBook, toggleFavorite, theme, toggleTheme, stats }) {

  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.logo}>Clean<span>Ebook</span></h1>
            <p className={styles.subtitle}>{stats.total} books in your library</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className={styles.statsStrip}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{stats.reading}</span>
            <span className={styles.statLabel}>Reading</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>{stats.finished}</span>
            <span className={styles.statLabel}>Finished</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>{stats.favorites}</span>
            <span className={styles.statLabel}>Favorites</span>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="search"
              placeholder="Search books, authors, tags…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            className={`${styles.iconBtn} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(f => !f)}
            aria-label="Filters"
          >
            <SlidersHorizontal size={18} />
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            aria-label="Toggle view"
          >
            {viewMode === 'grid' ? <List size={18} /> : <Grid3X3 size={18} />}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>Sort:</span>
            {['recent', 'title', 'progress'].map(opt => (
              <button
                key={opt}
                className={`${styles.filterChip} ${sortBy === opt ? styles.filterActive : ''}`}
                onClick={() => setSortBy(opt)}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Categories */}
        <div className={styles.categories}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.catChip} ${activeCategory === cat ? styles.catActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Book Grid / List */}
      <main className={styles.main}>
        {filteredBooks.length === 0 ? (
          <div className={styles.empty}>
            <BookOpen size={48} strokeWidth={1} />
            <p>No books found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={styles.grid}>
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} onSelect={onSelectBook} onFavorite={toggleFavorite} />
            ))}
          </div>
        ) : (
          <div className={styles.list}>
            {filteredBooks.map(book => (
              <BookListItem key={book.id} book={book} onSelect={onSelectBook} onFavorite={toggleFavorite} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BookCard({ book, onSelect, onFavorite }) {
  const progress = book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;
  return (
    <div className={styles.card} onClick={() => onSelect(book.id)}>
      <BookCover book={book} size="md" />
      <div className={styles.cardInfo}>
        <p className={styles.cardTitle}>{book.title}</p>
        <p className={styles.cardAuthor}>{book.author}</p>
        {progress > 0 && (
          <div className={styles.miniProgress}>
            <div className={styles.miniProgressFill} style={{ width: `${progress}%` }} />
          </div>
        )}
        {progress === 0 && <span className={styles.newBadge}>Unread</span>}
        {progress === 100 && <span className={styles.doneBadge}>Done</span>}
      </div>
    </div>
  );
}

function BookListItem({ book, onSelect, onFavorite }) {
  const progress = book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;
  return (
    <div className={styles.listItem} onClick={() => onSelect(book.id)}>
      <BookCover book={book} size="sm" />
      <div className={styles.listInfo}>
        <p className={styles.listTitle}>{book.title}</p>
        <p className={styles.listAuthor}>{book.author}</p>
        <div className={styles.listMeta}>
          <span className={styles.catTag}>{book.category}</span>
          <span className={styles.fileInfo}>{book.fileSize} · {book.format}</span>
        </div>
        <div className={styles.listProgressRow}>
          <div className={styles.listProgress}>
            <div className={styles.listProgressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.listProgressPct}>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
