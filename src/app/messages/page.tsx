'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChatController } from '@/controllers/chat.controller';
import { Message } from '@/models/chat.model';
import DataTable, { Column } from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, MessageSquare, User, Hash, Clock, Shield } from 'lucide-react';

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
    limit: 10,
    offset: 0
  });

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    const { data, count } = await ChatController.searchMessages(options);
    setMessages(data);
    setTotalCount(count);
    setIsLoading(false);
  }, [options]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSearch = (query: string) => {
    setOptions(prev => ({ ...prev, query, offset: 0 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'type') {
      setOptions(prev => ({ ...prev, messageType: value || undefined, offset: 0 }));
    }
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setOptions(prev => ({ ...prev, sortBy: key, order }));
  };

  const handleDeleteClick = (id: string) => {
    setMsgToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (msgToDelete) {
      // Logic for single delete would go here if implemented in controller
      // For now we'll use bulk delete with one item
      const success = await ChatController.bulkDeleteMessages([msgToDelete]);
      if (success) fetchMessages();
    } else if (selectedIds.length > 0) {
      const success = await ChatController.bulkDeleteMessages(selectedIds);
      if (success) {
        setSelectedIds([]);
        fetchMessages();
      }
    }
  };

  const columns: Column<Message>[] = [
    { 
      key: 'encrypted_content', 
      header: 'Content Preview', 
      render: (msg) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={14} style={{ opacity: 0.5, color: '#10b981' }} />
          <div style={{ 
            fontSize: '0.85rem', 
            maxWidth: '300px', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            color: 'var(--text-primary)'
          }}>
            {msg.encrypted_content.substring(0, 100)}...
          </div>
        </div>
      )
    },
    { 
      key: 'message_type', 
      header: 'Type', 
      sortable: true,
      render: (msg) => (
        <span style={{ 
          padding: '2px 8px', 
          borderRadius: '4px', 
          fontSize: '0.7rem', 
          fontWeight: 600,
          background: 'rgba(59, 130, 246, 0.1)', 
          color: '#3b82f6' 
        }}>
          {msg.message_type?.toUpperCase()}
        </span>
      )
    },
    { 
      key: 'sender_id', 
      header: 'Sender', 
      render: (msg) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <User size={14} />
          {msg.sender_id ? msg.sender_id.substring(0, 8) : 'SYSTEM'}
        </div>
      )
    },
    { 
      key: 'conversation_id', 
      header: 'Conversation', 
      render: (msg) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <Hash size={14} />
          {msg.conversation_id.substring(0, 8)}
        </div>
      )
    },
    { 
      key: 'created_at', 
      header: 'Sent At', 
      sortable: true,
      render: (msg) => (
        <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Clock size={14} style={{ opacity: 0.5 }} />
          {msg.created_at ? new Date(msg.created_at).toLocaleString() : 'N/A'}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Global Message Audit</h1>
        <p className="page-description">Review message traffic across the platform, moderate content, and manage communication logs.</p>
      </div>

      <FilterBar 
        onSearch={handleSearch}
        filters={[
          {
            key: 'type',
            label: 'Message Type',
            options: [
              { label: 'Text', value: 'text' },
              { label: 'Image', value: 'image' },
              { label: 'File', value: 'file' },
              { label: 'Call Log', value: 'CALL_ENDED' }
            ]
          }
        ]}
        onFilterChange={handleFilterChange}
        onReset={() => setOptions({ query: '', messageType: undefined, sortBy: 'created_at', order: 'desc', limit: 10, offset: 0 })}
      />

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
            className="icon-btn danger" 
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(msg.id); }}
            title="Delete Message"
          >
            <Trash2 size={18} />
          </button>
        )}
      />

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
        message="Are you sure you want to delete the selected message(s)? This will remove them from all participant devices."
        confirmLabel="Delete"
        type="danger"
      />
    </div>
  );
}
