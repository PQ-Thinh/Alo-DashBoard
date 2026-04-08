import { supabase } from '@/lib/supabase/client';
import { User, UserDevice } from '@/models/user.model';

export const UserController = {
  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
    return true;
  },

  /**
   * Search users by username or display name
   */
  async searchUsers(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Upsert FCM token for a device
   */
  async upsertFcmToken(token: string, deviceName: string): Promise<void> {
    const { error } = await supabase.rpc('upsert_fcm_token', {
      p_token: token,
      p_device_name: deviceName
    });

    if (error) {
      console.error('Error upserting FCM token:', error);
    }
  },

  /**
   * Update last seen time for current user
   */
  async updateLastSeen(): Promise<void> {
    const { error } = await supabase.rpc('update_last_seen');
    if (error) {
      console.error('Error updating last seen:', error);
    }
  }
};
