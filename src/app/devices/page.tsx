'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { UserController } from '@/controllers/user.controller';
import { UserDevice } from '@/models/user.model';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, Smartphone, Bell, Calendar, Search, Cpu } from 'lucide-react';

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
      header: 'Thiết bị', 
      sortable: true,
      render: (device) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <Smartphone size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white leading-tight">{device.device_name || 'Thiết bị không tên'}</div>
            <div className="text-xs text-slate-500 font-medium tracking-wider uppercase">ID: {device.id.substring(0, 8)}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'user_id', 
      header: 'ID Người dùng', 
      render: (device) => <div className="text-sm font-mono text-slate-500">{device.user_id}</div>
    },
    { 
      key: 'fcm_token', 
      header: 'FCM Token', 
      render: (device) => (
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium italic">
          <Bell size={12} className="opacity-50" />
          <span className="max-w-[200px] truncate">{device.fcm_token}</span>
        </div>
      )
    },
    { 
      key: 'created_at', 
      header: 'Ngày đăng ký', 
      sortable: true,
      render: (device) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <Calendar size={14} className="opacity-50" />
          {device.created_at ? new Date(device.created_at).toLocaleDateString('vi-VN') : 'N/A'}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Quản lý thiết bị</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Giám sát các thiết bị đã đăng ký nhận thông báo đẩy.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm thiết bị hoặc token..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

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
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" 
            onClick={(e) => { e.stopPropagation(); setDeviceToDelete(device.id); setIsDeleteModalOpen(true); }}
            title="Xóa thiết bị"
          >
            <Trash2 size={16} />
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
        title="Chi tiết thiết bị"
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={deviceToDelete ? 'Xóa thiết bị' : 'Xóa hàng loạt'}
        message="Bạn có chắc chắn muốn xóa thiết bị này? Người dùng sẽ không nhận được thông báo đẩy trên thiết bị này cho đến khi đăng ký lại."
        confirmLabel="Xóa ngay"
        type="danger"
      />
    </div>
  );
}
