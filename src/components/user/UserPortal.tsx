'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTheme } from '@/components/common/ThemeContext';
import {
  User, MessageSquare, Heart, CheckSquare, Smartphone,
  LogOut, Sun, Moon, Command, LayoutDashboard, UserPlus,
  Mail, Phone, Calendar, Clock, Shield, Wifi, Edit3, Save, X
} from 'lucide-react';

type Tab = 'overview' | 'profile' | 'conversations' | 'friends' | 'tasks' | 'devices';

export default function UserPortal() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [profile, setProfile] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: '', bio: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const uid = user?.id;

  // ── Fetch all user data ──────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!uid) return;
    const { data } = await supabase.from('users').select('*').eq('id', uid).single();
    if (data) {
      setProfile(data);
      setEditForm({ display_name: data.display_name || '', bio: data.bio || '', phone: data.phone || '' });
    }
  }, [uid]);

  const fetchConversations = useCallback(async () => {
    if (!uid) return;
    const { data } = await supabase
      .from('participants')
      .select('*, conversations(id, name, is_group, last_message_preview, last_message_time)')
      .eq('user_id', uid)
      .order('joined_at', { ascending: false })
      .limit(20);
    setConversations(data || []);
  }, [uid]);

  const fetchFriends = useCallback(async () => {
    if (!uid) return;
    const { data } = await supabase
      .from('friends')
      .select('*, u1:users!friends_user_id_1_fkey(display_name, email, avatar_url), u2:users!friends_user_id_2_fkey(display_name, email, avatar_url)')
      .or(`user_id_1.eq.${uid},user_id_2.eq.${uid}`)
      .limit(30);
    setFriends(data || []);
  }, [uid]);

  const fetchTasks = useCallback(async () => {
    if (!uid) return;
    const { data } = await supabase
      .from('shared_tasks')
      .select('*, creator:users!shared_tasks_creator_id_fkey(display_name), conversations(name)')
      .or(`assignee_id.eq.${uid},creator_id.eq.${uid}`)
      .order('created_at', { ascending: false })
      .limit(20);
    setTasks(data || []);
  }, [uid]);

  const fetchDevices = useCallback(async () => {
    if (!uid) return;
    const { data } = await supabase
      .from('user_devices')
      .select('*')
      .eq('user_id', uid)
      .order('updated_at', { ascending: false });
    setDevices(data || []);
  }, [uid]);

  const fetchRequests = useCallback(async () => {
    if (!uid) return;
    const { data } = await supabase
      .from('friend_requests')
      .select('*, sender:users!friend_requests_sender_id_fkey(display_name, email)')
      .eq('receiver_id', uid)
      .eq('status', 'pending')
      .limit(10);
    setRequests(data || []);
  }, [uid]);

  useEffect(() => {
    fetchProfile();
    fetchConversations();
    fetchFriends();
    fetchTasks();
    fetchDevices();
    fetchRequests();
  }, [fetchProfile, fetchConversations, fetchFriends, fetchTasks, fetchDevices, fetchRequests]);

  // ── Save profile ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!uid) return;
    setSaving(true);
    const { error } = await supabase.from('users').update(editForm).eq('id', uid);
    if (!error) {
      await fetchProfile();
      setIsEditing(false);
    }
    setSaving(false);
  };

  // ── Nav items ────────────────────────────────────────────────────────
  const navItems: { id: Tab; icon: React.ElementType; label: string; badge?: number }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'Tổng quan' },
    { id: 'profile', icon: User, label: 'Hồ sơ của tôi' },
    { id: 'conversations', icon: MessageSquare, label: 'Cuộc trò chuyện', badge: conversations.length },
    { id: 'friends', icon: Heart, label: 'Bạn bè', badge: requests.length || undefined },
    { id: 'tasks', icon: CheckSquare, label: 'Công việc', badge: tasks.filter(t => !t.is_completed).length || undefined },
    { id: 'devices', icon: Smartphone, label: 'Thiết bị', badge: devices.length || undefined },
  ];

  const friendOf = (f: any) => f.user_id_1 === uid ? f.u2 : f.u1;

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col bg-zinc-950 border-r border-zinc-900 h-full">
        {/* Brand */}
        <div className="h-16 flex items-center px-5 gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Command size={18} className="text-zinc-950" />
          </div>
          <span className="text-white font-bold tracking-tight">Alo Portal</span>
        </div>

        {/* Avatar summary */}
        <div className="mx-4 mb-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{profile?.display_name || 'Chưa đặt tên'}</p>
              <p className="text-zinc-500 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                activeTab === item.id
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <item.icon size={16} />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="text-[10px] font-black bg-white text-zinc-950 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-900 flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="flex-1" />
          <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all text-xs font-medium">
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-zinc-950 dark:text-white">
                Xin chào, {profile?.display_name || 'bạn'} 👋
              </h1>
              <p className="text-zinc-500 text-sm mt-1">Đây là tổng quan tài khoản của bạn trên Alo.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Cuộc trò chuyện', value: conversations.length, icon: MessageSquare, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' },
                { label: 'Bạn bè', value: friends.length, icon: Heart, color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' },
                { label: 'Lời mời', value: requests.length, icon: UserPlus, color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' },
                { label: 'Thiết bị', value: devices.length, icon: Smartphone, color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800">
                  <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                    <s.icon size={18} />
                  </div>
                  <p className="text-2xl font-black text-zinc-950 dark:text-white">{s.value}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Pending requests */}
            {requests.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="font-bold text-zinc-950 dark:text-white text-sm">Lời mời kết bạn đang chờ</p>
                </div>
                {requests.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      {r.sender?.display_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{r.sender?.display_name}</p>
                      <p className="text-xs text-zinc-400">{r.sender?.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <div className="p-8 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black text-zinc-950 dark:text-white">Hồ sơ của tôi</h1>
                <p className="text-zinc-500 text-sm mt-1">Xem và chỉnh sửa thông tin cá nhân.</p>
              </div>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-xl text-sm font-bold transition-all hover:opacity-80">
                  <Edit3 size={14} /> Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-sm font-bold">
                    <X size={14} /> Hủy
                  </button>
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-xl text-sm font-bold disabled:opacity-50">
                    <Save size={14} /> {saving ? 'Lưu...' : 'Lưu'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
              {/* Avatar */}
              <div className="h-28 bg-zinc-950 relative">
                <div className="absolute bottom-0 left-6 translate-y-1/2 w-16 h-16 rounded-2xl bg-zinc-700 border-4 border-white dark:border-zinc-900 flex items-center justify-center text-xl font-black text-white">
                  {profile?.display_name?.[0]?.toUpperCase() || '?'}
                </div>
              </div>
              <div className="pt-12 px-6 pb-6 space-y-4">
                {[
                  { label: 'Tên hiển thị', key: 'display_name', icon: User, value: profile?.display_name, type: 'text' },
                  { label: 'Tiểu sử', key: 'bio', icon: Edit3, value: profile?.bio, type: 'text' },
                  { label: 'Số điện thoại', key: 'phone', icon: Phone, value: profile?.phone, type: 'tel' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <f.icon size={11} /> {f.label}
                    </label>
                    {isEditing ? (
                      <input
                        type={f.type}
                        value={(editForm as any)[f.key]}
                        onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-all"
                      />
                    ) : (
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                        {f.value || <span className="text-zinc-400 italic">Chưa cập nhật</span>}
                      </p>
                    )}
                  </div>
                ))}
                {/* Read-only fields */}
                {[
                  { label: 'Email', icon: Mail, value: user?.email },
                  { label: 'Vai trò', icon: Shield, value: profile?.role },
                  { label: 'Ngày tham gia', icon: Calendar, value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : null },
                  { label: 'Hoạt động cuối', icon: Clock, value: profile?.last_seen ? new Date(profile.last_seen).toLocaleString('vi-VN') : null },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <f.icon size={11} /> {f.label}
                    </label>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                      {f.value || <span className="text-zinc-400 italic">—</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CONVERSATIONS ── */}
        {activeTab === 'conversations' && (
          <div className="p-8 space-y-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-950 dark:text-white">Cuộc trò chuyện</h1>
              <p className="text-zinc-500 text-sm mt-1">Các phòng chat bạn đang tham gia.</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-50 dark:divide-zinc-800">
              {conversations.length === 0 ? (
                <div className="py-16 text-center text-zinc-400 text-sm">Chưa có cuộc trò chuyện nào.</div>
              ) : conversations.map((p, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <MessageSquare size={18} className="text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                      {p.conversations?.name || (p.conversations?.is_group ? 'Nhóm không tên' : 'Trò chuyện riêng')}
                    </p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{p.conversations?.last_message_preview || 'Chưa có tin nhắn'}</p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${p.conversations?.is_group ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                    {p.conversations?.is_group ? 'Nhóm' : '1-1'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FRIENDS ── */}
        {activeTab === 'friends' && (
          <div className="p-8 space-y-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-950 dark:text-white">Bạn bè</h1>
              <p className="text-zinc-500 text-sm mt-1">Danh sách bạn bè của bạn.</p>
            </div>
            {requests.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4">
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2">
                  <UserPlus size={14} className="inline mr-1.5" />
                  {requests.length} lời mời kết bạn đang chờ
                </p>
                {requests.map(r => (
                  <p key={r.id} className="text-xs text-amber-600 dark:text-amber-500">• {r.sender?.display_name} ({r.sender?.email})</p>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {friends.length === 0 ? (
                <div className="col-span-2 py-16 text-center text-zinc-400 text-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">Chưa có bạn bè nào.</div>
              ) : friends.map((f, i) => {
                const friend = friendOf(f);
                return (
                  <div key={i} className="flex items-center gap-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-400 shrink-0">
                      {friend?.display_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">{friend?.display_name}</p>
                      <p className="text-xs text-zinc-400 truncate">{friend?.email}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TASKS ── */}
        {activeTab === 'tasks' && (
          <div className="p-8 space-y-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-950 dark:text-white">Công việc</h1>
              <p className="text-zinc-500 text-sm mt-1">Các nhiệm vụ bạn được giao hoặc đã tạo.</p>
            </div>
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="py-16 text-center text-zinc-400 text-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">Không có công việc nào.</div>
              ) : tasks.map(t => (
                <div key={t.id} className="flex items-start gap-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 px-5 py-4">
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${t.is_completed ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-300 dark:border-zinc-600'}`}>
                    {t.is_completed && <span className="text-white text-[10px]">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${t.is_completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>{t.title}</p>
                    {t.description && <p className="text-xs text-zinc-400 mt-0.5 truncate">{t.description}</p>}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {t.conversations?.name && (
                        <span className="text-[10px] text-zinc-400 font-medium">📍 {t.conversations.name}</span>
                      )}
                      {t.creator?.display_name && (
                        <span className="text-[10px] text-zinc-400 font-medium">👤 {t.creator.display_name}</span>
                      )}
                      {t.due_date && (
                        <span className={`text-[10px] font-medium ${new Date(t.due_date) < new Date() && !t.is_completed ? 'text-rose-500' : 'text-zinc-400'}`}>
                          📅 {new Date(t.due_date).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DEVICES ── */}
        {activeTab === 'devices' && (
          <div className="p-8 space-y-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-950 dark:text-white">Thiết bị của tôi</h1>
              <p className="text-zinc-500 text-sm mt-1">Các thiết bị đã đăng nhập vào tài khoản của bạn.</p>
            </div>
            <div className="space-y-3">
              {devices.length === 0 ? (
                <div className="py-16 text-center text-zinc-400 text-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">Không có thiết bị nào.</div>
              ) : devices.map(d => (
                <div key={d.id} className="flex items-center gap-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Smartphone size={18} className="text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{d.device_name || 'Thiết bị không tên'}</p>
                    <p className="text-xs text-zinc-400 font-mono truncate">{d.fcm_token?.substring(0, 24)}...</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <Wifi size={14} />
                    <span className="text-xs font-bold">Online</span>
                  </div>
                  <p className="text-xs text-zinc-400 hidden md:block">{new Date(d.updated_at).toLocaleDateString('vi-VN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
