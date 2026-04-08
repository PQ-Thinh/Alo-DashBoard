'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CallController } from '@/controllers/call.controller';
import { VideoCall } from '@/models/call.model';
import DataTable, { Column } from '@/components/common/DataTable';
import FilterBar from '@/components/common/FilterBar';
import EntityModal from '@/components/common/EntityModal';
import { PhoneCall, Video, PhoneIncoming, PhoneOutgoing, Clock, Shield } from 'lucide-react';

export default function CallsPage() {
  const [calls, setCalls] = useState<VideoCall[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<VideoCall | null>(null);

  const [options, setOptions] = useState({
    sortBy: 'created_at',
    order: 'desc' as 'asc' | 'desc',
    limit: 10,
    offset: 0
  });

  const fetchCalls = useCallback(async () => {
    setIsLoading(true);
    const { data, count } = await CallController.getCallLogs(options);
    setCalls(data);
    setTotalCount(count);
    setIsLoading(false);
  }, [options]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const columns: Column<VideoCall>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (call) => (
        <div style={{ color: 'var(--text-secondary)' }}>
          {call.is_video ? <Video size={18} /> : <PhoneCall size={18} />}
        </div>
      )
    },
    {
      key: 'message_id',
      header: 'Message ID',
      render: (call) => <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{call.message_id}</div>
    },
    {
      key: 'direction',
      header: 'Direction',
      render: (call) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          {call.direction === 'incoming' ? <PhoneIncoming size={14} /> : <PhoneOutgoing size={14} />}
          {call.direction?.toUpperCase()}
        </div>
      )
    },
    {
      key: 'end_reason',
      header: 'Reason',
      sortable: true,
      render: (call) => (
        <span style={{ 
          padding: '2px 8px', 
          borderRadius: '4px', 
          fontSize: '0.75rem', 
          fontWeight: 600,
          background: call.end_reason === 'ended' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: call.end_reason === 'ended' ? '#10b981' : '#ef4444'
        }}>
          {call.end_reason?.toUpperCase() || 'UNKNOWN'}
        </span>
      )
    },
    {
      key: 'duration_sec',
      header: 'Duration',
      sortable: true,
      render: (call) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <Clock size={14} style={{ opacity: 0.5 }} />
          {call.duration_sec ? `${call.duration_sec}s` : '0s'}
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Time',
      sortable: true,
      render: (call) => (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {new Date(call.created_at!).toLocaleString()}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Call History</h1>
        <p className="page-description">Monitor voice and video calls, track durations, and audit communication logs.</p>
      </div>

      <FilterBar 
        onSearch={() => {}} 
        onReset={() => setOptions({ sortBy: 'created_at', order: 'desc', limit: 10, offset: 0 })}
      />

      <DataTable 
        columns={columns}
        data={calls}
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
        title="Call Details"
      />
    </div>
  );
}
