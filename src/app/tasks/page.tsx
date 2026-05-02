'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, CheckSquare, Clock, Search, Filter, User, Calendar } from 'lucide-react';

export default function SharedTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [options, setOptions] = useState({
    query: '',
    isCompleted: undefined as boolean | undefined,
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 5,
    offset: 0
  });

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('shared_tasks')
        .select('*, creator:users!shared_tasks_creator_id_fkey(display_name), assignee:users!shared_tasks_assignee_id_fkey(display_name)', { count: 'exact' });

      if (options.query) {
        query = query.ilike('title', `%${options.query}%`);
      }

      if (options.isCompleted !== undefined) {
        query = query.eq('is_completed', options.isCompleted);
      }

      const { data, count, error } = await query
        .order(options.sortBy, { ascending: options.order === 'asc' })
        .range(options.offset, options.offset + options.limit - 1);

      if (error) {
        console.error('Supabase Error:', error);
      } else {
        setTasks(data || []);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const confirmDelete = async () => {
    const ids = itemToDelete ? [itemToDelete] : selectedIds;
    const { error } = await supabase.from('shared_tasks').delete().in('id', ids);
    if (!error) fetchTasks();
    setIsDeleteModalOpen(false);
  };

  const columns: Column<any>[] = [
    { 
      key: 'title', 
      header: 'Task Title', 
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${t.is_completed ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
            <CheckSquare size={16} />
          </div>
          <div className="flex flex-col">
            <span className={`font-bold text-sm ${t.is_completed ? 'text-zinc-400 line-through' : 'text-zinc-950 dark:text-white'}`}>{t.title}</span>
            <span className="text-[10px] text-zinc-400 font-medium">Assignee: {t.assignee?.display_name || 'Unassigned'}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'is_completed', 
      header: 'Status', 
      sortable: true,
      render: (t) => (
        <span className={`badge ${t.is_completed ? 'badge-success' : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'} uppercase text-[9px]`}>
          {t.is_completed ? 'Completed' : 'Pending'}
        </span>
      )
    },
    { 
      key: 'due_date', 
      header: 'Due Date', 
      sortable: true,
      render: (t) => (
        <div className="text-[10px] text-zinc-600 dark:text-zinc-500 font-medium flex items-center gap-1.5">
          <Calendar size={12} className="opacity-40" />
          {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No deadline'}
        </div>
      )
    },
    { 
      key: 'created_at', 
      header: 'Created', 
      sortable: true,
      render: (t) => (
        <div className="text-[10px] text-zinc-600 dark:text-zinc-500 font-medium">
          {new Date(t.created_at).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Shared Tasks</h1>
          <p className="text-zinc-500 font-medium text-sm mt-0.5">Manage and track collaborative tasks within chat groups.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-zinc-950 p-3 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" size={15} />
          <input 
            type="text" 
            placeholder="Search by title..." 
            className="w-full h-10 pl-10 pr-4 bg-zinc-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-950 border focus:border-zinc-200 dark:focus:border-zinc-800 rounded-lg text-sm outline-none transition-all"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <select 
          className="h-10 px-4 bg-zinc-100 dark:bg-zinc-900 border-transparent rounded-lg text-sm font-bold text-zinc-600 outline-none cursor-pointer w-full md:w-auto"
          onChange={(e) => setOptions(prev => ({ ...prev, isCompleted: e.target.value === '' ? undefined : e.target.value === 'true', offset: 0 }))}
        >
          <option value="">All Statuses</option>
          <option value="false">Pending</option>
          <option value="true">Completed</option>
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-border shadow-sm overflow-hidden">
        <DataTable 
          columns={columns}
          data={tasks}
          isLoading={isLoading}
          onSort={(key, order) => setOptions(prev => ({ ...prev, sortBy: key, order }))}
          onRowSelect={setSelectedIds}
          onRowClick={setSelectedItem}
          totalCount={totalCount}
          pageSize={options.limit}
          currentPage={Math.floor(options.offset / options.limit) + 1}
          onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
          actions={(t) => (
            <button 
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" 
              onClick={(e) => { e.stopPropagation(); { setItemToDelete(t.id); setIsDeleteModalOpen(true); } }}
            >
              <Trash2 size={14} />
            </button>
          )}
        />
      </div>

      <ActionToolbar selectedCount={selectedIds.length} onDelete={() => { setItemToDelete(null); setIsDeleteModalOpen(true); }} />

      <EntityModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} entity={selectedItem} title="Task Details" />

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Task" message="Remove this shared task permanently?" confirmLabel="Delete" type="danger" />
    </div>
  );
}
