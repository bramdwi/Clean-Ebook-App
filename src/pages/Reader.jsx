import React, { useState, useEffect, useMemo } from 'react';
import { bookContent } from '../assets/bookContent';

export function Reader({ book, onBack }) {
  const [currentPage, setCurrentPage] = useState(0);

  // --- 1. MESIN PAGINASI OTOMATIS ---
  const pages = useMemo(() => {
    const paragraphs = bookContent.split('\n').filter(p => p.trim() !== '');
    const paginated = [];
    let currPage = [];
    let currLen = 0;
    const MAX_CHAR_PER_PAGE = 1200; // Standar jumlah karakter untuk 1 layar HP

    paragraphs.forEach(p => {
      if (currLen + p.length > MAX_CHAR_PER_PAGE && currPage.length > 0) {
        paginated.push(currPage);
        currPage = [p];
        currLen = p.length;
      } else {
        currPage.push(p);
        currLen += p.length;
      }
    });
    if (currPage.length > 0) paginated.push(currPage);
    return paginated;
  }, []);

  // Kembali ke atas kertas setiap ganti halaman
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < pages.length - 1) setCurrentPage(c => c + 1);
  };
  
  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(c => c - 1);
  };

  // --- 2. DAFTAR ISI CERDAS (Pencari Halaman) ---
  const handleTocClick = (tocEntry) => {
    const cleanTitle = tocEntry.split('|')[0].replace(/\./g, '').trim().toLowerCase();
    
    let foundIndex = -1;
    // Mencari kata di semua halaman (kecuali halaman 0 tempat daftar isi berada)
    for (let i = 1; i < pages.length; i++) {
      const pageText = pages[i].join(' ').toLowerCase();
      if (pageText.includes(cleanTitle)) {
         foundIndex = i;
         break;
      }
    }

    if (foundIndex !== -1) {
      setCurrentPage(foundIndex);
    } else {
      alert(`Maaf, bagian "${tocEntry.split('|')[0].trim()}" sepertinya ada di sisa teks yang belum Anda masukkan, atau penulisan judulnya sedikit berbeda di dalam isi buku.`);
    }
  };

  // --- 3. FORMATTER DESAIN BUKU ---
  const formatParagraph = (text, index) => {
    // Menyulap teks menjadi Tombol Daftar Isi jika sesuai format "Judul | Angka"
    if (text.includes('|') && /\d+$/.test(text.trim())) {
      const parts = text.split('|');
      return (
        <div 
          key={index} 
          onClick={() => handleTocClick(text)}
          style={styles.tocLink}
        >
          <span style={styles.tocText}>{parts[0].trim()}</span>
          <span style={styles.tocDots}></span>
          <span style={styles.tocPage}>{parts[1].trim()}</span>
        </div>
      );
    }

    // Paragraf biasa dengan deteksi huruf tebal
    const parts = text.split(/(\*\*.*?\*\*)/g);
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
  };

  if (pages.length === 0) return null;

  return (
    <div style={styles.page}>
      {/* Header Atas */}
      <div style={styles.topBar}>
        <button onClick={onBack} style={styles.backButton}>← Kembali</button>
        <span style={styles.headerTitle}>{book?.title || 'Membaca Buku'}</span>
        <span style={styles.pageIndicator}>{currentPage + 1} / {pages.length}</span>
      </div>

      {/* Kertas Buku Utama */}
      <div style={styles.readerContainer}>
        <div style={styles.paper}>
          {pages[currentPage].map((p, i) => formatParagraph(p, i))}
        </div>
      </div>

      {/* Navigasi Bawah (Membalik Halaman) */}
      <div style={styles.bottomBar}>
        <button 
          disabled={currentPage === 0} 
          onClick={handlePrev} 
          style={currentPage === 0 ? styles.navBtnDisabled : styles.navBtn}
        >
          Halaman Sebelumnya
        </button>
        <button 
          disabled={currentPage === pages.length - 1} 
          onClick={handleNext} 
          style={currentPage === pages.length - 1 ? styles.navBtnDisabled : styles.navBtn}
        >
          Halaman Selanjutnya
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#1E1E1E',
    minHeight: '100vh',
    fontFamily: '"Lora", Georgia, serif',
    paddingBottom: '80px', 
  },
  topBar: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#1E1E1E',
    color: '#E8E8E8',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: '#A0A0A0',
    flex: 1,
    textAlign: 'center',
  },
  pageIndicator: {
    fontSize: '0.85rem',
    color: '#888',
    fontFamily: '"DM Sans", sans-serif',
  },
  readerContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px 10px 40px',
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
    minHeight: '60vh', 
  },
  paragraph: {
    marginBottom: '14px',
    textAlign: 'justify',
  },
  boldText: {
    fontWeight: '700',
    color: '#1A1612',
  },
  tocLink: {
    display: 'flex',
    alignItems: 'baseline',
    padding: '8px 0',
    cursor: 'pointer',
    marginBottom: '4px',
  },
  tocText: {
    fontWeight: '600',
    color: '#c0392b',
    fontSize: '1.1rem',
  },
  tocDots: {
    flexGrow: 1,
    borderBottom: '2px dotted #ccc',
    margin: '0 10px',
    opacity: 0.6,
  },
  tocPage: {
    fontWeight: 'bold',
    color: '#888',
  },
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    boxShadow: '0 -4px 15px rgba(0,0,0,0.4)',
    zIndex: 50,
  },
  navBtn: {
    backgroundColor: '#2c3e50',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: '"DM Sans", sans-serif',
    transition: 'background 0.2s',
  },
  navBtnDisabled: {
    backgroundColor: '#333',
    color: '#666',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontFamily: '"DM Sans", sans-serif',
  }
};
