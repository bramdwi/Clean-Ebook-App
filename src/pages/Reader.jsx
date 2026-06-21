import React, { useEffect } from 'react';
import { bookContent } from '../assets/bookContent';

// Menerima prop 'book' untuk judul dan 'onBack' untuk tombol kembali
export function Reader({ book, onBack }) {
  
  // Scroll otomatis ke atas saat buku dibuka
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fungsi cerdas untuk mengubah teks \*\*tebal\*\* menjadi elemen <strong> HTML
  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      if (!line.trim()) return <br key={index} />;

      const parts = line.split(/(\*\*.*?\*\*)/g);
      
      return (
        <p key={index} style={styles.paragraph}>
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} style={styles.boldText}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div style={styles.page}>
      {/* Tombol Kembali (Terhubung langsung ke App.jsx) */}
      <div style={styles.topBar}>
        <button onClick={onBack} style={styles.backButton}>
          ← Kembali
        </button>
        <span style={styles.headerTitle}>{book?.title || 'Membaca Buku'}</span>
      </div>

      {/* Kontainer Utama Buku */}
      <div style={styles.readerContainer}>
        <div style={styles.paper}>
          {formatText(bookContent)}
        </div>
      </div>
    </div>
  );
}

// Desain E-Reader Premium
const styles = {
  page: {
    backgroundColor: '#1E1E1E',
    minHeight: '100vh',
    fontFamily: '"Lora", Georgia, serif',
  },
  topBar: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#1E1E1E',
    color: '#E8E8E8',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    zIndex: 50,
  },
  backButton: {
    backgroundColor: 'transparent',
    color: '#E8E8E8',
    border: '1px solid #444',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  headerTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    fontFamily: '"DM Sans", sans-serif',
    letterSpacing: '0.05em',
    color: '#A0A0A0',
  },
  readerContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px 10px 60px',
  },
  paper: {
    backgroundColor: '#FDF6E3',
    color: '#2C2825',
    maxWidth: '750px',
    width: '100%',
    padding: '40px 30px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    lineHeight: '1.8',
    fontSize: '1.05rem',
  },
  paragraph: {
    marginBottom: '14px',
    textAlign: 'justify',
  },
  boldText: {
    fontWeight: '700',
    color: '#1A1612',
  }
};
