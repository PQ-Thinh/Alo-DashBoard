'use client';

import React from 'react';
import { 
  Users, MessageSquare, PhoneCall, TrendingUp, TrendingDown, 
  ArrowUpRight, Clock, Activity, Calendar as CalendarIcon, 
  Target, Zap, Globe, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { motion } from 'framer-motion';

const areaData = [
  { name: 'Mon', active: 2400, new: 1400 },
  { name: 'Tue', active: 1398, new: 1800 },
  { name: 'Wed', active: 9800, new: 2400 },
  { name: 'Thu', active: 3908, new: 2800 },
  { name: 'Fri', active: 4800, new: 3200 },
  { name: 'Sat', active: 3800, new: 4000 },
  { name: 'Sun', active: 4300, new: 4500 },
];

const barData = [
  { name: 'US', value: 4000 },
  { name: 'UK', value: 3000 },
  { name: 'VN', value: 2000 },
  { name: 'JP', value: 2780 },
  { name: 'DE', value: 1890 },
];

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="card-base group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white border border-zinc-200 dark:border-zinc-800`}>
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {change > 0 ? '+' : ''}{change}%
      </div>
    </div>
    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</p>
    <div className="flex items-baseline gap-2 mt-1">
      <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">{value}</h3>
    </div>
  </div>
);

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">Dashboard Overview</h1>
          <p className="text-zinc-500 font-medium text-sm mt-1">Monitor your system performance and user engagement in real-time.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm font-bold">
            Last 30 Days
          </button>
          <button className="btn-primary text-sm flex items-center gap-2">
            Download Report
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value="24,512" change={12} icon={Users} />
        <StatCard title="Engagement" value="84.2%" change={5.4} icon={Zap} />
        <StatCard title="Total Volume" value="$12.4k" change={-2.1} icon={Target} />
        <StatCard title="Global Reach" value="142" change={8} icon={Globe} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-base">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black tracking-tight">Traffic Analysis</h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Daily active users vs new signups</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-zinc-950 dark:bg-white"></div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">New</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 10, fontWeight: 600}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 10, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
                  itemStyle={{ fontSize: '11px', fontWeight: '600' }}
                />
                <Area type="monotone" dataKey="active" stroke="currentColor" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMain)" className="text-zinc-950 dark:text-white" />
                <Area type="monotone" dataKey="new" stroke="#a1a1aa" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-base flex flex-col">
          <h3 className="text-lg font-black tracking-tight mb-6">Top Regions</h3>
          <div className="flex-1 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{left: -20}}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 11, fontWeight: 600}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'currentColor' : '#e4e4e7'} className="dark:fill-zinc-800" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {barData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-400">0{i+1}</span>
                  <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">{item.name}</span>
                </div>
                <span className="text-sm font-black tracking-tight">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-base">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black tracking-tight">Recent Activity</h3>
            <button className="text-xs font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 transition-all">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800">
                  <Clock size={14} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-950 dark:text-white">New deployment successful</p>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">Frontend production branch was updated by @thinh</p>
                  <span className="text-[10px] text-zinc-400 mt-2 block">12 minutes ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-base">
          <h3 className="text-lg font-black tracking-tight mb-6">System Status</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">API Gateway</span>
              </div>
              <span className="badge badge-success">Healthy</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Database Cluster</span>
              </div>
              <span className="badge badge-success">Healthy</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Worker Node 03</span>
              </div>
              <span className="badge bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">Delayed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}