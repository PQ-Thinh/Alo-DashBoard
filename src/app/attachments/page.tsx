'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, FileText, ImageIcon, Music, Video, Download, Search, Filter, Hash } from 'lucide-react';

export default function AttachmentsPage() {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [options, setOptions] = useState({
    query: '',
    fileType: undefined as string | undefined,
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 5,
    offset: 0
  });

  const fetchAttachments = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('attachments')
        .select('*, messages(conversation_id)', { count: 'exact' });

      if (options.query) {
        query = query.ilike('file_name', `%${options.query}%`);
      }

      if (options.fileType) {
        query = query.ilike('file_type', `%${options.fileType}%`);
      }

      const { data, count, error } = await query
        .order(options.sortBy, { ascending: options.order === 'asc' })
        .range(options.offset, options.offset + options.limit - 1)
        .limit(options.limit);

      if (error) {
        console.error('Supabase Error:', error);
      } else {
        setAttachments(data || []);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const confirmDelete = async () => {
    const ids = itemToDelete ? [itemToDelete] : selectedIds;
    const { error } = await supabase.from('attachments').delete().in('id', ids);
    if (!error) fetchAttachments();
    setIsDeleteModalOpen(false);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon size={16} className="text-blue-500" />;
    if (type.includes('video')) return <Video size={16} className="text-rose-500" />;
    if (type.includes('audio')) return <Music size={16} className="text-amber-500" />;
    return <FileText size={16} className="text-zinc-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const columns: Column<any>[] = [
    { 
      key: 'file_name', 
      header: 'File Name', 
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            {getFileIcon(a.file_type || '')}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-950 dark:text-white text-xs truncate max-w-[180px]">{a.file_name}</span>
            <span className="text-[10px] text-zinc-400 font-medium uppercase">{a.file_type}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'file_size', 
      header: 'Size', 
      sortable: true,
      render: (a) => (
        <div className="text-xs font-bold text-zinc-500">
          {formatSize(a.file_size || 0)}
        </div>
      )
    },
    { 
      key: 'message_id', 
      header: 'Source', 
      render: (a) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
            <Hash size={10} className="opacity-40" />
            MSG: {a.message_id.substring(0, 8)}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
            <Hash size={10} className="opacity-40" />
            CONV: {a.messages?.conversation_id.substring(0, 8)}
          </div>
        </div>
      )
    },
    { 
      key: 'created_at', 
      header: 'Uploaded', 
      sortable: true,
      render: (a) => (
        <div className="text-[10px] text-zinc-600 dark:text-zinc-500 font-medium">
          {new Date(a.created_at).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Attachments</h1>
          <p className="text-zinc-500 font-medium text-sm mt-0.5">Manage and monitor all files uploaded to the platform.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-zinc-950 p-3 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" size={15} />
          <input 
            type="text" 
            placeholder="Search files..." 
            className="w-full h-10 pl-10 pr-4 bg-zinc-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-950 border focus:border-zinc-200 dark:focus:border-zinc-800 rounded-lg text-sm outline-none transition-all"
            onChange={(e) => setOptions(prev => ({ ...prev, query: e.target.value, offset: 0 }))}
          />
        </div>
        <select 
          className="h-10 px-4 bg-zinc-100 dark:bg-zinc-900 border-transparent rounded-lg text-sm font-bold text-zinc-600 outline-none cursor-pointer w-full md:w-auto"
          onChange={(e) => setOptions(prev => ({ ...prev, fileType: e.target.value || undefined, offset: 0 }))}
        >
          <option value="">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="application">Documents</option>
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-border shadow-sm overflow-hidden">
        <DataTable 
          columns={columns}
          data={attachments}
          isLoading={isLoading}
          onSort={(key, order) => setOptions(prev => ({ ...prev, sortBy: key, order }))}
          onRowSelect={setSelectedIds}
          onRowClick={setSelectedItem}
          totalCount={totalCount}
          pageSize={options.limit}
          currentPage={Math.floor(options.offset / options.limit) + 1}
          onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
          actions={(a) => (
            <div className="flex items-center gap-1">
              <a 
                href={a.file_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={14} />
              </a>
              <button 
                className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" 
                onClick={(e) => { e.stopPropagation(); { setItemToDelete(a.id); setIsDeleteModalOpen(true); } }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        />
      </div>

      <ActionToolbar selectedCount={selectedIds.length} onDelete={() => { setItemToDelete(null); setIsDeleteModalOpen(true); }} />

      <EntityModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} entity={selectedItem} title="Attachment Details" />

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete File" message="Permanently delete this attachment from storage and messages?" confirmLabel="Delete" type="danger" />
    </div>
  );
}
