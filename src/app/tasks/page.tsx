'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TaskController } from '@/controllers/task.controller';
import { SharedTask } from '@/models/task.model';
import DataTable, { Column } from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import ActionToolbar from '@/components/common/ActionToolbar';
import ConfirmModal from '@/components/common/ConfirmModal';
import EntityModal from '@/components/common/EntityModal';
import { supabase } from '@/lib/supabase/client';
import { Trash2, CheckCircle, Circle, Clock, Tag, MessageSquare, User } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<SharedTask | null>(null);

  const [options, setOptions] = useState({
    query: '',
    isCompleted: undefined as boolean | undefined,
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 10,
    offset: 0
  });

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    const { data, count } = await TaskController.searchTasks(options);
    setTasks(data);
    setTotalCount(count);
    setIsLoading(false);
  }, [options]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSearch = (query: string) => {
    setOptions(prev => ({ ...prev, query, offset: 0 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      const isCompleted = value === 'completed' ? true : value === 'pending' ? false : undefined;
      setOptions(prev => ({ ...prev, isCompleted, offset: 0 }));
    }
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setOptions(prev => ({ ...prev, sortBy: key, order }));
  };

  const handleRowSelect = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleRowClick = (task: SharedTask) => {
    setSelectedTask(task);
  };

  const handleToggleStatus = async (task: SharedTask) => {
    const success = await TaskController.setTaskStatus(task.id, !task.is_completed);
    if (success) fetchTasks();
  };

  const handleDeleteClick = (id: string) => {
    setTaskToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSaveTask = async (updatedTask: SharedTask) => {
    const { error } = await supabase.from('shared_tasks').update(updatedTask).eq('id', updatedTask.id);
    if (!error) {
      fetchTasks();
      setSelectedTask(null);
      return true;
    }
    return false;
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      const success = await TaskController.deleteTask(taskToDelete);
      if (success) fetchTasks();
    } else if (selectedIds.length > 0) {
      const success = await TaskController.bulkDeleteTasks(selectedIds);
      if (success) {
        setSelectedIds([]);
        fetchTasks();
      }
    }
  };

  const columns: Column<SharedTask>[] = [
    { 
      key: 'title', 
      header: 'Task Information', 
      sortable: true,
      render: (task) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); handleToggleStatus(task); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.is_completed ? '#10b981' : 'var(--text-secondary)' }}
          >
            {task.is_completed ? <CheckCircle size={20} /> : <Circle size={20} />}
          </button>
          <div>
            <div style={{ 
              fontWeight: 600, 
              textDecoration: task.is_completed ? 'line-through' : 'none',
              opacity: task.is_completed ? 0.5 : 1
            }}>
              {task.title}
            </div>
            {task.description && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{task.description}</div>
            )}
          </div>
        </div>
      )
    },
    { 
      key: 'assignee_id', 
      header: 'Assignee', 
      render: (task) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <User size={14} />
          <span>{task.assignee_id || 'Unassigned'}</span>
        </div>
      )
    },
    { 
      key: 'due_date', 
      header: 'Due Date', 
      sortable: true,
      render: (task) => (
        <div style={{ 
          fontSize: '0.85rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          color: task.due_date && new Date(task.due_date) < new Date() && !task.is_completed ? '#ef4444' : 'inherit'
        }}>
          <Clock size={14} style={{ opacity: 0.5 }} />
          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}
        </div>
      )
    },
    { 
      key: 'created_at', 
      header: 'Created At', 
      sortable: true,
      render: (task) => (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tasks Management</h1>
        <p className="page-description">Track shared tasks across all conversations, update statuses, and perform bulk operations.</p>
      </div>

      <FilterBar 
        onSearch={handleSearch}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Completed', value: 'completed' },
              { label: 'Pending', value: 'pending' }
            ]
          }
        ]}
        onFilterChange={handleFilterChange}
        onReset={() => setOptions({ query: '', isCompleted: undefined, sortBy: 'created_at', order: 'desc', limit: 10, offset: 0 })}
      />

      <DataTable 
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        onSort={handleSort}
        onRowSelect={handleRowSelect}
        onRowClick={handleRowClick}
        totalCount={totalCount}
        pageSize={options.limit}
        currentPage={Math.floor(options.offset / options.limit) + 1}
        onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
        actions={(task) => (
          <button 
            className="icon-btn danger" 
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(task.id); }}
            title="Delete Task"
          >
            <Trash2 size={18} />
          </button>
        )}
      />

      <ActionToolbar 
        selectedCount={selectedIds.length}
        onDelete={() => {
          setTaskToDelete(null);
          setIsDeleteModalOpen(true);
        }}
      />

      <EntityModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        entity={selectedTask}
        title="Task Details"
        onSave={handleSaveTask}
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete the selected task(s)? This action is permanent."
        confirmLabel="Delete"
        type="danger"
      />
    </div>
  );
}
