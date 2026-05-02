'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, UserPlus, UserCheck, Clock, Search, Filter, ArrowRight } from 'lucide-react';

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [options, setOptions] = useState({
    status: undefined as string | undefined,
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 5,
    offset: 0
  });

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('friend_requests')
        .select('*, sender:users!friend_requests_sender_id_fkey(display_name, email), receiver:users!friend_requests_receiver_id_fkey(display_name, email)', { count: 'exact' });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      const { data, count, error } = await query
        .order(options.sortBy, { ascending: options.order === 'asc' })
        .range(options.offset, options.offset + options.limit - 1);

      if (error) {
        console.error('Supabase Error:', error);
      } else {
        setRequests(data || []);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const confirmDelete = async () => {
    const ids = itemToDelete ? [itemToDelete] : selectedIds;
    const { error } = await supabase.from('friend_requests').delete().in('id', ids);
    if (!error) fetchRequests();
    setIsDeleteModalOpen(false);
  };

  const columns: Column<any>[] = [
    { 
      key: 'sender_id', 
      header: 'From', 
      render: (req) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-950 dark:text-white text-xs">{req.sender?.display_name || 'Unknown'}</span>
          <span className="text-[10px] text-zinc-400 font-mono">{req.sender_id.substring(0, 8)}</span>
        </div>
      )
    },
    { 
      key: 'arrow', 
      header: '', 
      render: () => <ArrowRight size={14} className="text-zinc-300" />
    },
    { 
      key: 'receiver_id', 
      header: 'To', 
      render: (req) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-950 dark:text-white text-xs">{req.receiver?.display_name || 'Unknown'}</span>
          <span className="text-[10px] text-zinc-400 font-mono">{req.receiver_id.substring(0, 8)}</span>
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true,
      render: (req) => (
        <span className={`badge ${req.status === 'accepted' ? 'badge-success' : req.status === 'declined' ? 'badge-error' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'} uppercase text-[9px]`}>
          {req.status}
        </span>
      )
    },
    { 
      key: 'created_at', 
      header: 'Requested', 
      sortable: true,
      render: (req) => (
        <div className="text-[10px] text-zinc-600 dark:text-zinc-500 font-medium">
          {new Date(req.created_at).toLocaleString()}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Friend Requests</h1>
          <p className="text-zinc-500 font-medium text-sm mt-0.5">Audit social connection requests and status history.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 shadow-md">
        <select 
          className="h-10 px-4 bg-zinc-100 dark:bg-zinc-950 border-2 border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-lg text-sm font-bold text-zinc-600 dark:text-zinc-400 outline-none cursor-pointer w-full"
          onChange={(e) => setOptions(prev => ({ ...prev, status: e.target.value || undefined, offset: 0 }))}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
        <DataTable 
          columns={columns}
          data={requests}
          isLoading={isLoading}
          onSort={(key, order) => setOptions(prev => ({ ...prev, sortBy: key, order }))}
          onRowSelect={setSelectedIds}
          onRowClick={setSelectedItem}
          totalCount={totalCount}
          pageSize={options.limit}
          currentPage={Math.floor(options.offset / options.limit) + 1}
          onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
          actions={(req) => (
            <button 
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" 
              onClick={(e) => { e.stopPropagation(); { setItemToDelete(req.id); setIsDeleteModalOpen(true); } }}
            >
              <Trash2 size={14} />
            </button>
          )}
        />
      </div>

      <ActionToolbar selectedCount={selectedIds.length} onDelete={() => { setItemToDelete(null); setIsDeleteModalOpen(true); }} />

      <EntityModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} entity={selectedItem} title="Request Details" />

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Request" message="Permanently delete this friend request record?" confirmLabel="Delete" type="danger" />
    </div>
  );
}
