import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, Maximize2 } from 'lucide-react';
import styles from './Reader.module.css';

// Simple text-based reader since we're using sample data (no actual PDFs)
// In production, integrate react-pdf here
export function Reader({ book, onBack, onUpdateProgress }) {
  const [currentPage, setCurrentPage] = useState(book.currentPage || 1);
  const [fontSize, setFontSize] = useState(16);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef(null);

  const totalPages = book.pages || 100;
  const progress = Math.round((currentPage / totalPages) * 100);

  const goTo = useCallback((page) => {
    const p = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(p);
    onUpdateProgress(book.id, p);
  }, [totalPages, book.id, onUpdateProgress]);

  const handleTap = (e) => {
    const x = e.clientX / window.innerWidth;
    if (x < 0.25) goTo(currentPage - 1);
    else if (x > 0.75) goTo(currentPage + 1);
    else {
      setShowControls(c => !c);
      clearTimeout(controlsTimer.current);
      if (!showControls) {
        controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
      }
    }
  };

  // Sample page content for demo
  const sampleParagraphs = [
    `${book.title} — Page ${currentPage} of ${totalPages}`,
    `This is a demonstration of the reading experience in CleanEbook. In a production environment, this would render the actual PDF content using react-pdf or pdf.js.`,
    `The reader supports smooth page navigation, adjustable font size, and progress tracking. Tap the left side to go back, right side to go forward, or the center to toggle controls.`,
    `Reading progress is automatically saved. You can return to your library at any time and continue from where you left off.`,
    `"${book.description || 'A great reading experience awaits you.'}"`,
    `— ${book.author}`,
  ];

  return (
    <div className={styles.page}>
      {/* Top controls */}
      <div className={`${styles.topBar} ${showControls ? styles.visible : ''}`}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.pageInfo}>
          <span className={styles.pageNum}>{currentPage} / {totalPages}</span>
          <div className={styles.topProgress}>
            <div className={styles.topProgressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className={styles.fontControls}>
          <button onClick={() => setFontSize(f => Math.max(12, f - 2))} aria-label="Decrease font">
            <Minus size={16} />
          </button>
          <span>{fontSize}</span>
          <button onClick={() => setFontSize(f => Math.min(24, f + 2))} aria-label="Increase font">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Reading area */}
      <div className={styles.readerArea} onClick={handleTap}>
        <div className={styles.pageContent} style={{ fontSize: `${fontSize}px` }}>
          {sampleParagraphs.map((p, i) => (
            <p key={i} className={i === 0 ? styles.pageHeader : i === 4 ? styles.quote : ''}>{p}</p>
          ))}
        </div>

        {/* Tap zones hint */}
        <div className={styles.tapHints}>
          <div className={styles.tapZone}><ChevronLeft size={20} /></div>
          <div className={styles.tapZoneCenter} />
          <div className={styles.tapZone}><ChevronRight size={20} /></div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className={`${styles.bottomBar} ${showControls ? styles.visible : ''}`}>
        <button className={styles.pageBtn} onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1}>
          <ChevronLeft size={20} />
          Prev
        </button>

        <div className={styles.sliderWrap}>
          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={e => goTo(Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.progressPct}>{progress}%</span>
        </div>

        <button className={styles.pageBtn} onClick={() => goTo(currentPage + 1)} disabled={currentPage >= totalPages}>
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
