import { useState, useRef } from 'react';
import { Upload, FileText, X, Check, ArrowLeft } from 'lucide-react';
import styles from './UploadPage.module.css';

const CATEGORIES = ['Design', 'Business', 'Tech', 'Fiction', 'Science', 'History', 'Self-Help', 'Other'];
const COLORS = ['#8B4513','#2C3E50','#1B4332','#4A1942','#333333','#7B2D8B','#1a3a5c','#5c3317'];
const ACCENTS = ['#D2691E','#3498DB','#52B788','#C77DFF','#E63946','#F4A261','#4fc3f7','#f0a500'];

export function UploadPage({ onAdd, onBack }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null); // base64
  const [form, setForm] = useState({ title: '', author: '', category: 'Other' });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setFile(f);
    const name = f.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
    setForm(prev => ({ ...prev, title: name }));

    // Read as base64 to store in localStorage
    const reader = new FileReader();
    reader.onload = (e) => setFileData(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!form.title || !fileData) return;
    setLoading(true);
    const idx = Math.floor(Math.random() * COLORS.length);
    onAdd({
      id: Date.now().toString(),
      title: form.title,
      author: form.author || 'Unknown Author',
      category: form.category,
      cover: null,
      coverColor: COLORS[idx],
      coverAccent: ACCENTS[idx],
      pages: 0,
      currentPage: 0,
      addedAt: new Date().toISOString().split('T')[0],
      fileSize: file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : '0 MB',
      format: 'PDF',
      description: '',
      tags: [form.category],
      favorite: false,
      fileData, // base64 PDF
    });
    setLoading(false);
    setDone(true);
    setTimeout(() => { setDone(false); onBack(); }, 1200);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}><ArrowLeft size={20} /></button>
        <h2 className={styles.heading}>Add Book</h2>
        <div style={{ width: 38 }} />
      </div>

      <div className={styles.content}>
        <div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current.click()}
        >
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" hidden
            onChange={e => handleFile(e.target.files[0])} />
          {file ? (
            <div className={styles.fileInfo}>
              <FileText size={32} className={styles.fileIcon} />
              <div>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button className={styles.removeFile}
                onClick={(e) => { e.stopPropagation(); setFile(null); setFileData(null); }}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={36} className={styles.uploadIcon} />
              <p className={styles.dropText}>Drop your PDF here</p>
              <p className={styles.dropSub}>or tap to browse</p>
            </>
          )}
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Title *</label>
            <input className={styles.input} placeholder="Book title"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Author</label>
            <input className={styles.input} placeholder="Author name"
              value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <select className={styles.select} value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button
          className={`${styles.addBtn} ${done ? styles.done : ''}`}
          onClick={handleSubmit}
          disabled={!form.title || !fileData || loading}
        >
          {done ? <><Check size={20} /> Added!</> :
           loading ? 'Processing...' :
           <><Upload size={20} /> Add to Library</>}
        </button>

        {!fileData && (
          <p className={styles.hint}>* Please select a PDF file first</p>
        )}
      </div>
    </div>
  );
}
