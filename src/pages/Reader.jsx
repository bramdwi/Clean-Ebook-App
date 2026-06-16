import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, Loader } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import styles from './Reader.module.css';

// Set worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export function Reader({ book, onBack, onUpdateProgress }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(book.currentPage > 0 ? book.currentPage : 1);
  const [scale, setScale] = useState(1.0);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const controlsTimer = useRef(null);
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Auto-hide controls after 3s
    clearTimeout(controlsTimer.current);
    if (showControls) {
      controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(controlsTimer.current);
  }, [showControls]);

  const goTo = useCallback((page) => {
    if (!numPages) return;
    const p = Math.max(1, Math.min(numPages, page));
    setCurrentPage(p);
    onUpdateProgress(book.id, p);
    window.scrollTo(0, 0);
  }, [numPages, book.id, onUpdateProgress]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    // Update total pages if not set
    if (!book.pages || book.pages === 0) {
      onUpdateProgress(book.id, book.currentPage || 0);
    }
  };

  const handleTap = (e) => {
    // Don't navigate if user is selecting text
    if (window.getSelection().toString()) return;
    const x = e.clientX / window.innerWidth;
    if (x < 0.2) goTo(currentPage - 1);
    else if (x > 0.8) goTo(currentPage + 1);
    else {
      setShowControls(c => !c);
    }
  };

  const progress = numPages ? Math.round((currentPage / numPages) * 100) : 0;

  return (
    <div className={styles.page}>
      {/* Top controls */}
      <div className={`${styles.topBar} ${showControls ? styles.visible : ''}`}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.pageInfo}>
          <span className={styles.bookTitle}>{book.title}</span>
          <div className={styles.topProgress}>
            <div className={styles.topProgressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className={styles.fontControls}>
          <button onClick={() => setScale(s => Math.max(0.6, +(s - 0.1).toFixed(1)))} aria-label="Zoom out">
            <Minus size={16} />
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(2.0, +(s + 0.1).toFixed(1)))} aria-label="Zoom in">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* PDF Area */}
      <div className={styles.readerArea} onClick={handleTap} ref={containerRef}>
        {loading && (
          <div className={styles.loadingState}>
            <Loader size={32} className={styles.spinner} />
            <p>Loading PDF...</p>
          </div>
        )}

        {book.fileData ? (
          <Document
            file={book.fileData}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(e) => { console.error(e); setLoading(false); }}
            loading=""
            className={styles.pdfDoc}
          >
            <Page
              pageNumber={currentPage}
              width={containerWidth * scale}
              renderTextLayer={true}
              renderAnnotationLayer={false}
              loading=""
            />
          </Document>
        ) : (
          <div className={styles.noFile}>
            <p>PDF file not found.</p>
            <p>Please re-upload the book.</p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className={`${styles.bottomBar} ${showControls ? styles.visible : ''}`}>
        <button className={styles.pageBtn} onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1}>
          <ChevronLeft size={20} />
        </button>

        <div className={styles.sliderWrap}>
          <span className={styles.pageNum}>{currentPage} / {numPages || '?'}</span>
          {numPages && (
            <input type="range" min={1} max={numPages} value={currentPage}
              onChange={e => goTo(Number(e.target.value))}
              className={styles.slider} />
          )}
          <span className={styles.progressPct}>{progress}%</span>
        </div>

        <button className={styles.pageBtn} onClick={() => goTo(currentPage + 1)} disabled={!numPages || currentPage >= numPages}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
