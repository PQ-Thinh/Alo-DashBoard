'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { UserController } from '@/controllers/user.controller';
import { User } from '@/models/user.model';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, UserPlus, Mail, Edit2, Search, Filter, MoreHorizontal, ChevronDown } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function UsersPage() {
  const { canManageRoles } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  const [options, setOptions] = useState({
    query: '',
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 5,
    offset: 0
  });

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, count } = await UserController.getUsers(options);
      setUsers(data);
      setTotalCount(count);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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

  const handleSaveUser = async (userData: any) => {
    let success = false;
    if (modalMode === 'create') {
      success = await UserController.createUser(userData);
    } else {
      success = await UserController.updateProfile(userData.id, userData);
    }

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
    setIsDeleteModalOpen(false);
  };

  const columns: Column<User>[] = [
    { 
      key: 'display_name', 
      header: 'Member', 
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-950 dark:text-white border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user.display_name?.[0] || '?'
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-950 dark:text-white text-sm">{user.display_name}</span>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">@{user.username}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'role', 
      header: 'Role', 
      sortable: true,
      render: (user) => {
        const role = user.role || 'user';
        const badgeClass: any = {
          super_admin: 'badge-error',
          admin: 'badge-blue',
          user: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
        };
        // Only super_admin can change roles
        if (!canManageRoles) {
          return <span className={`badge ${badgeClass[role]}`}>{role.replace('_', ' ')}</span>;
        }
        return (
          <select
            defaultValue={role}
            onChange={async (e) => {
              await UserController.updateProfile(user.id, { role: e.target.value as any });
              fetchUsers();
            }}
            className="text-xs font-bold bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 cursor-pointer outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
            <option value="super_admin">super admin</option>
          </select>
        );
      }
    },
    { 
      key: 'email', 
      header: 'Email', 
      sortable: true,
      render: (user) => (
        <span className="text-zinc-700 dark:text-zinc-400 font-medium text-sm">{user.email}</span>
      )
    },
    { 
      key: 'created_at', 
      header: 'Joined', 
      sortable: true,
      render: (user) => (
        <span className="text-zinc-600 dark:text-zinc-500 font-medium text-xs">
          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">User Management</h1>
          <p className="text-zinc-500 font-medium text-sm mt-0.5">Invite, manage, and monitor your platform members.</p>
        </div>
        <button 
          onClick={() => { setSelectedUser(null); setModalMode('create'); }}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 shadow-md">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white transition-colors" size={15} />
          <input 
            type="text" 
            placeholder="Search members by name or username..." 
            className="w-full h-10 pl-10 pr-4 bg-zinc-100 dark:bg-zinc-950 border-transparent focus:bg-white dark:focus:bg-zinc-900 border focus:border-zinc-300 dark:focus:border-zinc-700 rounded-lg text-sm outline-none transition-all font-medium"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <button className="h-10 px-4 flex items-center gap-2 bg-zinc-100 dark:bg-zinc-950 border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg text-sm font-bold text-zinc-600 dark:text-zinc-400 transition-all w-full md:w-auto">
          <Filter size={14} />
          <span>Filter</span>
          <ChevronDown size={14} className="ml-auto md:ml-0" />
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
        <DataTable 
          columns={columns}
          data={users}
          isLoading={isLoading}
          onSort={handleSort}
          onRowSelect={setSelectedIds}
          onRowClick={(u) => { setSelectedUser(u); setModalMode('view'); }}
          totalCount={totalCount}
          pageSize={options.limit}
          currentPage={Math.floor(options.offset / options.limit) + 1}
          onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
          actions={(user) => (
            <div className="flex items-center gap-1">
              <button 
                className="p-2 text-indigo-600 dark:text-amber-400 hover:bg-indigo-100 dark:hover:bg-amber-400/20 rounded-xl transition-all group/btn"
                onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setModalMode('edit'); }}
                title="Edit User"
              >
                <Edit2 size={16} strokeWidth={2.5} />
              </button>
              <button 
                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-all group/btn" 
                onClick={(e) => { e.stopPropagation(); setUserToDelete(user.id); setIsDeleteModalOpen(true); }}
                title="Delete User"
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
        />
      </div>

      <ActionToolbar 
        selectedCount={selectedIds.length}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      <EntityModal 
        isOpen={!!selectedUser || modalMode === 'create'}
        onClose={() => { setSelectedUser(null); setModalMode('view'); }}
        entity={selectedUser}
        title={modalMode === 'create' ? 'Create User' : 'User Information'}
        mode={modalMode}
        onSave={handleSaveUser}
        readOnlyFields={!canManageRoles ? ['id', 'created_at', 'updated_at', 'role'] : ['id', 'created_at', 'updated_at']}
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={userToDelete ? 'Delete User' : 'Bulk Delete'}
        message="Are you sure you want to proceed? This action cannot be undone."
        confirmLabel="Confirm"
        type="danger"
      />
    </div>
  );
}
