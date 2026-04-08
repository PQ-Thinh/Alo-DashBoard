export interface SharedTask {
  id: string; // UUID
  conversation_id: string;
  creator_id?: string;
  assignee_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}
