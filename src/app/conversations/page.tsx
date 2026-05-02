'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, MessageSquare, Users, Calendar, Search, Filter, Hash, Image as ImageIcon } from 'lucide-react';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [options, setOptions] = useState({
    query: '',
    isGroup: undefined as boolean | undefined,
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 5,
    offset: 0
  });

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('conversations')
        .select('*', { count: 'exact' });

      if (options.query) {
        query = query.ilike('name', `%${options.query}%`);
      }

      if (options.isGroup !== undefined) {
        query = query.eq('is_group', options.isGroup);
      }

      const { data, count, error } = await query
        .order(options.sortBy, { ascending: options.order === 'asc' })
        .range(options.offset, options.offset + options.limit - 1);

      if (error) {
        console.error('Supabase Error:', error);
      } else {
        setConversations(data || []);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSearch = (query: string) => {
    setOptions(prev => ({ ...prev, query, offset: 0 }));
  };

  const handleFilterChange = (val: string) => {
    const isGroup = val === '' ? undefined : val === 'true';
    setOptions(prev => ({ ...prev, isGroup, offset: 0 }));
  };

  const confirmDelete = async () => {
    const idsToDelete = itemToDelete ? [itemToDelete] : selectedIds;
    const { error } = await supabase.from('conversations').delete().in('id', idsToDelete);
    if (!error) fetchConversations();
    setIsDeleteModalOpen(false);
  };

  const columns: Column<any>[] = [
    { 
      key: 'name', 
      header: 'Conversation', 
      render: (conv) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
            {conv.avatar_url ? (
              <img src={conv.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              conv.is_group ? <Users size={18} className="text-zinc-500" /> : <MessageSquare size={18} className="text-zinc-500" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-950 dark:text-white text-sm">{conv.name || (conv.is_group ? 'Unnamed Group' : 'Direct Chat')}</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{conv.is_group ? 'Group' : 'Direct'}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'last_message_preview', 
      header: 'Last Message', 
      render: (conv) => (
        <div className="max-w-[200px] truncate text-xs text-zinc-700 dark:text-zinc-400 font-medium italic">
          {conv.last_message_preview || 'No messages yet'}
        </div>
      )
    },
    { 
      key: 'last_message_time', 
      header: 'Activity', 
      sortable: true,
      render: (conv) => (
        <div className="text-xs text-zinc-600 dark:text-zinc-500 font-medium">
          {conv.last_message_time ? new Date(conv.last_message_time).toLocaleString() : 'N/A'}
        </div>
      )
    },
    { 
      key: 'created_at', 
      header: 'Created', 
      sortable: true,
      render: (conv) => (
        <div className="text-xs text-zinc-600 dark:text-zinc-500 font-medium">
          {new Date(conv.created_at).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Conversations</h1>
          <p className="text-zinc-500 font-medium text-sm mt-0.5">Manage group chats and private communication channels.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-zinc-950 p-3 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" size={15} />
          <input 
            type="text" 
            placeholder="Search by name..." 
            className="w-full h-10 pl-10 pr-4 bg-zinc-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-950 border focus:border-zinc-200 dark:focus:border-zinc-800 rounded-lg text-sm outline-none transition-all"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <select 
          className="h-10 px-4 bg-zinc-100 dark:bg-zinc-900 border-transparent rounded-lg text-sm font-bold text-zinc-600 outline-none cursor-pointer w-full md:w-auto"
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="true">Groups</option>
          <option value="false">Direct</option>
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-border shadow-sm overflow-hidden">
        <DataTable 
          columns={columns}
          data={conversations}
          isLoading={isLoading}
          onSort={(key, order) => setOptions(prev => ({ ...prev, sortBy: key, order }))}
          onRowSelect={setSelectedIds}
          onRowClick={setSelectedItem}
          totalCount={totalCount}
          pageSize={options.limit}
          currentPage={Math.floor(options.offset / options.limit) + 1}
          onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
          actions={(conv) => (
            <button 
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" 
              onClick={(e) => { e.stopPropagation(); { setItemToDelete(conv.id); setIsDeleteModalOpen(true); } }}
            >
              <Trash2 size={14} />
            </button>
          )}
        />
      </div>

      <ActionToolbar 
        selectedCount={selectedIds.length}
        onDelete={() => { setItemToDelete(null); setIsDeleteModalOpen(true); }}
      />

      <EntityModal 
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        entity={selectedItem}
        title="Conversation Details"
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        message="Are you sure? This will remove the conversation and all its messages for all participants."
        confirmLabel="Delete"
        type="danger"
      />
    </div>
  );
}
