import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './Pagination.module.css';

interface PaginationProps {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  totalCount, 
  pageSize, 
  currentPage, 
  onPageChange 
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <div className={styles.info}>
        Showing <span>{(currentPage - 1) * pageSize + 1}</span> to <span>{Math.min(currentPage * pageSize, totalCount)}</span> of <span>{totalCount}</span> results
      </div>
      
      <div className={styles.controls}>
        <button 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1}
          className={styles.pageBtn}
        >
          <ChevronsLeft size={16} />
        </button>
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className={styles.pageBtn}
        >
          <ChevronLeft size={16} />
        </button>
        
        {getPageNumbers().map(num => (
          <button 
            key={num}
            onClick={() => onPageChange(num)}
            className={`${styles.pageBtn} ${currentPage === num ? styles.active : ''}`}
          >
            {num}
          </button>
        ))}
        
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className={styles.pageBtn}
        >
          <ChevronRight size={16} />
        </button>
        <button 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages}
          className={styles.pageBtn}
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
