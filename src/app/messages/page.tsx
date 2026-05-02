'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChatController } from '@/controllers/chat.controller';
import { Message } from '@/models/chat.model';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, MessageSquare, User, Hash, Clock, Shield, Search, Filter } from 'lucide-react';

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [msgToDelete, setMsgToDelete] = useState<string | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  const [options, setOptions] = useState({
    query: '',
    messageType: undefined as string | undefined,
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 5,
    offset: 0
  });

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, count } = await ChatController.searchMessages(options);
      setMessages(data);
      setTotalCount(count);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSearch = (query: string) => {
    setOptions(prev => ({ ...prev, query, offset: 0 }));
  };

  const handleFilterChange = (value: string) => {
    setOptions(prev => ({ ...prev, messageType: value || undefined, offset: 0 }));
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setOptions(prev => ({ ...prev, sortBy: key, order }));
  };

  const confirmDelete = async () => {
    if (msgToDelete) {
      const success = await ChatController.bulkDeleteMessages([msgToDelete]);
      if (success) fetchMessages();
    } else if (selectedIds.length > 0) {
      const success = await ChatController.bulkDeleteMessages(selectedIds);
      if (success) {
        setSelectedIds([]);
        fetchMessages();
      }
    }
    setIsDeleteModalOpen(false);
  };

  const columns: Column<Message>[] = [
    { 
      key: 'encrypted_content', 
      header: 'Content', 
      render: (msg) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
            <Shield size={14} className="text-emerald-600" />
          </div>
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200 max-w-[250px] truncate">
            {msg.encrypted_content}
          </div>
        </div>
      )
    },
    { 
      key: 'message_type', 
      header: 'Type', 
      sortable: true,
      render: (msg) => (
        <span className="badge badge-blue uppercase">
          {msg.message_type || 'text'}
        </span>
      )
    },
    { 
      key: 'sender_id', 
      header: 'Sender', 
      render: (msg) => (
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <User size={12} className="opacity-40" />
          {msg.sender_id ? msg.sender_id.substring(0, 8) : 'SYSTEM'}
        </div>
      )
    },
    { 
      key: 'conversation_id', 
      header: 'Conv ID', 
      render: (msg) => (
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Hash size={12} className="opacity-40" />
          {msg.conversation_id.substring(0, 8)}
        </div>
      )
    },
    { 
      key: 'created_at', 
      header: 'Sent Time', 
      sortable: true,
      render: (msg) => (
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-500 font-medium">
          <Clock size={12} className="opacity-40" />
          {msg.created_at ? new Date(msg.created_at).toLocaleString() : 'N/A'}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Message Audit</h1>
          <p className="text-zinc-500 font-medium text-sm mt-0.5">Audit global communication logs and manage platform messages.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-zinc-950 p-3 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" size={15} />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full h-10 pl-10 pr-4 bg-zinc-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-950 border focus:border-zinc-200 dark:focus:border-zinc-800 rounded-lg text-sm outline-none transition-all"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="h-10 px-4 bg-zinc-100 dark:bg-zinc-900 border-transparent rounded-lg text-sm font-bold text-zinc-600 outline-none cursor-pointer"
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="file">File</option>
            <option value="CALL_ENDED">Call Log</option>
          </select>
          <button className="btn-secondary flex items-center gap-2 h-10 text-sm font-bold whitespace-nowrap">
            <Filter size={15} />
            Filters
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-border shadow-sm overflow-hidden">
        <DataTable 
          columns={columns}
          data={messages}
          isLoading={isLoading}
          onSort={handleSort}
          onRowSelect={setSelectedIds}
          onRowClick={setSelectedMsg}
          totalCount={totalCount}
          pageSize={options.limit}
          currentPage={Math.floor(options.offset / options.limit) + 1}
          onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
          actions={(msg) => (
            <button 
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all" 
              onClick={(e) => { e.stopPropagation(); { setMsgToDelete(msg.id); setIsDeleteModalOpen(true); } }}
            >
              <Trash2 size={14} />
            </button>
          )}
        />
      </div>

      <ActionToolbar 
        selectedCount={selectedIds.length}
        onDelete={() => { setMsgToDelete(null); setIsDeleteModalOpen(true); }}
      />

      <EntityModal 
        isOpen={!!selectedMsg}
        onClose={() => setSelectedMsg(null)}
        entity={selectedMsg}
        title="Message Details"
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={msgToDelete ? 'Delete Message' : 'Bulk Delete'}
        message="This action will permanently delete the message(s) from the server. This cannot be undone."
        confirmLabel="Delete"
        type="danger"
      />
    </div>
  );
}
