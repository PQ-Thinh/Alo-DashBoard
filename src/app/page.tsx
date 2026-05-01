'use client';

import React from 'react';
import { 
  Users, MessageSquare, PhoneCall, TrendingUp, TrendingDown, 
  ArrowUpRight, Clock, Activity, Calendar as CalendarIcon, MoreVertical
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Mon', users: 400, messages: 2400 },
  { name: 'Tue', users: 300, messages: 1398 },
  { name: 'Wed', users: 600, messages: 9800 },
  { name: 'Thu', users: 400, messages: 3908 },
  { name: 'Fri', users: 700, messages: 4800 },
  { name: 'Sat', users: 500, messages: 3800 },
  { name: 'Sun', users: 900, messages: 4300 },
];

const pieData = [
  { name: 'Active', value: 70, color: '#000000' },
  { name: 'Inactive', value: 30, color: '#e5e5e5' },
];

const StatCard = ({ title, value, trend, icon: Icon }: any) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-surface-base p-8 rounded-2xl border border-surface-border shadow-sm transition-all group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-foreground text-background-base rounded-xl flex items-center justify-center">
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-black tracking-tighter ${trend > 0 ? 'text-foreground' : 'opacity-40'}`}>
        {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {Math.abs(trend)}%
      </div>
    </div>
    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
    <h3 className="text-3xl font-black text-foreground tracking-tighter">{value}</h3>
  </motion.div>
);

export default function DashboardPage() {
  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground">Overview</h1>
          <p className="text-foreground/40 font-medium mt-2">Activity and performance metrics for your system.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-5 py-2.5 bg-foreground text-background-base rounded-lg text-sm font-bold transition-all hover:opacity-80">
            Generate Report
          </button>
          <button className="p-2.5 bg-surface-base border border-surface-border rounded-lg text-foreground hover:bg-foreground/5 transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value="12,543" trend={12.5} icon={Users} />
        <StatCard title="Messages" value="45.2k" trend={8.2} icon={MessageSquare} />
        <StatCard title="Calls" value="1,280" trend={-2.4} icon={PhoneCall} />
        <StatCard title="Avg. Uptime" value="99.9%" trend={0.1} icon={Activity} />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-base p-10 rounded-3xl border border-surface-border shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black tracking-tighter">Growth Analytics</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-foreground"></div>
                <span className="text-xs font-bold text-foreground/40 italic">New Users</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorMono" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 10, fontWeight: 'bold', opacity: 0.3}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 10, fontWeight: 'bold', opacity: 0.3}} />
                <Tooltip 
                  cursor={{stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '4 4'}}
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', boxShadow: 'var(--shadow-premium)' }}
                  labelStyle={{ fontWeight: 'black', color: 'var(--foreground)', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="users" stroke="currentColor" strokeWidth={3} fillOpacity={1} fill="url(#colorMono)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-base p-10 rounded-3xl border border-surface-border shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-black tracking-tighter mb-10">Platform Distribution</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-10 space-y-2 w-full">
            <div className="flex justify-between items-center px-4 py-2 bg-foreground/5 rounded-lg">
              <span className="text-xs font-bold text-foreground/40">Mobile</span>
              <span className="text-sm font-black text-foreground">70%</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2 bg-foreground/5 rounded-lg">
              <span className="text-xs font-bold text-foreground/40">Desktop</span>
              <span className="text-sm font-black text-foreground">30%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-base p-10 rounded-3xl border border-surface-border shadow-sm">
          <h3 className="text-xl font-black tracking-tighter mb-8 flex items-center gap-2">
            Recent Activity
          </h3>
          <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-foreground/5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-6 relative">
                <div className="w-10 h-10 rounded-full bg-foreground text-background-base flex items-center justify-center shrink-0 z-10 border-4 border-background-base">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">New member joined the team</p>
                  <p className="text-xs text-foreground/40 font-medium mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-base p-10 rounded-3xl border border-surface-border shadow-sm">
          <h3 className="text-xl font-black tracking-tighter mb-8 flex items-center gap-2">
            System Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-foreground text-background-base flex flex-col justify-between h-40">
              <Activity size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Server Load</p>
                <p className="text-2xl font-black tracking-tight">Normal</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-foreground/5 border border-surface-border flex flex-col justify-between h-40">
              <ArrowUpRight size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">API Status</p>
                <p className="text-2xl font-black tracking-tight text-foreground">99.9%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}