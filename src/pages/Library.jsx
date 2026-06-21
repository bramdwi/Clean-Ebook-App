import { useState } from 'react';
import { Search, SlidersHorizontal, Grid3X3, List, Sun, Moon, BookOpen } from 'lucide-react';
import { BookCover } from '../components/BookCover';
import { useNavigate } from 'react-router-dom';

import styles from './Library.module.css';

export function Library({ books, filteredBooks, searchQuery, setSearchQuery, CATEGORIES,
  activeCategory, setActiveCategory, sortBy, setSortBy,
  onSelectBook, toggleFavorite, theme, toggleTheme, stats }) {

  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // --- 1. MENYIAPKAN BUKU STATIS (NATIVE TEXT) ---
  const staticBook = {
    id: 'static-asharoh',
    title: 'ASHAROH (Program Raiwind)',
    author: 'Ir. Soni Harsono',
    category: 'Agama',
    fileSize: 'Sangat Ringan',
    format: 'TEXT',
    pages: 1, 
    currentPage: 0,
    color: '#c0392b' // Warna sampul merah klasik
  };

  // --- 2. FILTER PENCARIAN UNTUK BUKU STATIS ---
  // Memastikan buku ini tetap bisa dicari lewat kolom search
  const matchesSearch = staticBook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        staticBook.author.toLowerCase().includes(searchQuery.toLowerCase());

  // Menggabungkan buku statis dengan buku-buku hasil upload
  const displayBooks = matchesSearch ? [staticBook, ...filteredBooks] : filteredBooks;

  // --- 3. FUNGSI KLIK KHUSUS ---
  const handleBookSelect = (id) => {
    if (id === 'static-asharoh') {
      navigate('/reader'); // Langsung buka rute Reader Native Text
    } else {
      onSelectBook(id); // Jalankan fungsi PDF biasa untuk buku lain
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.logo}>Clean<span>Ebook</span></h1>
            {/* Tambahkan +1 pada total agar buku statis ikut terhitung */}
            <p className={styles.subtitle}>{stats.total + 1} books in your library</p>
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
        {displayBooks.length === 0 ? (
          <div className={styles.empty}>
            <BookOpen size={48} strokeWidth={1} />
            <p>No books found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={styles.grid}>
            {/* Gunakan displayBooks, bukan filteredBooks */}
            {displayBooks.map(book => (
              <BookCard key={book.id} book={book} onSelect={handleBookSelect} onFavorite={toggleFavorite} />
            ))}
          </div>
        ) : (
          <div className={styles.list}>
            {/* Gunakan displayBooks, bukan filteredBooks */}
            {displayBooks.map(book => (
              <BookListItem key={book.id} book={book} onSelect={handleBookSelect} onFavorite={toggleFavorite} />
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
