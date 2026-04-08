'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SocialController } from '@/controllers/social.controller';
import { Friend, FriendRequest } from '@/models/social.model';
import DataTable, { Column } from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import EntityModal from '@/components/common/EntityModal';
import { Share2, UserPlus, Users, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SocialPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  const [options, setOptions] = useState({
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 10,
    offset: 0
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    if (activeTab === 'friends') {
      const { data, count } = await SocialController.searchFriends(options);
      setFriends(data);
      setTotalCount(count);
    } else {
      const { data, count } = await SocialController.searchFriendRequests(options);
      setRequests(data);
      setTotalCount(count);
    }
    setIsLoading(false);
  }, [activeTab, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const friendColumns: Column<Friend>[] = [
    { key: 'user_id_1', header: 'User 1', render: (f) => <span style={{ fontSize: '0.8rem' }}>{f.user_id_1}</span> },
    { key: 'user_id_2', header: 'User 2', render: (f) => <span style={{ fontSize: '0.8rem' }}>{f.user_id_2}</span> },
    { key: 'created_at', header: 'Connected Since', render: (f) => <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(f.created_at!).toLocaleDateString()}</div> }
  ];

  const requestColumns: Column<FriendRequest>[] = [
    { key: 'sender_id', header: 'Sender', render: (r) => <span style={{ fontSize: '0.8rem' }}>{r.sender_id}</span> },
    { key: 'receiver_id', header: 'Receiver', render: (r) => <span style={{ fontSize: '0.8rem' }}>{r.receiver_id}</span> },
    { 
      key: 'status', 
      header: 'Status', 
      render: (r) => (
        <span style={{ 
          padding: '2px 8px', 
          borderRadius: '4px', 
          fontSize: '0.75rem', 
          background: r.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
          color: r.status === 'pending' ? '#f59e0b' : '#3b82f6' 
        }}>
          {r.status?.toUpperCase()}
        </span>
      ) 
    },
    { key: 'created_at', header: 'Sent At', render: (r) => <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(r.created_at!).toLocaleString()}</div> }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Social Management</h1>
        <p className="page-description">Manage user relationships, audit friend connections, and monitor pending friend requests.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button 
          onClick={() => setActiveTab('friends')}
          style={{ 
            padding: '12px 24px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'friends' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'friends' ? '#3b82f6' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Connections
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          style={{ 
            padding: '12px 24px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'requests' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'requests' ? '#3b82f6' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Friend Requests
        </button>
      </div>

      <FilterBar 
        onSearch={() => {}} 
        onReset={() => setOptions({ sortBy: 'created_at', order: 'desc', limit: 10, offset: 0 })}
      />

      <DataTable 
        columns={(activeTab === 'friends' ? friendColumns : requestColumns) as any}
        data={(activeTab === 'friends' ? friends : requests) as any}
        isLoading={isLoading}
        onSort={(key, order) => setOptions(prev => ({ ...prev, sortBy: key, order }))}
        onRowClick={setSelectedEntity}
        totalCount={totalCount}
        pageSize={options.limit}
        currentPage={Math.floor(options.offset / options.limit) + 1}
        onPageChange={(page) => setOptions(prev => ({ ...prev, offset: (page - 1) * options.limit }))}
      />

      <EntityModal 
        isOpen={!!selectedEntity}
        onClose={() => setSelectedEntity(null)}
        entity={selectedEntity}
        title={activeTab === 'friends' ? 'Connection Details' : 'Request Details'}
      />
    </div>
  );
}
