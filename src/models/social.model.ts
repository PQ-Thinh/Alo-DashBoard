export interface FriendRequest {
  id: string; // UUID
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at?: string;
}

export interface Friend {
  id: string; // UUID
  user_id_1: string;
  user_id_2: string;
  created_at?: string;
}
