'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, PhoneCall, Video, VideoOff, PhoneIncoming, PhoneOutgoing, Clock, Search, Filter } from 'lucide-react';

export default function VideoCallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [options, setOptions] = useState({
    direction: undefined as string | undefined,
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 5,
    offset: 0
  });

  const fetchCalls = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('video_calls')
        .select('*, messages(sender_id, conversation_id)', { count: 'exact' });

      if (options.direction) {
        query = query.eq('direction', options.direction);
      }

      const { data, count, error } = await query
        .order(options.sortBy, { ascending: options.order === 'asc' })
        .range(options.offset, options.offset + options.limit - 1)
        .limit(options.limit);

      if (error) {
        console.error('Supabase Error:', error);
      } else {
        setCalls(data || []);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const confirmDelete = async () => {
    const ids = itemToDelete ? [itemToDelete] : selectedIds;
    const { error } = await supabase.from('video_calls').delete().in('id', ids);
    if (!error) fetchCalls();
    setIsDeleteModalOpen(false);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const columns: Column<any>[] = [
    { 
      key: 'direction', 
      header: 'Direction', 
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${c.direction === 'incoming' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500' : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950'}`}>
            {c.direction === 'incoming' ? <PhoneIncoming size={16} /> : <PhoneOutgoing size={16} />}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">{c.direction}</span>
        </div>
      )
    },
    { 
      key: 'is_video', 
      header: 'Type', 
      render: (c) => (
        <div className="flex items-center gap-2 text-zinc-500">
          {c.is_video ? <Video size={14} /> : <PhoneCall size={14} />}
          <span className="text-xs font-medium">{c.is_video ? 'Video' : 'Audio'}</span>
        </div>
      )
    },
    { 
      key: 'duration_sec', 
      header: 'Duration', 
      sortable: true,
      render: (c) => (
        <div className="text-sm font-black tracking-tight text-zinc-950 dark:text-white">
          {formatDuration(c.duration_sec || 0)}
        </div>
      )
    },
    { 
      key: 'end_reason', 
      header: 'Status', 
      render: (c) => (
        <span className={`badge ${c.end_reason === 'ended' ? 'badge-success' : 'badge-error'} uppercase text-[9px]`}>
          {c.end_reason}
        </span>
      )
    },
    { 
      key: 'created_at', 
      header: 'Call Time', 
      sortable: true,
      render: (c) => (
        <div className="text-[10px] text-zinc-600 dark:text-zinc-500 font-medium flex items-center gap-1.5">
          <Clock size={12} className="opacity-40" />
          {new Date(c.created_at).toLocaleString()}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Video Call Logs</h1>
          <p className="text-zinc-500 font-medium text-sm mt-0.5">Audit call history and duration across the platform.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-3 rounded-xl border border-border shadow-sm">
        <select 
          className="h-10 px-4 bg-zinc-100 dark:bg-zinc-900 border-transparent rounded-lg text-sm font-bold text-zinc-600 outline-none cursor-pointer w-full"
          onChange={(e) => setOptions(prev => ({ ...prev, direction: e.target.value || undefined, offset: 0 }))}
        >
          <option value="">All Directions</option>
          <option value="incoming">Incoming</option>
          <option value="outgoing">Outgoing</option>
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-border shadow-sm overflow-hidden">
        <DataTable 
          columns={columns}
          data={calls}
          isLoading={isLoading}
          onSort={(key, order) => setOptions(prev => ({ ...prev, sortBy: key, order }))}
          onRowSelect={setSelectedIds}
          onRowClick={setSelectedItem}
          totalCount={totalCount}
          pageSize={options.limit}
          currentPage={Math.floor(options.offset / options.limit) + 1}
          onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
          actions={(c) => (
            <button 
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" 
              onClick={(e) => { e.stopPropagation(); { setItemToDelete(c.id); setIsDeleteModalOpen(true); } }}
            >
              <Trash2 size={14} />
            </button>
          )}
        />
      </div>

      <ActionToolbar selectedCount={selectedIds.length} onDelete={() => { setItemToDelete(null); setIsDeleteModalOpen(true); }} />

      <EntityModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} entity={selectedItem} title="Call Details" />

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Log" message="Are you sure you want to delete this call log record?" confirmLabel="Delete" type="danger" />
    </div>
  );
}
