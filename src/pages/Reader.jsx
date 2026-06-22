import React, { useState, useEffect, useMemo } from 'react';
import { bookContent } from '../assets/bookContent';
import { Menu, X } from 'lucide-react';

export function Reader({ book, onBack }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(1.05); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  // --- 1. MESIN PEMISAH KALIMAT (SEKARANG MENDUKUNG BUKU DINAMIS) ---
  const { pages, toc } = useMemo(() => {
    // LOGIKA BARU: Jika buku punya teks sendiri (misal dari PDF), gunakan itu.
    // Jika kosong, gunakan default bookContent (Asharoh)
    const sourceText = book?.content || bookContent;
    const lines = typeof sourceText === 'string' ? sourceText.split('\n') : [];
    
    const tocItems = [];
    const cleanParagraphs = [];

    lines.forEach(line => {
      if (line.includes('|') && /\d+$/.test(line.trim())) {
        tocItems.push(line);
      } else if (!line.includes('**DAFTAR ISI**')) {
        cleanParagraphs.push(line);
      }
    });

    const paginated = [];
    let currPage = [];
    let currLen = 0;
    const MAX_CHAR_PER_PAGE = 850; 

    cleanParagraphs.forEach(para => {
      const text = para.replace(/\s+/g, ' ').trim();
      if (!text) return;

      const words = text.split(' ');
      let currentSentenceChunk = [];
      let currentSentenceLen = 0;

      words.forEach(word => {
        currentSentenceChunk.push(word);
        currentSentenceLen += word.length + 1;

        const isNumberList = /^\d+\.$/.test(word) || /^\*\*\d+\.\*\*$/.test(word);
        const isEndOfSentence = (/[.!?]$/.test(word) || /[.!?]\*\*$/.test(word) || /[.!?]"$/.test(word)) && !isNumberList;

        if (isEndOfSentence) {
           if (currLen + currentSentenceLen > MAX_CHAR_PER_PAGE && currPage.length > 0) {
             paginated.push(currPage);
             currPage = [];
             currLen = 0;
           }
           
           currPage.push({ text: currentSentenceChunk.join(' ') + ' ', isParagraph: false });
           currLen += currentSentenceLen;
           
           currentSentenceChunk = [];
           currentSentenceLen = 0;
        }
      });

      if (currentSentenceChunk.length > 0) {
         if (currLen + currentSentenceLen > MAX_CHAR_PER_PAGE && currPage.length > 0) {
             paginated.push(currPage);
             currPage = [];
             currLen = 0;
         }
         currPage.push({ text: currentSentenceChunk.join(' '), isParagraph: false });
         currLen += currentSentenceLen;
      }

      currPage.push({ text: '', isParagraph: true });
      currLen += 40; 
    });

    if (currPage.length > 0) {
      paginated.push(currPage);
    }

    return { pages: paginated, toc: tocItems };
  }, [book]); // Menambahkan 'book' sebagai dependency agar halaman di-render ulang saat buku ganti

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < pages.length - 1) setCurrentPage(c => c + 1);
  };
  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(c => c - 1);
  };

  const increaseFont = () => setFontSize(prev => Math.min(prev + 0.1, 1.6));
  const decreaseFont = () => setFontSize(prev => Math.max(prev - 0.1, 0.85));

  // --- 2. LOGIKA DAFTAR ISI SAMA PERSIS (EXACT MATCH) ---
  const handleTocClick = (tocEntry) => {
    const titleTarget = tocEntry.split('|')[0].replace(/\*\*/g, '').trim().toLowerCase();
    let foundIndex = -1;

    for (let i = 0; i < pages.length; i++) {
      const pageTextClean = pages[i].map(item => item.text || '').join(' ').replace(/\*\*/g, '').toLowerCase();
      if (pageTextClean.includes(titleTarget)) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      setCurrentPage(foundIndex);
      setIsSidebarOpen(false); 
    } else {
      alert(`Pencarian Gagal!\n\nJudul di Daftar Isi: "${tocEntry.split('|')[0].trim()}"\n\nPastikan di dalam isi buku Anda sudah menulis kalimat tersebut dengan ejaan yang sama persis.`);
    }
  };

  const formatBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={styles.boldText}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderPageContent = (pageItems) => {
    const html = [];
    let currentParaText = "";
    
    pageItems.forEach((item, index) => {
       if (item.isParagraph) {
          if (currentParaText.trim()) {
             html.push(
               <p key={index} style={{...styles.paragraph, fontSize: `${fontSize}rem`}}>
                 {formatBoldText(currentParaText)}
               </p>
             );
          }
          currentParaText = ""; 
       } else {
          currentParaText += item.text;
       }
    });
    
    if (currentParaText.trim()) {
       html.push(
         <p key="last" style={{...styles.paragraph, fontSize: `${fontSize}rem`}}>
           {formatBoldText(currentParaText)}
         </p>
       );
    }

    return html;
  };

  if (pages.length === 0) return (
     <div style={{...styles.page, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white'}}>
        <p>Gagal memuat isi buku atau buku kosong.</p>
        <button onClick={onBack} style={{...styles.backButton, marginLeft: '10px'}}>Kembali</button>
     </div>
  );

  return (
    <div style={styles.page}>
      
      {/* --- SIDEBAR DAFTAR ISI --- */}
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
              {toc.length > 0 ? toc.map((item, index) => {
                const parts = item.split('|');
                return (
                  <div key={index} onClick={() => handleTocClick(item)} style={styles.tocLink}>
                    <span style={styles.tocText}>{parts[0].trim()}</span>
                  </div>
                );
              }) : (
                <p style={{color: '#888', textAlign: 'center', marginTop: '20px'}}>Tidak ada daftar isi ditemukan</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- BAR ATAS --- */}
      <div style={styles.topBar}>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
           <button onClick={onBack} style={styles.backButton}>← Beranda</button>
           <button onClick={() => setIsSidebarOpen(true)} style={styles.iconBtn}>
             <Menu size={22} />
           </button>
        </div>

        <span style={styles.headerTitle}>{book?.title || 'Membaca'}</span>

        <div style={styles.fontControls}>
          <button onClick={decreaseFont} style={styles.fontBtn}>A-</button>
          <button onClick={increaseFont} style={styles.fontBtn}>A+</button>
        </div>
      </div>

      {/* --- AREA TEKS --- */}
      <div style={styles.readerContainer}>
        <div style={styles.paper}>
          {renderPageContent(pages[currentPage])}
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
        <span style={styles.pageIndicator}>Hal. {currentPage + 1} dari {pages.length}</span>
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

const styles = {
  page: {
    backgroundColor: '#1E1E1E',
    minHeight: '100vh',
    fontFamily: '"Lora", Georgia, serif',
    paddingBottom: '85px', 
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
    fontSize: '0.85rem',
    fontFamily: '"DM Sans", sans-serif',
  },
  headerTitle: {
    fontSize: '0.9rem',
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
    padding: '4px 10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '0.85rem',
  },
  readerContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '15px 10px 30px',
  },
  paper: {
    backgroundColor: '#FDF6E3',
    color: '#2C2825',
    maxWidth: '750px',
    width: '100%',
    padding: '30px 25px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    minHeight: '60vh', 
  },
  paragraph: {
    marginBottom: '16px',
    textAlign: 'justify',
    lineHeight: '1.85',
    transition: 'font-size 0.15s ease',
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
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 -4px 15px rgba(0,0,0,0.4)',
    zIndex: 40,
  },
  pageIndicator: {
    fontSize: '0.85rem',
    color: '#888',
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: 'bold',
  },
  navBtn: {
    backgroundColor: '#2c3e50',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '0.9rem',
  },
  navBtnDisabled: {
    backgroundColor: '#333',
    color: '#666',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '0.9rem',
  },
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
    padding: '10px 15px',
    overflowY: 'auto',
    flexGrow: 1,
  },
  tocLink: {
    padding: '14px 10px',
    borderBottom: '1px solid #2a2a2a',
    cursor: 'pointer',
    color: '#B0B0B0',
  },
  tocText: {
    fontSize: '1rem',
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: '500',
  }
};
