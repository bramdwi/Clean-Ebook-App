import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, Loader, AlertCircle } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import styles from './Reader.module.css';
import { loadPDF } from '../utils/pdfStorage';

// Use bundled worker to avoid CDN CORS issues
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function Reader({ book, onBack, onUpdateProgress }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(book.currentPage > 0 ? book.currentPage : 1);
  const [scale, setScale] = useState(1.0);
  const [showControls, setShowControls] = useState(true);
  const [pdfData, setPdfData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(true);
  const controlsTimer = useRef(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  // Load PDF from IndexedDB on mount
  useEffect(() => {
    async function fetchPDF() {
      setIsLoadingFile(true);
      setLoadError(null);
      try {
        const data = await loadPDF(book.id);
        if (!data) {
          setLoadError('PDF not found. Please re-upload this book.');
        } else {
          // Convert ArrayBuffer to Uint8Array for react-pdf
          setPdfData(new Uint8Array(data));
        }
      } catch (e) {
        setLoadError('Failed to load PDF: ' + e.message);
      } finally {
        setIsLoadingFile(false);
      }
    }
    fetchPDF();
  }, [book.id]);

  useEffect(() => {
    const handleResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
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

  const onDocumentLoadSuccess = ({ numPages: n }) => {
    setNumPages(n);
    // Save total pages
    if (!book.pages || book.pages !== n) {
      onUpdateProgress(book.id, book.currentPage || 0);
    }
  };

  const handleTap = (e) => {
    if (window.getSelection().toString()) return;
    const x = e.clientX / window.innerWidth;
    if (x < 0.2) goTo(currentPage - 1);
    else if (x > 0.8) goTo(currentPage + 1);
    else setShowControls(c => !c);
  };

  const progress = numPages ? Math.round((currentPage / numPages) * 100) : 0;

  return (
    <div className={styles.page}>
      {/* Top bar */}
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
          <button onClick={() => setScale(s => Math.max(0.5, +(s - 0.15).toFixed(2)))} aria-label="Zoom out">
            <Minus size={16} />
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(2.5, +(s + 0.15).toFixed(2)))} aria-label="Zoom in">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.readerArea} onClick={handleTap}>
        {isLoadingFile && (
          <div className={styles.loadingState}>
            <Loader size={32} className={styles.spinner} />
            <p>Loading PDF...</p>
          </div>
        )}

        {!isLoadingFile && loadError && (
          <div className={styles.noFile}>
            <AlertCircle size={40} />
            <p>{loadError}</p>
            <button className={styles.reuploadBtn} onClick={onBack}>
              Go back
            </button>
          </div>
        )}

        {!isLoadingFile && pdfData && (
          <Document
            file={{ data: pdfData }}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(e) => setLoadError('Error rendering PDF: ' + e.message)}
            loading={
              <div className={styles.loadingState}>
                <Loader size={28} className={styles.spinner} />
                <p>Rendering...</p>
              </div>
            }
            className={styles.pdfDoc}
          >
            <Page
              pageNumber={currentPage}
              width={Math.min(containerWidth * scale, containerWidth)}
              renderTextLayer={true}
              renderAnnotationLayer={false}
              loading=""
            />
          </Document>
        )}
      </div>

      {/* Bottom bar */}
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
