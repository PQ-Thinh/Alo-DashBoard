export interface User {
  id: string; // UUID
  username: string;
  display_name: string;
  email: string;
  bio?: string;
  phone?: string;
  avatarid: string;
  avatar_url?: string;
  birthday?: string;
  gender?: boolean;
  public_encrypt_key: string;
  public_sign_key: string;
  last_seen?: string; // ISO Timestamp
  role?: 'user' | 'admin' | 'super_admin';
  created_at?: string;
  updated_at?: string;
}

export interface UserDevice {
  id: string; // UUID
  user_id: string; // REFERENCES public.users(id)
  fcm_token: string;
  device_name?: string;
  created_at?: string;
  updated_at?: string;
}
