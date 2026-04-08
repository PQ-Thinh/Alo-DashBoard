'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { UserController } from '@/controllers/user.controller';
import { UserDevice } from '@/models/user.model';
import DataTable, { Column } from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, Smartphone, Cpu, Bell, Calendar } from 'lucide-react';

export default function DevicesPage() {
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<UserDevice | null>(null);

  const [options, setOptions] = useState({
    query: '',
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 10,
    offset: 0
  });

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    const { data, count } = await UserController.getDevices(options);
    setDevices(data);
    setTotalCount(count);
    setIsLoading(false);
  }, [options]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleSearch = (query: string) => {
    setOptions(prev => ({ ...prev, query, offset: 0 }));
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setOptions(prev => ({ ...prev, sortBy: key, order }));
  };

  const handleDeleteClick = (id: string) => {
    setDeviceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deviceToDelete) {
      const success = await UserController.deleteDevice(deviceToDelete);
      if (success) fetchDevices();
    } else if (selectedIds.length > 0) {
      const success = await UserController.bulkDeleteDevices(selectedIds);
      if (success) {
        setSelectedIds([]);
        fetchDevices();
      }
    }
  };

  const columns: Column<UserDevice>[] = [
    { 
      key: 'device_name', 
      header: 'Device', 
      sortable: true,
      render: (device) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--text-secondary)' }}><Smartphone size={18} /></div>
          <div>
            <div style={{ fontWeight: 600 }}>{device.device_name || 'Generic Device'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {device.id.substring(0, 8)}...</div>
          </div>
        </div>
      )
    },
    { 
      key: 'user_id', 
      header: 'User ID', 
      render: (device) => <div style={{ fontSize: '0.85rem' }}>{device.user_id}</div>
    },
    { 
      key: 'fcm_token', 
      header: 'FCM Token', 
      render: (device) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <Bell size={14} />
          <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{device.fcm_token}</span>
        </div>
      )
    },
    { 
      key: 'created_at', 
      header: 'Registered', 
      sortable: true,
      render: (device) => (
        <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} style={{ opacity: 0.5 }} />
          {device.created_at ? new Date(device.created_at).toLocaleDateString() : 'N/A'}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Device Management</h1>
        <p className="page-description">Monitor and manage user devices and push notification tokens for security and auditing.</p>
      </div>

      <FilterBar 
        onSearch={handleSearch}
        onReset={() => setOptions({ query: '', sortBy: 'created_at', order: 'desc', limit: 10, offset: 0 })}
      />

      <DataTable 
        columns={columns}
        data={devices}
        isLoading={isLoading}
        onSort={handleSort}
        onRowSelect={setSelectedIds}
        onRowClick={setSelectedDevice}
        totalCount={totalCount}
        pageSize={options.limit}
        currentPage={Math.floor(options.offset / options.limit) + 1}
        onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
        actions={(device) => (
          <button 
            className="icon-btn danger" 
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(device.id); }}
            title="Delete Device"
          >
            <Trash2 size={18} />
          </button>
        )}
      />

      <ActionToolbar 
        selectedCount={selectedIds.length}
        onDelete={() => { setDeviceToDelete(null); setIsDeleteModalOpen(true); }}
      />

      <EntityModal 
        isOpen={!!selectedDevice}
        onClose={() => setSelectedDevice(null)}
        entity={selectedDevice}
        title="Device Details"
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={deviceToDelete ? 'Delete Device' : 'Bulk Delete'}
        message="Are you sure you want to delete the selected device(s)? This will disable push notifications for those devices until they register again."
        confirmLabel="Delete"
        type="danger"
      />
    </div>
  );
}
