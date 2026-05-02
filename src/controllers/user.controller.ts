import { supabase } from '@/lib/supabase/client';
import { User, UserDevice } from '@/models/user.model';
import { getCached, setCached, invalidateCache } from '@/lib/cache';

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
   * Create a new user (Note: Usually requires auth user creation first)
   */
  async createUser(userData: Partial<User>): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .insert([userData]);

    if (error) {
      console.error('Error creating user:', error);
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
   * Get all users with filtering, sorting, and pagination
   */
  async getUsers(options?: {
    query?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{ data: User[], count: number }> {
    const cacheKey = `users:${JSON.stringify(options)}`;
    const cached = getCached<{ data: User[], count: number }>(cacheKey);
    if (cached) return cached;

    let query = supabase.from('users').select('*', { count: 'exact' });

    if (options?.query) {
      query = query.or(`username.ilike.%${options.query}%,display_name.ilike.%${options.query}%`);
    }

    query = query.order(options?.sortBy || 'created_at', { ascending: options?.order === 'asc' });

    const limit = options?.limit ?? 5;
    const from = options?.offset ?? 0;
    query = query.range(from, from + limit - 1).limit(limit);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return { data: [], count: 0 };
    }
    const result = { data: data || [], count: count || 0 };
    setCached(cacheKey, result);
    return result;
  },

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(userIds: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .in('id', userIds);

    if (error) {
      console.error('Error bulk deleting users:', error);
      return false;
    }
    invalidateCache('users:');
    return true;
  },

  /**
   * Delete a single user
   */
  async deleteUser(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }
    invalidateCache('users:');
    return true;
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
   * Get devices with filtering, sorting, and pagination
   */
  async getDevices(options?: {
    query?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{ data: UserDevice[], count: number }> {
    const cacheKey = `devices:${JSON.stringify(options)}`;
    const cached = getCached<{ data: UserDevice[], count: number }>(cacheKey);
    if (cached) return cached;

    let query = supabase.from('user_devices').select('*', { count: 'exact' });

    if (options?.query) {
      query = query.or(`device_name.ilike.%${options.query}%,fcm_token.ilike.%${options.query}%`);
    }

    query = query.order(options?.sortBy || 'created_at', { ascending: options?.order === 'asc' });

    const limit = options?.limit ?? 5;
    const from = options?.offset ?? 0;
    query = query.range(from, from + limit - 1).limit(limit);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching devices:', error);
      return { data: [], count: 0 };
    }
    const result = { data: data || [], count: count || 0 };
    setCached(cacheKey, result);
    return result;
  },

  /**
   * Delete a single device
   */
  async deleteDevice(deviceId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_devices')
      .delete()
      .eq('id', deviceId);

    if (error) {
      console.error('Error deleting device:', error);
      return false;
    }
    return true;
  },

  /**
   * Bulk delete devices
   */
  async bulkDeleteDevices(deviceIds: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('user_devices')
      .delete()
      .in('id', deviceIds);

    if (error) {
      console.error('Error bulk deleting devices:', error);
      return false;
    }
    return true;
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
