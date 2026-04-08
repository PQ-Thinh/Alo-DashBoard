'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChatController } from '@/controllers/chat.controller';
import { ChatListView } from '@/models/chat.model';
import DataTable, { Column } from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, MessageSquare, Users, Clock, Hash } from 'lucide-react';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ChatListView[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [convToDelete, setConvToDelete] = useState<string | null>(null);
  const [selectedConv, setSelectedConv] = useState<ChatListView | null>(null);

  const [options, setOptions] = useState({
    query: '',
    type: undefined as 'group' | 'direct' | undefined,
    sortBy: 'last_message_time',
    order: 'desc' as 'asc' | 'desc',
    limit: 10,
    offset: 0
  });

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    const { data, count } = await ChatController.searchConversations(options);
    setConversations(data);
    setTotalCount(count);
    setIsLoading(false);
  }, [options]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSearch = (query: string) => {
    setOptions(prev => ({ ...prev, query, offset: 0 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'type') {
      setOptions(prev => ({ ...prev, type: value as any || undefined, offset: 0 }));
    }
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setOptions(prev => ({ ...prev, sortBy: key, order }));
  };

  const handleRowSelect = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleRowClick = (conv: ChatListView) => {
    setSelectedConv(conv);
  };

  const handleDeleteClick = (id: string) => {
    setConvToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (convToDelete) {
      const success = await ChatController.deleteConversation(convToDelete);
      if (success) fetchConversations();
    } else if (selectedIds.length > 0) {
      const success = await ChatController.bulkDeleteConversations(selectedIds);
      if (success) {
        setSelectedIds([]);
        fetchConversations();
      }
    }
  };

  const columns: Column<ChatListView>[] = [
    { 
      key: 'chat_name', 
      header: 'Conversation', 
      sortable: true,
      render: (conv) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: conv.is_group ? '8px' : '50%', 
            background: conv.is_group ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: conv.is_group ? '#8b5cf6' : '#3b82f6'
          }}>
            {conv.chat_avatar ? <img src={conv.chat_avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: conv.is_group ? '8px' : '50%', objectFit: 'cover' }} /> : (conv.is_group ? <Users size={16} /> : <MessageSquare size={16} />)}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{conv.chat_name || 'Unnamed Conversation'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {conv.is_group ? <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '0 4px', borderRadius: '4px' }}>Group</span> : <span>Direct</span>}
            </div>
          </div>
        </div>
      )
    },
    { 
      key: 'unread_count', 
      header: 'Unread', 
      sortable: true,
      render: (conv) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ 
            background: conv.unread_count > 0 ? '#ef4444' : 'rgba(255,255,255,0.05)', 
            color: conv.unread_count > 0 ? 'white' : '#64748b',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {conv.unread_count}
          </span>
        </div>
      )
    },
    { 
      key: 'last_message_preview', 
      header: 'Last Message', 
      render: (conv) => (
        <div style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.85rem',
          maxWidth: '250px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {conv.last_message_preview || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No messages yet</span>}
        </div>
      )
    },
    { 
      key: 'last_message_time', 
      header: 'Activity', 
      sortable: true,
      render: (conv) => (
        <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} style={{ opacity: 0.5 }} />
          {conv.last_message_time ? new Date(conv.last_message_time).toLocaleString() : 'N/A'}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Conversations</h1>
        <p className="page-description">Oversee all chats, filter by group or direct type, and manage communication channels.</p>
      </div>

      <FilterBar 
        onSearch={handleSearch}
        filters={[
          {
            key: 'type',
            label: 'Type',
            options: [
              { label: 'Group Chats', value: 'group' },
              { label: 'Direct Messages', value: 'direct' }
            ]
          }
        ]}
        onFilterChange={handleFilterChange}
        onReset={() => setOptions({ query: '', type: undefined, sortBy: 'last_message_time', order: 'desc', limit: 10, offset: 0 })}
      />

      <DataTable 
        columns={columns as any}
        data={conversations}
        isLoading={isLoading}
        onSort={handleSort}
        onRowSelect={handleRowSelect}
        onRowClick={handleRowClick}
        totalCount={totalCount}
        pageSize={options.limit}
        currentPage={Math.floor(options.offset / options.limit) + 1}
        onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
        keyField="conversation_id"
        actions={(conv) => (
          <button 
            className="icon-btn danger" 
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(conv.conversation_id); }}
            title="Delete Conversation"
          >
            <Trash2 size={18} />
          </button>
        )}
      />

      <ActionToolbar 
        selectedCount={selectedIds.length}
        onDelete={() => {
          setConvToDelete(null);
          setIsDeleteModalOpen(true);
        }}
      />

      <EntityModal 
        isOpen={!!selectedConv}
        onClose={() => setSelectedConv(null)}
        entity={selectedConv}
        title="Conversation Details"
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={convToDelete ? 'Delete Conversation' : 'Bulk Delete'}
        message="Are you sure you want to delete the selected conversation(s)? This will remove all message history for all participants."
        confirmLabel="Delete"
        type="danger"
      />
    </div>
  );
}
