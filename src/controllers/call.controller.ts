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
