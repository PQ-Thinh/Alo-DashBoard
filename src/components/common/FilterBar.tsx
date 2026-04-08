import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import styles from './FilterBar.module.css';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  onSearch: (query: string) => void;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
  }[];
  onFilterChange?: (key: string, value: string) => void;
  onReset?: () => void;
}

export default function FilterBar({ onSearch, filters, onFilterChange, onReset }: FilterBarProps) {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    onSearch('');
  };

  return (
    <div className={styles.filterBar}>
      <form className={styles.searchWrapper} onSubmit={handleSearchSubmit}>
        <Search className={styles.searchIcon} size={18} />
        <input 
          type="text" 
          placeholder="Search..." 
          className={styles.searchInput}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <button type="button" className={styles.clearBtn} onClick={handleClearSearch}>
            <X size={14} />
          </button>
        )}
      </form>

      <div className={styles.filtersGroup}>
        {filters?.map((filter) => (
          <div key={filter.key} className={styles.selectWrapper}>
            <select 
              className={styles.select}
              onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}

        {onReset && (
          <button className={styles.resetBtn} onClick={onReset}>
            <Filter size={16} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
