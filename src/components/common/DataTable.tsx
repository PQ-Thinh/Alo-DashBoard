'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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
    <div className="flex flex-col w-full bg-white dark:bg-zinc-900 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 shadow-xl overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="border-b-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950">
              <th className="px-6 py-4 w-12">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-950 focus:ring-zinc-950 transition-all cursor-pointer"
                    onChange={handleSelectAll}
                    checked={data.length > 0 && selectedIds.length === data.length}
                  />
                </div>
              </th>
              {columns.map((col) => (
                <th 
                  key={String(col.key)} 
                  className={`px-6 py-4 text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ${col.sortable ? 'cursor-pointer hover:text-zinc-950 dark:hover:text-white transition-colors' : ''}`}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <div className="flex flex-col opacity-60">
                        <ChevronUp size={10} className={sortConfig?.key === col.key && sortConfig.order === 'asc' ? 'text-zinc-950 dark:text-white opacity-100' : ''} />
                        <ChevronDown size={10} className={sortConfig?.key === col.key && sortConfig.order === 'desc' ? 'text-zinc-950 dark:text-white opacity-100' : ''} />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-4 text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div></td>
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-zinc-100 dark:bg-zinc-800/50 rounded w-full"></div>
                    </td>
                  ))}
                  {actions && <td className="px-6 py-4"><div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-800/50 rounded ml-auto"></div></td>}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-20 text-center text-zinc-500 font-bold dark:text-zinc-400">
                  No data found in this view
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr 
                  key={String(item[keyField])} 
                  className={`group transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${selectedIds.includes(String(item[keyField])) ? 'bg-zinc-100 dark:bg-zinc-800' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-950 focus:ring-zinc-950 transition-all cursor-pointer"
                      checked={selectedIds.includes(String(item[keyField]))}
                      onChange={() => handleSelectRow(String(item[keyField]))}
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-200 font-semibold">
                      {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-3 transition-all">
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
      
      {onPageChange && totalCount > pageSize && (
        <div className="px-6 py-4 border-t-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Showing <span className="text-zinc-950 dark:text-white">{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="text-zinc-950 dark:text-white">{totalCount}</span>
          </p>
          <Pagination 
            totalCount={totalCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
