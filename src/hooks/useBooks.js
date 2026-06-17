import { useState, useCallback, useEffect } from 'react';
import { deletePDF } from '../utils/pdfStorage';

const STORAGE_KEY = 'cleanebook-library';

function loadBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

function saveBooks(books) {
  try {
    // Never save fileData to localStorage — only metadata
    const meta = books.map(({ fileData, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
  } catch (e) {
    console.error('Failed to save books:', e);
  }
}

export function useBooks() {
  const [books, setBooks] = useState(() => loadBooks());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => { saveBooks(books); }, [books]);

  const CATEGORIES = ['All', ...Array.from(new Set(books.map(b => b.category))).filter(Boolean)];

  const filteredBooks = books
    .filter(book => {
      const matchesCategory = activeCategory === 'All' || book.category === activeCategory;
      const matchesSearch = !searchQuery ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.addedAt) - new Date(a.addedAt);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'progress') return (b.currentPage / b.pages) - (a.currentPage / a.pages);
      return 0;
    });

  const toggleFavorite = useCallback((id) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, favorite: !b.favorite } : b));
  }, []);

  const updateProgress = useCallback((id, page) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, currentPage: page } : b));
  }, []);

  const addBook = useCallback((book) => {
    setBooks(prev => [book, ...prev]);
  }, []);

  const removeBook = useCallback((id) => {
    deletePDF(id); // Clean up IndexedDB too
    setBooks(prev => prev.filter(b => b.id !== id));
  }, []);

  const getBook = useCallback((id) => books.find(b => b.id === id), [books]);

  const readingBooks = books.filter(b => b.currentPage > 0 && b.currentPage < b.pages);
  const finishedBooks = books.filter(b => b.pages > 0 && b.currentPage >= b.pages);
  const favoriteBooks = books.filter(b => b.favorite);

  return {
    books, filteredBooks, searchQuery, setSearchQuery,
    activeCategory, setActiveCategory, sortBy, setSortBy,
    CATEGORIES,
    toggleFavorite, updateProgress, addBook, removeBook, getBook,
    stats: {
      total: books.length,
      reading: readingBooks.length,
      finished: finishedBooks.length,
      favorites: favoriteBooks.length,
    }
  };
}
