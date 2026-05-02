'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, Smile, Heart, User, Clock, Search, Hash } from 'lucide-react';

export default function MessageReactionsPage() {
  const [reactions, setReactions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [options, setOptions] = useState({
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 5,
    offset: 0
  });

  const fetchReactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, count, error } = await supabase
        .from('message_reactions')
        .select('*, users(display_name)', { count: 'exact' })
        .order(options.sortBy, { ascending: options.order === 'asc' })
        .range(options.offset, options.offset + options.limit - 1)
        .limit(options.limit);

      if (error) {
        console.error('Supabase Error:', error);
      } else {
        // message_reactions use composite key (message_id, user_id, reaction_icon), so we create a virtual id
        const mappedData = (data || []).map(r => ({
          ...r,
          id: `${r.message_id}_${r.user_id}_${r.reaction_icon}`
        }));
        setReactions(mappedData);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const confirmDelete = async () => {
    if (itemToDelete) {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .match({ 
          message_id: itemToDelete.message_id, 
          user_id: itemToDelete.user_id, 
          reaction_icon: itemToDelete.reaction_icon 
        });
      if (!error) fetchReactions();
    }
    setIsDeleteModalOpen(false);
  };

  const columns: Column<any>[] = [
    { 
      key: 'reaction_icon', 
      header: 'Reaction', 
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-xl shadow-sm">
            {r.reaction_icon}
          </div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Type: {r.reaction_icon}</span>
        </div>
      )
    },
    { 
      key: 'user_id', 
      header: 'From', 
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
            <User size={10} className="text-zinc-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-950 dark:text-white text-[11px]">{r.users?.display_name || 'Unknown'}</span>
            <span className="text-[9px] text-zinc-400 font-mono">{r.user_id.substring(0, 8)}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'message_id', 
      header: 'Message ID', 
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
          <Hash size={12} className="opacity-40" />
          {r.message_id.substring(0, 8)}
        </div>
      )
    },
    { 
      key: 'count', 
      header: 'Count', 
      render: (r) => <span className="font-black text-sm">{r.count}</span>
    },
    { 
      key: 'created_at', 
      header: 'Time', 
      sortable: true,
      render: (r) => (
        <div className="text-[10px] text-zinc-600 dark:text-zinc-500 font-medium">
          {new Date(r.created_at).toLocaleString()}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Message Reactions</h1>
          <p className="text-zinc-500 font-medium text-sm mt-0.5">Audit global user interactions and emoji engagement logs.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-border shadow-sm overflow-hidden">
        <DataTable 
          columns={columns}
          data={reactions}
          isLoading={isLoading}
          onSort={(key, order) => setOptions(prev => ({ ...prev, sortBy: key, order }))}
          onRowClick={setSelectedItem}
          totalCount={totalCount}
          pageSize={options.limit}
          currentPage={Math.floor(options.offset / options.limit) + 1}
          onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
          actions={(r) => (
            <button 
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" 
              onClick={(e) => { e.stopPropagation(); { setItemToDelete(r); setIsDeleteModalOpen(true); } }}
            >
              <Trash2 size={14} />
            </button>
          )}
        />
      </div>

      <EntityModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} entity={selectedItem} title="Reaction Details" />

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Remove Reaction" message="Permanently remove this user reaction from the message?" confirmLabel="Remove" type="danger" />
    </div>
  );
}
