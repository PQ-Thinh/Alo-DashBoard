import { supabase } from '@/lib/supabase/client';
import { SharedTask } from '@/models/task.model';

export const TaskController = {
  /**
   * Get tasks for a conversation
   */
  async getTasks(conversationId: string): Promise<SharedTask[]> {
    const { data, error } = await supabase
      .from('shared_tasks')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Search and filter tasks with sorting
   */
  async searchTasks(options?: {
    query?: string;
    conversationId?: string;
    isCompleted?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{ data: SharedTask[], count: number }> {
    let query = supabase.from('shared_tasks').select('*', { count: 'exact' });

    if (options?.query) {
      query = query.ilike('title', `%${options.query}%`);
    }

    if (options?.conversationId) {
      query = query.eq('conversation_id', options.conversationId);
    }

    if (options?.isCompleted !== undefined) {
      query = query.eq('is_completed', options.isCompleted);
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
      console.error('Error searching tasks:', error);
      return { data: [], count: 0 };
    }
    return { data: data || [], count: count || 0 };
  },

  /**
   * Bulk delete tasks
   */
  async bulkDeleteTasks(taskIds: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('shared_tasks')
      .delete()
      .in('id', taskIds);

    if (error) {
      console.error('Error bulk deleting tasks:', error);
      return false;
    }
    return true;
  },

  /**
   * Delete a single task
   */
  async deleteTask(taskId: string): Promise<boolean> {
    const { error } = await supabase
      .from('shared_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }
    return true;
  },

  /**
   * Create or update a task
   */
  async upsertTask(task: Partial<SharedTask>): Promise<SharedTask | null> {
    const { data, error } = await supabase
      .from('shared_tasks')
      .upsert(task)
      .select()
      .single();

    if (error) {
      console.error('Error upserting task:', error);
      return null;
    }
    return data;
  },

  /**
   * Mark task as completed/incomplete
   */
  async setTaskStatus(taskId: string, isCompleted: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('shared_tasks')
      .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task status:', error);
      return false;
    }
    return true;
  }
};
