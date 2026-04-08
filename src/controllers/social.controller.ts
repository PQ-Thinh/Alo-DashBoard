import { supabase } from '@/lib/supabase/client';
import { FriendRequest, Friend } from '@/models/social.model';

export const SocialController = {
  /**
   * Get friend requests for current user
   */
  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) {
      console.error('Error fetching friend requests:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Send or update a friend request (pending)
   */
  async sendFriendRequest(senderId: string, receiverId: string): Promise<void> {
    const { error } = await supabase.rpc('upsert_friend_request', {
      p_sender_id: senderId,
      p_receiver_id: receiverId
    });

    if (error) {
      console.error('Error sending friend request:', error);
    }
  },

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(senderId: string, receiverId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('accept_friend_request', {
      p_sender_id: senderId,
      p_receiver_id: receiverId
    });

    if (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
    return data || false;
  },

  /**
   * Get friends list
   */
  async getFriends(userId: string): Promise<Friend[]> {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

    if (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
    return data || [];
  }
};
