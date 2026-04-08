import { supabase } from '@/lib/supabase/client';
import { VideoCall } from '@/models/call.model';

export const CallController = {
  /**
   * Log a video call
   */
  async logCall(callData: Partial<VideoCall>): Promise<VideoCall | null> {
    const { data, error } = await supabase
      .from('video_calls')
      .insert(callData)
      .select()
      .single();

    if (error) {
      console.error('Error logging call:', error);
      return null;
    }
    return data;
  },

  /**
   * Get call history with filtering and sorting
   */
  async getCallLogs(options?: {
    query?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{ data: VideoCall[], count: number }> {
    let query = supabase.from('video_calls').select('*', { count: 'exact' });

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
      console.error('Error fetching call logs:', error);
      return { data: [], count: 0 };
    }
    return { data: data || [], count: count || 0 };
  },

  /**
   * Get call history for a message
   */
  async getCallByMessageId(messageId: string): Promise<VideoCall | null> {
    const { data, error } = await supabase
      .from('video_calls')
      .select('*')
      .eq('message_id', messageId)
      .single();

    if (error) {
      console.error('Error fetching call log:', error);
      return null;
    }
    return data;
  }
};
