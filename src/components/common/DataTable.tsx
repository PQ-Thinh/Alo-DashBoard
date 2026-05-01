'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Loader2 } from 'lucide-react';
import Pagination from './Pagination';

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
  pageSize = 5,
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 w-10">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                  onChange={handleSelectAll}
                  checked={data.length > 0 && selectedIds.length === data.length}
                />
              </th>
              {columns.map((col) => (
                <th 
                  key={String(col.key)} 
                  className={`px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp size={12} className={sortConfig?.key === col.key && sortConfig.order === 'asc' ? 'text-primary' : 'text-slate-300 dark:text-slate-600'} />
                        <ChevronDown size={12} className={sortConfig?.key === col.key && sortConfig.order === 'desc' ? 'text-primary' : 'text-slate-300 dark:text-slate-600'} />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                    </td>
                  ))}
                  {actions && <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded ml-auto"></div></td>}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-20 text-center text-slate-500 dark:text-slate-400 font-medium">
                  Không tìm thấy dữ liệu
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr 
                  key={String(item[keyField])} 
                  className={`group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedIds.includes(String(item[keyField])) ? 'bg-primary/5 dark:bg-primary/10' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                      checked={selectedIds.includes(String(item[keyField]))}
                      onChange={() => handleSelectRow(String(item[keyField]))}
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
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
