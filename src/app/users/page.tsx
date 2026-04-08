'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { UserController } from '@/controllers/user.controller';
import { User } from '@/models/user.model';
import DataTable, { Column } from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, User as UserIcon, Mail, Calendar, Info } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [options, setOptions] = useState({
    query: '',
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 10,
    offset: 0
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const { data, count } = await UserController.getUsers(options);
    setUsers(data);
    setTotalCount(count);
    setIsLoading(false);
  }, [options]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (query: string) => {
    setOptions(prev => ({ ...prev, query, offset: 0 }));
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setOptions(prev => ({ ...prev, sortBy: key, order }));
  };

  const handleRowSelect = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleBulkDelete = () => {
    setUserToDelete(null); // Indicates bulk delete
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = async (updatedUser: User) => {
    const success = await UserController.updateProfile(updatedUser.id, updatedUser);
    if (success) {
      fetchUsers();
      setSelectedUser(null);
    }
    return success;
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      const success = await UserController.deleteUser(userToDelete);
      if (success) fetchUsers();
    } else if (selectedIds.length > 0) {
      const success = await UserController.bulkDeleteUsers(selectedIds);
      if (success) {
        setSelectedIds([]);
        fetchUsers();
      }
    }
  };

  const columns: Column<User>[] = [
    { 
      key: 'display_name', 
      header: 'User', 
      sortable: true,
      render: (user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'rgba(59, 130, 246, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#3b82f6',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}>
            {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.display_name?.[0] || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{user.display_name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{user.username}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'email', 
      header: 'Email', 
      sortable: true,
      render: (user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Mail size={14} />
          {user.email}
        </div>
      )
    },
    { 
      key: 'gender', 
      header: 'Gender', 
      render: (user) => (
        <span style={{ fontSize: '0.85rem' }}>{user.gender === true ? 'Male' : user.gender === false ? 'Female' : 'N/A'}</span>
      )
    },
    { 
      key: 'birthday', 
      header: 'Birthday', 
      render: (user) => (
        <span style={{ fontSize: '0.85rem' }}>{user.birthday ? new Date(user.birthday).toLocaleDateString() : 'N/A'}</span>
      )
    },
    { 
      key: 'created_at', 
      header: 'Joined', 
      sortable: true,
      render: (user) => (
        <div style={{ fontSize: '0.85rem' }}>
          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-description">Manage and monitor application users, search by name, and perform bulk actions.</p>
      </div>

      <FilterBar 
        onSearch={handleSearch}
        onReset={() => setOptions({ query: '', sortBy: 'created_at', order: 'desc', limit: 10, offset: 0 })}
      />

      <DataTable 
        columns={columns}
        data={users}
        isLoading={isLoading}
        onSort={handleSort}
        onRowSelect={handleRowSelect}
        onRowClick={handleRowClick}
        totalCount={totalCount}
        pageSize={options.limit}
        currentPage={Math.floor(options.offset / options.limit) + 1}
        onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
        actions={(user) => (
          <button 
            className="icon-btn danger" 
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(user.id); }}
            title="Delete User"
          >
            <Trash2 size={18} />
          </button>
        )}
      />

      <ActionToolbar 
        selectedCount={selectedIds.length}
        onDelete={handleBulkDelete}
      />

      <EntityModal 
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        entity={selectedUser}
        title="User Details"
        onSave={handleSaveUser}
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={userToDelete ? 'Delete User' : 'Bulk Delete Users'}
        message={userToDelete 
          ? 'Are you sure you want to delete this user? This action cannot be undone.' 
          : `Are you sure you want to delete ${selectedIds.length} selected users? This action cannot be undone.`
        }
        confirmLabel="Delete"
        type="danger"
      />
    </div>
  );
}
