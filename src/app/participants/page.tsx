'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChatController } from '@/controllers/chat.controller';
import { Participant } from '@/models/chat.model';
import DataTable, { Column } from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, UserPlus, User, Shield, Hash, Calendar } from 'lucide-react';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [selectedItem, setSelectedItem] = useState<Participant | null>(null);

  const [options, setOptions] = useState({
    conversationId: undefined as string | undefined,
    role: undefined as string | undefined,
    sortBy: 'joined_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 10,
    offset: 0
  });

  const fetchParticipants = useCallback(async () => {
    setIsLoading(true);
    const { data, count } = await ChatController.searchParticipants(options);
    setParticipants(data);
    setTotalCount(count);
    setIsLoading(false);
  }, [options]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'role') {
      setOptions(prev => ({ ...prev, role: value || undefined, offset: 0 }));
    }
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setOptions(prev => ({ ...prev, sortBy: key, order }));
  };

  const handleDeleteClick = (p: Participant) => {
    setItemToDelete(p);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    // Logic for removing a participant from a room
    fetchParticipants();
  };

  const columns: Column<Participant>[] = [
    { 
      key: 'user_id', 
      header: 'User', 
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--text-secondary)' }}><User size={18} /></div>
          <div>
            <div style={{ fontWeight: 600 }}>ID: {p.user_id.substring(0, 8)}...</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status: {p.status || 'Active'}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'conversation_id', 
      header: 'Room ID', 
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Hash size={14} />
          {p.conversation_id.substring(0, 8)}...
        </div>
      )
    },
    { 
      key: 'role', 
      header: 'Role', 
      sortable: true,
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {p.role === 'admin' && <Shield size={14} style={{ color: '#f59e0b' }} />}
          <span style={{ 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '0.7rem', 
            fontWeight: 600,
            background: p.role === 'admin' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
            color: p.role === 'admin' ? '#f59e0b' : 'var(--text-secondary)' 
          }}>
            {p.role?.toUpperCase() || 'MEMBER'}
          </span>
        </div>
      )
    },
    { 
      key: 'unread_count', 
      header: 'Unread', 
      sortable: true,
      render: (p) => (
        <span style={{ 
          color: p.unread_count > 0 ? '#ef4444' : 'var(--text-secondary)',
          fontWeight: p.unread_count > 0 ? 700 : 400
        }}>
          {p.unread_count}
        </span>
      )
    },
    { 
      key: 'joined_at', 
      header: 'Joined At', 
      sortable: true,
      render: (p) => (
        <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Calendar size={14} style={{ opacity: 0.5 }} />
          {p.joined_at ? new Date(p.joined_at).toLocaleDateString() : 'N/A'}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Room Membership</h1>
        <p className="page-description">Manage participants across all conversation rooms. Moderate administrative roles and audit room membership history.</p>
      </div>

      <FilterBar 
        onSearch={() => {}} 
        filters={[
          {
            key: 'role',
            label: 'Role',
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'Member', value: 'member' }
            ]
          }
        ]}
        onFilterChange={handleFilterChange}
        onReset={() => setOptions({ conversationId: undefined, role: undefined, sortBy: 'joined_at', order: 'desc', limit: 10, offset: 0 })}
      />

      <DataTable 
        columns={columns}
        data={participants}
        isLoading={isLoading}
        onSort={handleSort}
        onRowSelect={setSelectedIds}
        onRowClick={setSelectedItem}
        totalCount={totalCount}
        pageSize={options.limit}
        currentPage={Math.floor(options.offset / options.limit) + 1}
        onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
        keyField="conversation_id" // Note: Normally would be composite key, but for display uniqueness:
        actions={(p) => (
          <button 
            className="icon-btn danger" 
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(p); }}
            title="Remove Participant"
          >
            <Trash2 size={18} />
          </button>
        )}
      />

      <ActionToolbar 
        selectedCount={selectedIds.length}
        onDelete={() => { setItemToDelete(null); setIsDeleteModalOpen(true); }}
      />

      <EntityModal 
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        entity={selectedItem}
        title="Participant Details"
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove Participant"
        message="Are you sure you want to remove this participant from the room? This will revoke their access to message history."
        confirmLabel="Remove"
        type="danger"
      />
    </div>
  );
}
