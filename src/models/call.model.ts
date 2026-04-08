export interface VideoCall {
  id: string; // UUID
  message_id: string;
  duration_sec: number;
  direction: 'incoming' | 'outgoing';
  is_video: boolean;
  end_reason?: 'ended' | 'missed' | 'rejected' | 'cancelled' | string;
  created_at?: string;
}
