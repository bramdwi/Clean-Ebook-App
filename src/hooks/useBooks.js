import { useState, useCallback } from 'react';
import { SAMPLE_BOOKS } from '../data/books';

export function useBooks() {
  const [books, setBooks] = useState(SAMPLE_BOOKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  const filteredBooks = books
    .filter(book => {
      const matchesCategory = activeCategory === 'All' || book.category === activeCategory;
      const matchesSearch = !searchQuery ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
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
    setBooks(prev => prev.filter(b => b.id !== id));
  }, []);

  const getBook = useCallback((id) => books.find(b => b.id === id), [books]);

  const readingBooks = books.filter(b => b.currentPage > 0 && b.currentPage < b.pages);
  const finishedBooks = books.filter(b => b.currentPage >= b.pages && b.pages > 0);
  const favoriteBooks = books.filter(b => b.favorite);

  return {
    books, filteredBooks, searchQuery, setSearchQuery,
    activeCategory, setActiveCategory, sortBy, setSortBy,
    toggleFavorite, updateProgress, addBook, removeBook, getBook,
    stats: {
      total: books.length,
      reading: readingBooks.length,
      finished: finishedBooks.length,
      favorites: favoriteBooks.length,
    }
  };
}
