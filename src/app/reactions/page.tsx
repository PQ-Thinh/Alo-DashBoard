'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChatController } from '@/controllers/chat.controller';
import DataTable, { Column } from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, Smile, User, Hash, Clock, Heart } from 'lucide-react';

export default function ReactionsPage() {
  const [reactions, setReactions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [options, setOptions] = useState({
    icon: undefined as string | undefined,
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 10,
    offset: 0
  });

  const fetchReactions = useCallback(async () => {
    setIsLoading(true);
    const { data, count } = await ChatController.searchReactions(options);
    setReactions(data);
    setTotalCount(count);
    setIsLoading(false);
  }, [options]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'icon') {
      setOptions(prev => ({ ...prev, icon: value || undefined, offset: 0 }));
    }
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setOptions(prev => ({ ...prev, sortBy: key, order }));
  };

  const handleDeleteClick = (r: any) => {
    setItemToDelete(r);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    // Logic for removing a reaction
    fetchReactions();
  };

  const columns: Column<any>[] = [
    { 
      key: 'reaction_icon', 
      header: 'Icon', 
      sortable: true,
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            fontSize: '1.5rem', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px'
          }}>
            {r.reaction_icon}
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>x{r.count}</span>
        </div>
      )
    },
    { 
      key: 'user_id', 
      header: 'User', 
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <User size={14} />
          {r.user_id.substring(0, 8)}...
        </div>
      )
    },
    { 
      key: 'message_id', 
      header: 'On Message', 
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Hash size={14} />
          {r.message_id.substring(0, 8)}...
        </div>
      )
    },
    { 
      key: 'created_at', 
      header: 'Sent At', 
      sortable: true,
      render: (r) => (
        <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Clock size={14} style={{ opacity: 0.5 }} />
          {r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A'}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Message Reactions</h1>
        <p className="page-description">Moderate user engagement through message reactions. Audit reaction logs and manage interaction icons.</p>
      </div>

      <FilterBar 
        onSearch={() => {}} 
        filters={[
          {
            key: 'icon',
            label: 'Icon',
            options: [
              { label: 'Thích (👍)', value: '👍' },
              { label: 'Tim (❤️)', value: '❤️' },
              { label: 'Cười (😂)', value: '😂' },
              { label: 'Wow (😮)', value: '😮' }
            ]
          }
        ]}
        onFilterChange={handleFilterChange}
        onReset={() => setOptions({ icon: undefined, sortBy: 'created_at', order: 'desc', limit: 10, offset: 0 })}
      />

      <DataTable 
        columns={columns}
        data={reactions}
        isLoading={isLoading}
        onSort={handleSort}
        onRowSelect={setSelectedIds}
        onRowClick={setSelectedItem}
        totalCount={totalCount}
        pageSize={options.limit}
        currentPage={Math.floor(options.offset / options.limit) + 1}
        onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
        actions={(r) => (
          <button 
            className="icon-btn danger" 
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(r); }}
            title="Revoke Reaction"
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
        title="Reaction Details"
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Revoke Reaction"
        message="Are you sure you want to revoke this reaction? This will remove the emoji from the message."
        confirmLabel="Revoke"
        type="danger"
      />
    </div>
  );
}
