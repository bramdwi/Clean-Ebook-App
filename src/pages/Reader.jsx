import React, { useState, useEffect, useMemo } from 'react';
import { bookContent } from '../assets/bookContent';
import { Menu, X } from 'lucide-react'; // Menggunakan ikon bawaan yang sudah ada di proyek Anda

export function Reader({ book, onBack }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(1.05); // Ukuran huruf bawaan (dalam rem)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Kontrol menu Hamburger

  // --- 1. MESIN PEMISAH & PAGINASI ---
  const { pages, toc } = useMemo(() => {
    const lines = bookContent.split('\n');
    const tocItems = [];
    const contentLines = [];

    // Pisahkan Daftar Isi dari teks utama
    lines.forEach(line => {
      // Deteksi baris yang berisi '|' dan diakhiri angka
      if (line.includes('|') && /\d+$/.test(line.trim())) {
        tocItems.push(line);
      } else if (!line.includes('**DAFTAR ISI**')) {
        // Masukkan ke teks utama jika bukan judul daftar isi
        contentLines.push(line);
      }
    });

    // Paginasi teks utama menjadi lebih pendek
    const paginated = [];
    let currPage = [];
    let currLen = 0;
    const MAX_CHAR_PER_PAGE = 750; // Jauh lebih pendek agar pas di HP

    contentLines.filter(p => p.trim() !== '').forEach(p => {
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

    return { pages: paginated, toc: tocItems };
  }, []);

  // Kembali ke atas kertas setiap ganti halaman
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Kontrol Halaman
  const handleNext = () => {
    if (currentPage < pages.length - 1) setCurrentPage(c => c + 1);
  };
  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(c => c - 1);
  };

  // Kontrol Ukuran Huruf
  const increaseFont = () => setFontSize(prev => Math.min(prev + 0.1, 1.8));
  const decreaseFont = () => setFontSize(prev => Math.max(prev - 0.1, 0.8));

  // --- 2. LOGIKA KLIK DAFTAR ISI ---
  const handleTocClick = (tocEntry) => {
    const cleanTitle = tocEntry.split('|')[0].replace(/\./g, '').trim().toLowerCase();
    
    let foundIndex = -1;
    for (let i = 0; i < pages.length; i++) {
      const pageText = pages[i].join(' ').toLowerCase();
      if (pageText.includes(cleanTitle)) {
         foundIndex = i;
         break;
      }
    }

    if (foundIndex !== -1) {
      setCurrentPage(foundIndex);
      setIsSidebarOpen(false); // Tutup sidebar setelah melompat ke halaman
    } else {
      alert(`Bagian "${tocEntry.split('|')[0].trim()}" belum tersedia di isi buku.`);
    }
  };

  // --- 3. FORMATTER DESAIN BUKU ---
  const formatParagraph = (text, index) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={index} style={{ ...styles.paragraph, fontSize: `${fontSize}rem` }}>
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
      
      {/* --- MENU HAMBURGER (SIDEBAR) --- */}
      {isSidebarOpen && (
        <div style={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)}>
          <div style={styles.sidebar} onClick={e => e.stopPropagation()}>
            <div style={styles.sidebarHeader}>
              <h2 style={styles.sidebarTitle}>Daftar Isi</h2>
              <button onClick={() => setIsSidebarOpen(false)} style={styles.iconBtn}>
                <X size={24} color="#E8E8E8" />
              </button>
            </div>
            <div style={styles.sidebarContent}>
              {toc.map((item, index) => {
                const parts = item.split('|');
                return (
                  <div key={index} onClick={() => handleTocClick(item)} style={styles.tocLink}>
                    <span style={styles.tocText}>{parts[0].trim()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER ATAS --- */}
      <div style={styles.topBar}>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
           <button onClick={onBack} style={styles.backButton}>←</button>
           <button onClick={() => setIsSidebarOpen(true)} style={styles.iconBtn}>
             <Menu size={22} />
           </button>
        </div>

        <span style={styles.headerTitle}>{book?.title || 'Membaca'}</span>

        {/* Kontrol Font */}
        <div style={styles.fontControls}>
          <button onClick={decreaseFont} style={styles.fontBtn}>A-</button>
          <button onClick={increaseFont} style={styles.fontBtn}>A+</button>
        </div>
      </div>

      {/* --- KERTAS BUKU UTAMA --- */}
      <div style={styles.readerContainer}>
        <div style={styles.paper}>
          {pages[currentPage].map((p, i) => formatParagraph(p, i))}
        </div>
      </div>

      {/* --- NAVIGASI BAWAH --- */}
      <div style={styles.bottomBar}>
        <button 
          disabled={currentPage === 0} 
          onClick={handlePrev} 
          style={currentPage === 0 ? styles.navBtnDisabled : styles.navBtn}
        >
          ← Prev
        </button>
        <span style={styles.pageIndicator}>Halaman {currentPage + 1} dari {pages.length}</span>
        <button 
          disabled={currentPage === pages.length - 1} 
          onClick={handleNext} 
          style={currentPage === pages.length - 1 ? styles.navBtnDisabled : styles.navBtn}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// --- PENGATURAN GAYA (STYLES) ---
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
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    zIndex: 40,
  },
  iconBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#E8E8E8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },
  backButton: {
    backgroundColor: 'transparent',
    color: '#E8E8E8',
    border: '1px solid #444',
    padding: '6px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  headerTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    fontFamily: '"DM Sans", sans-serif',
    color: '#A0A0A0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '40%',
    textAlign: 'center',
  },
  fontControls: {
    display: 'flex',
    gap: '6px',
  },
  fontBtn: {
    backgroundColor: '#2c3e50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontWeight: 'bold',
    cursor: 'pointer',
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
    padding: '30px 25px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    lineHeight: '1.8',
    minHeight: '65vh', 
  },
  paragraph: {
    marginBottom: '16px',
    textAlign: 'justify',
    transition: 'font-size 0.2s ease', // Animasi halus saat ganti ukuran huruf
  },
  boldText: {
    fontWeight: '700',
    color: '#1A1612',
  },
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 -4px 15px rgba(0,0,0,0.4)',
    zIndex: 40,
  },
  pageIndicator: {
    fontSize: '0.9rem',
    color: '#888',
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: 'bold',
  },
  navBtn: {
    backgroundColor: '#2c3e50',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: '"DM Sans", sans-serif',
  },
  navBtnDisabled: {
    backgroundColor: '#333',
    color: '#666',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontFamily: '"DM Sans", sans-serif',
  },
  
  // Gaya khusus Menu Hamburger (Sidebar)
  sidebarOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 100,
    display: 'flex',
  },
  sidebar: {
    backgroundColor: '#1a1a1a',
    width: '280px',
    height: '100%',
    boxShadow: '2px 0 15px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideIn 0.3s forwards',
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarTitle: {
    color: '#E8E8E8',
    margin: 0,
    fontSize: '1.2rem',
    fontFamily: '"DM Sans", sans-serif',
  },
  sidebarContent: {
    padding: '15px',
    overflowY: 'auto',
    flexGrow: 1,
  },
  tocLink: {
    padding: '12px 10px',
    borderBottom: '1px solid #2a2a2a',
    cursor: 'pointer',
    color: '#A0A0A0',
    transition: 'color 0.2s',
  },
  tocText: {
    fontSize: '1.05rem',
    fontFamily: '"DM Sans", sans-serif',
  }
};
