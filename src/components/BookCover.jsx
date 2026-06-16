import styles from './BookCover.module.css';

export function BookCover({ book, size = 'md' }) {
  const progress = book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;

  return (
    <div className={`${styles.cover} ${styles[size]}`}
      style={{ '--cover-color': book.coverColor, '--cover-accent': book.coverAccent }}>
      <div className={styles.spine} />
      <div className={styles.face}>
        <div className={styles.decoration} />
        <div className={styles.titleBlock}>
          <span className={styles.coverTitle}>{book.title}</span>
          <span className={styles.coverAuthor}>{book.author}</span>
        </div>
        <div className={styles.coverCategory}>{book.category}</div>
      </div>
      {progress > 0 && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
