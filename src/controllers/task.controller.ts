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
