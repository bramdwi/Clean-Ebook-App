import { Home, BookOpen, Heart, Search, Plus } from 'lucide-react';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { id: 'library', icon: Home, label: 'Library' },
  { id: 'reading', icon: BookOpen, label: 'Reading' },
  { id: 'upload', icon: Plus, label: 'Add', special: true },
  { id: 'favorites', icon: Heart, label: 'Favorites' },
  { id: 'search', icon: Search, label: 'Search' },
];

export function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {NAV_ITEMS.map(({ id, icon: Icon, label, special }) => (
          <button
            key={id}
            className={`${styles.item} ${special ? styles.special : ''} ${activePage === id ? styles.active : ''}`}
            onClick={() => onNavigate(id)}
            aria-label={label}
          >
            {special ? (
              <div className={styles.addBtn}>
                <Icon size={22} strokeWidth={2.5} />
              </div>
            ) : (
              <>
                <Icon size={22} strokeWidth={activePage === id ? 2.5 : 1.8} />
                <span className={styles.label}>{label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
