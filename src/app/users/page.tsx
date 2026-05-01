'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { UserController } from '@/controllers/user.controller';
import { User } from '@/models/user.model';
import DataTable, { Column } from '@/components/common/DataTable';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { Trash2, UserPlus, Mail, Edit2, Calendar, Search } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function UsersPage() {
  const { role: currentUserRole } = useAuth();
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

  const handleCreateClick = () => {
    setSelectedUser(null);
    setModalMode('create');
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
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
      header: 'User', 
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-foreground text-background-base flex items-center justify-center font-black text-sm border border-foreground/10 shrink-0 overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user.display_name?.[0] || '?'
            )}
          </div>
          <div>
            <div className="font-bold text-foreground leading-tight tracking-tight">{user.display_name}</div>
            <div className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mt-0.5">@{user.username}</div>
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
        const styles: any = {
          super_admin: 'bg-foreground text-background-base border-foreground',
          admin: 'bg-foreground/10 text-foreground border-foreground/20',
          user: 'bg-transparent text-foreground/40 border-foreground/10',
        };
        return (
          <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-[0.15em] border ${styles[role]}`}>
            {role.replace('_', ' ')}
          </span>
        );
      }
    },
    { 
      key: 'email', 
      header: 'Contact', 
      sortable: true,
      render: (user) => (
        <div className="text-sm font-medium text-foreground/60 tracking-tight">
          {user.email}
        </div>
      )
    },
    { 
      key: 'created_at', 
      header: 'Joined', 
      sortable: true,
      render: (user) => (
        <div className="text-xs text-foreground/30 font-bold">
          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-surface-base p-10 rounded-3xl border border-surface-border shadow-sm">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground">User Directory</h1>
          <p className="text-foreground/40 font-medium mt-2">Manage access and profile details for all platform members.</p>
        </div>
        <button 
          onClick={handleCreateClick}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background-base rounded-xl font-bold text-sm hover:opacity-80 transition-all shadow-lg"
        >
          <UserPlus size={18} />
          Add Member
        </button>
      </div>

      <div className="flex items-center gap-6 bg-surface-base p-2 px-6 rounded-2xl border border-surface-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/20" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-8 pr-4 py-4 bg-transparent border-none outline-none text-sm font-medium placeholder:text-foreground/10"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="h-6 w-[1px] bg-foreground/10"></div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Sort:</span>
          <select 
            className="bg-transparent border-none text-xs font-black uppercase tracking-wider outline-none cursor-pointer"
            onChange={(e) => handleSort(e.target.value, options.order)}
          >
            <option value="created_at">Recent</option>
            <option value="display_name">Name</option>
            <option value="role">Role</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={users}
        isLoading={isLoading}
        onSort={handleSort}
        onRowSelect={setSelectedIds}
        onRowClick={(user) => {
          setSelectedUser(user);
          setModalMode('view');
        }}
        totalCount={totalCount}
        pageSize={options.limit}
        currentPage={Math.floor(options.offset / options.limit) + 1}
        onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
        actions={(user) => (
          <div className="flex gap-1">
            <button 
              className="p-2 text-foreground/20 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all" 
              onClick={(e) => { e.stopPropagation(); handleEditClick(user); }}
            >
              <Edit2 size={16} />
            </button>
            <button 
              className="p-2 text-foreground/20 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all" 
              onClick={(e) => { e.stopPropagation(); { setUserToDelete(user.id); setIsDeleteModalOpen(true); } }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

      <ActionToolbar 
        selectedCount={selectedIds.length}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      <EntityModal 
        isOpen={!!selectedUser || modalMode === 'create'}
        onClose={() => { setSelectedUser(null); setModalMode('view'); }}
        entity={selectedUser}
        title={modalMode === 'create' ? 'Create Member' : 'Member Details'}
        mode={modalMode}
        onSave={handleSaveUser}
        readOnlyFields={currentUserRole !== 'super_admin' ? ['id', 'created_at', 'updated_at', 'role'] : ['id', 'created_at', 'updated_at']}
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={userToDelete ? 'Remove Member' : 'Bulk Removal'}
        message={userToDelete 
          ? 'Are you sure you want to remove this member? All associated data will be archived.' 
          : `Are you sure you want to remove ${selectedIds.length} selected members?`
        }
        confirmLabel="Confirm Removal"
        type="danger"
      />
    </div>
  );
}
