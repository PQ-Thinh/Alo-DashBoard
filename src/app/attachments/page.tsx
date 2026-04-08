'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChatController } from '@/controllers/chat.controller';
import { Attachment } from '@/models/chat.model';
import DataTable, { Column } from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, FileText, Image, File, Download, ExternalLink } from 'lucide-react';

export default function AttachmentsPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Attachment | null>(null);

  const [options, setOptions] = useState({
    query: '',
    fileType: undefined as string | undefined,
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 10,
    offset: 0
  });

  const fetchAttachments = useCallback(async () => {
    setIsLoading(true);
    const { data, count } = await ChatController.searchAttachments(options);
    setAttachments(data);
    setTotalCount(count);
    setIsLoading(false);
  }, [options]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleSearch = (query: string) => {
    setOptions(prev => ({ ...prev, query, offset: 0 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'type') {
      setOptions(prev => ({ ...prev, fileType: value || undefined, offset: 0 }));
    }
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setOptions(prev => ({ ...prev, sortBy: key, order }));
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    // Controller logic for bulk delete attachments would go here
    // For now we'll just mock the success and refresh
    fetchAttachments();
  };

  const columns: Column<Attachment>[] = [
    { 
      key: 'file_name', 
      header: 'File Name', 
      sortable: true,
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            {item.file_type?.startsWith('image') ? <Image size={18} /> : <FileText size={18} />}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{item.file_name || 'Untitled Attachment'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>UUID: {item.id.substring(0, 8)}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'file_type', 
      header: 'Type', 
      sortable: true,
      render: (item) => (
        <span style={{ 
          padding: '2px 8px', 
          borderRadius: '4px', 
          fontSize: '0.7rem', 
          fontWeight: 600,
          background: 'rgba(255, 255, 255, 0.05)', 
          color: 'var(--text-secondary)' 
        }}>
          {item.file_type?.toUpperCase() || 'UNKNOWN'}
        </span>
      )
    },
    { 
      key: 'file_size', 
      header: 'Size', 
      sortable: true,
      render: (item) => (
        <div style={{ fontSize: '0.85rem' }}>
          {item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
        </div>
      )
    },
    { 
      key: 'file_url', 
      header: 'Link', 
      render: (item) => (
        <a 
          href={item.file_url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={14} /> View
        </a>
      )
    },
    { 
      key: 'created_at', 
      header: 'Uploaded', 
      sortable: true,
      render: (item) => (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Attachments Management</h1>
        <p className="page-description">Oversee all shared files, images, and media across conversations. Monitor storage usage and audit sharing history.</p>
      </div>

      <FilterBar 
        onSearch={handleSearch}
        filters={[
          {
            key: 'type',
            label: 'File Type',
            options: [
              { label: 'Images', value: 'image' },
              { label: 'Documents', value: 'application/pdf' },
              { label: 'Archives', value: 'zip' }
            ]
          }
        ]}
        onFilterChange={handleFilterChange}
        onReset={() => setOptions({ query: '', fileType: undefined, sortBy: 'created_at', order: 'desc', limit: 10, offset: 0 })}
      />

      <DataTable 
        columns={columns}
        data={attachments}
        isLoading={isLoading}
        onSort={handleSort}
        onRowSelect={setSelectedIds}
        onRowClick={setSelectedItem}
        totalCount={totalCount}
        pageSize={options.limit}
        currentPage={Math.floor(options.offset / options.limit) + 1}
        onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
        actions={(item) => (
          <button 
            className="icon-btn danger" 
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(item.id); }}
            title="Delete Attachment"
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
        title="Attachment Details"
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={itemToDelete ? 'Delete Attachment' : 'Bulk Delete'}
        message="Are you sure you want to delete the selected attachment(s)? This will permanently remove the file from storage."
        confirmLabel="Delete"
        type="danger"
      />
    </div>
  );
}
