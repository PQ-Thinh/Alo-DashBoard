export interface Conversation {
  id: string; // UUID
  is_group: boolean;
  name?: string;
  avatar_id?: string;
  avatar_url?: string;
  last_message_preview?: string;
  last_message_time?: string;
  last_message_sender_id?: string;
  hidden_pin_hash?: string;
  created_at?: string;
  status?: string;
}

export interface Participant {
  conversation_id: string;
  user_id: string;
  role: 'member' | 'admin';
  unread_count: number;
  encrypted_group_key?: string;
  status?: string;
  joined_at?: string;
}

export interface Message {
  id: string; // UUID
  conversation_id: string;
  sender_id?: string;
  reply_to_id?: string;
  encrypted_content: string;
  message_type: 'text' | 'image' | 'file' | 'CALL_MISSED' | 'CALL_ENDED' | 'CALL_CANCELLED' | 'CALL_STARTED' | string;
  is_edited: boolean;
  seen_by: string[]; // UUID[]
  call_duration_sec?: number;
  call_direction?: 'incoming' | 'outgoing';
  call_video?: boolean;
  call_reason?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface Attachment {
  id: string; // UUID
  message_id: string;
  file_url: string;
  file_type?: string;
  file_name?: string;
  file_size?: number;
  created_at?: string;
}

export interface MessageReaction {
  message_id: string;
  user_id: string;
  reaction_icon: string;
  count: number;
  created_at?: string;
}

export interface ChatListView {
  current_user_id: string;
  conversation_id: string;
  is_group: boolean;
  last_message_preview?: string;
  last_message_time?: string;
  last_message_sender_id?: string;
  unread_count: number;
  status?: string;
  chat_name?: string;
  chat_avatar?: string;
  target_user_id?: string;
  target_last_seen?: string;
}
