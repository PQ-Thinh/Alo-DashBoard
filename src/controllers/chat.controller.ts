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
   * Search and filter conversations with sorting
   */
  async searchConversations(options?: {
    query?: string;
    type?: 'group' | 'direct';
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{ data: ChatListView[], count: number }> {
    let query = supabase.from('chat_list_view').select('*', { count: 'exact' });

    if (options?.query) {
      query = query.or(`name.ilike.%${options.query}%,last_message_content.ilike.%${options.query}%`);
    }

    if (options?.type) {
      query = query.eq('is_group', options.type === 'group');
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, { ascending: options.order === 'asc' });
    } else {
      query = query.order('last_message_time', { ascending: false });
    }

    if (options?.limit) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching conversations:', error);
      return { data: [], count: 0 };
    }
    return { data: data || [], count: count || 0 };
  },

  /**
   * Bulk delete conversations
   */
  async bulkDeleteConversations(conversationIds: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .in('id', conversationIds);

    if (error) {
      console.error('Error bulk deleting conversations:', error);
      return false;
    }
    return true;
  },

  /**
   * Delete a single conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
    return true;
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
   * Search and filter messages globally for auditing
   */
  async searchMessages(options?: {
    query?: string;
    conversationId?: string;
    senderId?: string;
    messageType?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{ data: Message[], count: number }> {
    let query = supabase.from('messages').select('*', { count: 'exact' });

    if (options?.query) {
      query = query.ilike('encrypted_content', `%${options.query}%`);
    }

    if (options?.conversationId) {
      query = query.eq('conversation_id', options.conversationId);
    }

    if (options?.senderId) {
      query = query.eq('sender_id', options.senderId);
    }

    if (options?.messageType) {
      query = query.eq('message_type', options.messageType);
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, { ascending: options.order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options?.limit) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching messages:', error);
      return { data: [], count: 0 };
    }
    return { data: data || [], count: count || 0 };
  },

  /**
   * Bulk delete messages
   */
  async bulkDeleteMessages(messageIds: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .in('id', messageIds);

    if (error) {
      console.error('Error bulk deleting messages:', error);
      return false;
    }
    return true;
  },

  /**
   * Search attachments globally
   */
  async searchAttachments(options?: {
    query?: string;
    fileType?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[], count: number }> {
    let query = supabase.from('attachments').select('*', { count: 'exact' });

    if (options?.query) {
      query = query.ilike('file_name', `%${options.query}%`);
    }

    if (options?.fileType) {
      query = query.ilike('file_type', `%${options.fileType}%`);
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, { ascending: options.order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options?.limit) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching attachments:', error);
      return { data: [], count: 0 };
    }
    return { data: data || [], count: count || 0 };
  },

  /**
   * Search participants globally
   */
  async searchParticipants(options?: {
    conversationId?: string;
    userId?: string;
    role?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{ data: Participant[], count: number }> {
    let query = supabase.from('participants').select('*', { count: 'exact' });

    if (options?.conversationId) {
      query = query.eq('conversation_id', options.conversationId);
    }

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options?.role) {
      query = query.eq('role', options.role);
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, { ascending: options.order === 'asc' });
    } else {
      query = query.order('joined_at', { ascending: false });
    }

    if (options?.limit) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching participants:', error);
      return { data: [], count: 0 };
    }
    return { data: data || [], count: count || 0 };
  },

  /**
   * Search reactions globally
   */
  async searchReactions(options?: {
    messageId?: string;
    userId?: string;
    icon?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[], count: number }> {
    let query = supabase.from('message_reactions').select('*', { count: 'exact' });

    if (options?.messageId) {
      query = query.eq('message_id', options.messageId);
    }

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options?.icon) {
      query = query.eq('reaction_icon', options.icon);
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, { ascending: options.order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options?.limit) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching reactions:', error);
      return { data: [], count: 0 };
    }
    return { data: data || [], count: count || 0 };
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
