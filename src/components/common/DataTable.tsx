import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Pagination from './Pagination';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  onRowSelect?: (selectedIds: string[]) => void;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  isLoading?: boolean;
  keyField?: keyof T;
  // Pagination props
  totalCount?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function DataTable<T extends Record<string, any>>({ 
  columns, 
  data, 
  onSort, 
  onRowSelect,
  onRowClick,
  actions,
  isLoading,
  keyField = 'id' as keyof T,
  totalCount = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string, order: 'asc' | 'desc' } | null>(null);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = data.map(item => String(item[keyField]));
      setSelectedIds(allIds);
      onRowSelect?.(allIds);
    } else {
      setSelectedIds([]);
      onRowSelect?.([]);
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(sid => sid !== id)
      : [...selectedIds, id];
    setSelectedIds(newSelected);
    onRowSelect?.(newSelected);
  };

  const handleSort = (key: string) => {
    const order = sortConfig?.key === key && sortConfig.order === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, order });
    onSort?.(key, order);
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkboxCol}>
              <input 
                type="checkbox" 
                onChange={handleSelectAll}
                checked={data.length > 0 && selectedIds.length === data.length}
              />
            </th>
            {columns.map((col) => (
              <th 
                key={String(col.key)} 
                className={col.sortable ? styles.sortableHeader : ''}
                onClick={() => col.sortable && handleSort(String(col.key))}
              >
                <div className={styles.headerContent}>
                  {col.header}
                  {col.sortable && sortConfig?.key === col.key && (
                    sortConfig.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </div>
              </th>
            ))}
            {actions && <th className={styles.actionsCol}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className={styles.skeletonRow}>
                <td colSpan={columns.length + 2}>
                  <div className={styles.skeleton}></div>
                </td>
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2} className={styles.noData}>
                No data found
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr 
                key={String(item[keyField])} 
                className={`${selectedIds.includes(String(item[keyField])) ? styles.selectedRow : ''} ${onRowClick ? styles.clickableRow : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(String(item[keyField]))}
                    onChange={() => handleSelectRow(String(item[keyField]))}
                  />
                </td>
                {columns.map((col) => (
                  <td key={String(col.key)}>
                    {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
                {actions && (
                  <td className={styles.actionsCell}>
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {onPageChange && (
        <Pagination 
          totalCount={totalCount}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
