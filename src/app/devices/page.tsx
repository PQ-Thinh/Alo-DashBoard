'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { UserController } from '@/controllers/user.controller';
import { UserDevice } from '@/models/user.model';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, Smartphone, Bell, Calendar, Search, Filter } from 'lucide-react';

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
    limit: 5,
    offset: 0
  });

  const fetchDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, count } = await UserController.getDevices(options);
      setDevices(data);
      setTotalCount(count);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
    setIsDeleteModalOpen(false);
  };

  const columns: Column<UserDevice>[] = [
    { 
      key: 'device_name', 
      header: 'Device', 
      sortable: true,
      render: (device) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-200 dark:border-zinc-700">
            <Smartphone size={18} />
          </div>
          <div>
            <div className="font-bold text-zinc-950 dark:text-white text-sm">{device.device_name || 'Unnamed Device'}</div>
            <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">ID: {device.id.substring(0, 8)}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'user_id', 
      header: 'User ID', 
      render: (device) => <div className="text-sm font-mono text-zinc-700 dark:text-zinc-400">{device.user_id}</div>
    },
    { 
      key: 'fcm_token', 
      header: 'FCM Token', 
      render: (device) => (
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-500 font-medium italic">
          <Bell size={12} className="opacity-50" />
          <span className="max-w-[150px] truncate">{device.fcm_token}</span>
        </div>
      )
    },
    { 
      key: 'created_at', 
      header: 'Registered', 
      sortable: true,
      render: (device) => (
        <span className="text-zinc-600 dark:text-zinc-500 font-medium text-xs">
          {device.created_at ? new Date(device.created_at).toLocaleDateString() : 'N/A'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Device Management</h1>
          <p className="text-zinc-500 font-medium text-sm mt-0.5">Monitor and manage registered push notification devices.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 shadow-md">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" size={15} />
          <input 
            type="text" 
            placeholder="Search by device or token..." 
            className="w-full h-10 pl-10 pr-4 bg-zinc-100 dark:bg-zinc-950 border-transparent focus:bg-white dark:focus:bg-zinc-900 border focus:border-zinc-300 dark:focus:border-zinc-700 rounded-lg text-sm outline-none transition-all font-medium"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <button className="h-10 px-4 flex items-center gap-2 bg-zinc-100 dark:bg-zinc-950 border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg text-sm font-bold text-zinc-600 dark:text-zinc-400 transition-all">
          <Filter size={14} />
          <span>Filters</span>
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
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
              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-all" 
              onClick={(e) => { e.stopPropagation(); setDeviceToDelete(device.id); setIsDeleteModalOpen(true); }}
              title="Delete Device"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          )}
        />
      </div>

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
        message="Are you sure you want to delete this device? Users will not receive push notifications on this device until they re-register."
        confirmLabel="Confirm"
        type="danger"
      />
    </div>
  );
}
