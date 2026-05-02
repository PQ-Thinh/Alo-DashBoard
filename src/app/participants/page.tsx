'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, User, Hash, Shield, Search, Filter, Mail, Clock } from 'lucide-react';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [options, setOptions] = useState({
    query: '',
    role: undefined as string | undefined,
    sortBy: 'joined_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 5,
    offset: 0
  });

  const fetchParticipants = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('participants')
        .select('*, users(display_name, email), conversations(name, is_group)', { count: 'exact' });

      if (options.query) {
        query = query.or(`user_id.eq.${options.query},conversation_id.eq.${options.query}`);
      }

      if (options.role) {
        query = query.eq('role', options.role);
      }

      const { data, count, error } = await query
        .order(options.sortBy, { ascending: options.order === 'asc' })
        .range(options.offset, options.offset + options.limit - 1)
        .limit(options.limit);

      if (error) {
        console.error('Supabase Error:', error);
      } else {
        // Participants use composite key (conversation_id, user_id), so we create a virtual id
        const mappedData = (data || []).map(p => ({
          ...p,
          id: `${p.conversation_id}_${p.user_id}`
        }));
        setParticipants(mappedData);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const confirmDelete = async () => {
    if (itemToDelete) {
      const { error } = await supabase
        .from('participants')
        .delete()
        .match({ conversation_id: itemToDelete.conversation_id, user_id: itemToDelete.user_id });
      if (!error) fetchParticipants();
    }
    setIsDeleteModalOpen(false);
  };

  const columns: Column<any>[] = [
    { 
      key: 'user_id', 
      header: 'Member', 
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
            <User size={14} className="text-zinc-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-950 dark:text-white text-xs">{p.users?.display_name || 'Unknown'}</span>
            <span className="text-[10px] text-zinc-400 font-mono">{p.user_id.substring(0, 8)}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'conversation_id', 
      header: 'Conversation', 
      render: (p) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-700 dark:text-zinc-300 text-xs truncate max-w-[120px]">
            {p.conversations?.name || (p.conversations?.is_group ? 'Unnamed Group' : 'Direct Chat')}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">{p.conversation_id.substring(0, 8)}</span>
        </div>
      )
    },
    { 
      key: 'role', 
      header: 'Role', 
      sortable: true,
      render: (p) => (
        <span className={`badge ${p.role === 'admin' ? 'badge-blue' : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'} uppercase text-[9px]`}>
          {p.role}
        </span>
      )
    },
    { 
      key: 'unread_count', 
      header: 'Unread', 
      sortable: true,
      render: (p) => (
        <div className="text-xs font-black text-zinc-950 dark:text-white">
          {p.unread_count}
        </div>
      )
    },
    { 
      key: 'joined_at', 
      header: 'Joined At', 
      sortable: true,
      render: (p) => (
        <div className="text-[10px] text-zinc-400 font-medium">
          {new Date(p.joined_at).toLocaleString()}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Participants</h1>
          <p className="text-zinc-500 font-medium text-sm mt-0.5">Audit membership and access levels within chat rooms.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-zinc-950 p-3 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" size={15} />
          <input 
            type="text" 
            placeholder="Search by ID..." 
            className="w-full h-10 pl-10 pr-4 bg-zinc-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-950 border focus:border-zinc-200 dark:focus:border-zinc-800 rounded-lg text-sm outline-none transition-all"
            onChange={(e) => setOptions(prev => ({ ...prev, query: e.target.value, offset: 0 }))}
          />
        </div>
        <select 
          className="h-10 px-4 bg-zinc-100 dark:bg-zinc-900 border-transparent rounded-lg text-sm font-bold text-zinc-600 outline-none cursor-pointer w-full md:w-auto"
          onChange={(e) => setOptions(prev => ({ ...prev, role: e.target.value || undefined, offset: 0 }))}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-border shadow-sm overflow-hidden">
        <DataTable 
          columns={columns}
          data={participants}
          isLoading={isLoading}
          onSort={(key, order) => setOptions(prev => ({ ...prev, sortBy: key, order }))}
          onRowClick={setSelectedItem}
          totalCount={totalCount}
          pageSize={options.limit}
          currentPage={Math.floor(options.offset / options.limit) + 1}
          onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
          actions={(p) => (
            <button 
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" 
              onClick={(e) => { e.stopPropagation(); { setItemToDelete(p); setIsDeleteModalOpen(true); } }}
            >
              <Trash2 size={14} />
            </button>
          )}
        />
      </div>

      <EntityModal 
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        entity={selectedItem}
        title="Membership Details"
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove Participant"
        message="Are you sure you want to remove this user from the conversation?"
        confirmLabel="Remove"
        type="danger"
      />
    </div>
  );
}
