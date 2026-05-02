'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, Users, UserCheck, Search, Filter, Mail, Heart } from 'lucide-react';

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [options, setOptions] = useState({
    query: '',
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 5,
    offset: 0
  });

  const fetchFriends = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('friends')
        .select('*, u1:users!friends_user_id_1_fkey(display_name, email), u2:users!friends_user_id_2_fkey(display_name, email)', { count: 'exact' });

      if (options.query) {
        query = query.or(`user_id_1.eq.${options.query},user_id_2.eq.${options.query}`);
      }

      const { data, count, error } = await query
        .order(options.sortBy, { ascending: options.order === 'asc' })
        .range(options.offset, options.offset + options.limit - 1);

      if (error) {
        console.error('Supabase Error:', error);
      } else {
        setFriends(data || []);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const confirmDelete = async () => {
    const ids = itemToDelete ? [itemToDelete] : selectedIds;
    const { error } = await supabase.from('friends').delete().in('id', ids);
    if (!error) fetchFriends();
    setIsDeleteModalOpen(false);
  };

  const columns: Column<any>[] = [
    { 
      key: 'user_id_1', 
      header: 'User 1', 
      render: (f) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-950 dark:text-white text-xs">{f.u1?.display_name || 'Unknown'}</span>
          <span className="text-[10px] text-zinc-400 font-mono">{f.user_id_1.substring(0, 8)}</span>
        </div>
      )
    },
    { 
      key: 'heart', 
      header: '', 
      render: () => <Heart size={14} className="text-rose-400 fill-rose-400/10" />
    },
    { 
      key: 'user_id_2', 
      header: 'User 2', 
      render: (f) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-950 dark:text-white text-xs">{f.u2?.display_name || 'Unknown'}</span>
          <span className="text-[10px] text-zinc-400 font-mono">{f.user_id_2.substring(0, 8)}</span>
        </div>
      )
    },
    { 
      key: 'created_at', 
      header: 'Established', 
      sortable: true,
      render: (f) => (
        <div className="text-[10px] text-zinc-600 dark:text-zinc-500 font-medium">
          {new Date(f.created_at).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Friends List</h1>
          <p className="text-zinc-500 font-medium text-sm mt-0.5">Manage official social connections and relationships.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-3 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" size={15} />
          <input 
            type="text" 
            placeholder="Search by User UUID..." 
            className="w-full h-10 pl-10 pr-4 bg-zinc-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-950 border focus:border-zinc-200 dark:focus:border-zinc-800 rounded-lg text-sm outline-none transition-all"
            onChange={(e) => setOptions(prev => ({ ...prev, query: e.target.value, offset: 0 }))}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-border shadow-sm overflow-hidden">
        <DataTable 
          columns={columns}
          data={friends}
          isLoading={isLoading}
          onSort={(key, order) => setOptions(prev => ({ ...prev, sortBy: key, order }))}
          onRowSelect={setSelectedIds}
          onRowClick={setSelectedItem}
          totalCount={totalCount}
          pageSize={options.limit}
          currentPage={Math.floor(options.offset / options.limit) + 1}
          onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
          actions={(f) => (
            <button 
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" 
              onClick={(e) => { e.stopPropagation(); { setItemToDelete(f.id); setIsDeleteModalOpen(true); } }}
            >
              <Trash2 size={14} />
            </button>
          )}
        />
      </div>

      <ActionToolbar selectedCount={selectedIds.length} onDelete={() => { setItemToDelete(null); setIsDeleteModalOpen(true); }} />

      <EntityModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} entity={selectedItem} title="Friendship Details" />

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Unfriend" message="Permanently break this friendship link?" confirmLabel="Unfriend" type="danger" />
    </div>
  );
}
