import { supabase } from '@/lib/supabase/client';
import { Conversation, Message, ChatListView, Participant } from '@/models/chat.model';

export const ChatController = {
  /**
   * Get list of conversations for current user
   */
  async getChatList(userId: string): Promise<ChatListView[]> {
    const { data, error } = await supabase
      .from('chat_list_view')
      .select('*')
      .eq('current_user_id', userId)
      .order('last_message_time', { ascending: false });

    if (error) {
      console.error('Error fetching chat list:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Send a message
   */
  async sendMessage(message: Partial<Message>): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }
    return data;
  },

  /**
   * Create a group conversation
   */
  async createGroup(name: string, avatarUrl: string, userIds: string[], encryptedKeys: Record<string, string>): Promise<ChatListView | null> {
    const { data, error } = await supabase.rpc('create_group_conversation', {
      p_name: name,
      p_avatar_url: avatarUrl,
      p_user_ids: userIds,
      p_encrypted_keys: encryptedKeys
    });

    if (error) {
      console.error('Error creating group:', error);
      return null;
    }
    return data ? data[0] : null;
  },

  /**
   * Reset unread count for a conversation
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase.rpc('reset_unread_count', {
      conv_id: conversationId,
      u_id: userId
    });

    if (error) {
      console.error('Error marking as read:', error);
    }
  },

  /**
   * Mark message as seen
   */
  async markMessageSeen(messageId: string, userId: string): Promise<void> {
    const { error } = await supabase.rpc('mark_message_seen', {
      p_message_id: messageId,
      p_user_id: userId
    });

    if (error) {
      console.error('Error marking message as seen:', error);
    }
  }
};
