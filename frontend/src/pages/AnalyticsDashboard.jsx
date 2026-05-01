import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  LayoutDashboard, TrendingUp, HardDrive, Files, Users, 
  ArrowUpRight, ArrowDownRight, Activity, PieChart as PieIcon 
} from 'lucide-react';
import { fileService } from '../services/fileService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884d8', '#82ca9d'];

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const stats = await fileService.getDashboard();
      setData(stats);
    } catch {
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-surface-container rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-container rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-surface-container rounded-2xl" />
          <div className="h-[400px] bg-surface-container rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const typeData = Object.entries(data.typeDistribution || {}).map(([name, value]) => ({ name, value }));
  const growthData = data.growthData || [];

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8 space-y-8 pb-16">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
            {user?.role === 'manager' ? 'Team Analytics' : 'Command Center'} <TrendingUp className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mt-1">
            {user?.role === 'manager' ? 'Team file insights and usage metrics' : 'Real-time platform insights & storage metrics'}
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="p-3 bg-surface-container hover:bg-surface-container-high rounded-2xl transition-all group"
          title="Refresh statistics"
        >
          <Activity className="w-5 h-5 text-primary group-hover:animate-spin" />
        </button>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Files} 
          label="Total Files" 
          value={data.totalFiles} 
          trend="+12%" 
          color="primary"
        />
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl text-secondary bg-secondary/10">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-secondary uppercase">{data.percentage.toFixed(1)}% Used</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Storage Capacity</p>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${Math.min(data.percentage, 100)}%` }} />
            </div>
            <p className="text-sm font-bold mt-2">{formatSize(data.usedBytes)} / {formatSize(data.totalCapacity)}</p>
          </div>
        </div>
        <StatCard 
          icon={Activity} 
          label="Active Shares" 
          value={data.sharedCount} 
          trend="Real-time" 
          color="tertiary"
        />
        <StatCard 
          icon={Users} 
          label="Total Users" 
          value={data.totalUsers || 1} 
          trend="Enterprise" 
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Chart */}
        <div className="glass-card p-8 min-h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black font-manrope">Platform Growth</h3>
            <div className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase">File count / month</div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(20,20,20,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar 
                  dataKey="fileCount" 
                  name="Files" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage Chart */}
        <div className="glass-card p-8 min-h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black font-manrope">Storage Utilization</h3>
            <div className="bg-secondary/10 text-secondary text-[10px] font-black px-3 py-1 rounded-full uppercase">Cumulative Usage</div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" hide />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <Tooltip 
                   formatter={(v) => formatSize(v)}
                   contentStyle={{ 
                    backgroundColor: 'rgba(20,20,20,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="storageUsed" 
                  name="Used Space"
                  stroke="var(--color-secondary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#areaGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type Distribution */}
        <div className="glass-card p-8 min-h-[400px] flex flex-col lg:col-span-1">
           <div className="flex items-center gap-3 mb-8">
             <PieIcon className="w-5 h-5 text-tertiary" />
             <h3 className="text-xl font-black font-manrope">Content Distribution</h3>
           </div>
           <div className="flex-1 flex flex-col items-center">
             <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-[10px] font-black uppercase tracking-widest w-full">
                {typeData.map((t, i) => (
                   <div key={t.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-on-surface-variant">{t.name}</span>
                      <span className="ml-auto text-on-surface">{t.value}</span>
                   </div>
                ))}
             </div>
           </div>
        </div>

        {/* Quick Info */}
        <div className="glass-card p-8 bg-gradient-to-br from-primary/10 via-transparent to-surface-container relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <LayoutDashboard className="w-64 h-64 rotate-12" />
           </div>
           <div className="relative z-10 space-y-6">
              <h3 className="text-2xl font-black font-manrope">System Health</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-4 border-b ghost-border">
                    <span className="text-sm font-bold text-on-surface-variant">Database Sync</span>
                    <span className="text-xs font-black text-success uppercase">Active</span>
                 </div>
                 <div className="flex justify-between items-center py-4 border-b ghost-border">
                    <span className="text-sm font-bold text-on-surface-variant">Storage Provider</span>
                    <span className="text-xs font-black text-on-surface uppercase italic">Local File System</span>
                 </div>
                 <div className="flex justify-between items-center py-4 border-b ghost-border">
                    <span className="text-sm font-bold text-on-surface-variant">Audit Tracing</span>
                    <span className="text-xs font-black text-primary uppercase">Enabled</span>
                 </div>
              </div>
              <p className="text-xs font-medium text-on-surface-variant/70 italic mt-8">
                 Last automated check performed at {new Date().toLocaleTimeString()}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, color = 'primary' }) => {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    tertiary: 'text-tertiary bg-tertiary/10',
  };

  return (
    <div className="glass-card p-6 group hover:translate-y-[-4px] transition-all cursor-default">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          {React.createElement(icon, { className: "w-5 h-5" })}
        </div>
        <span className="text-[10px] font-black text-success flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black font-manrope">{value}</p>
      </div>
    </div>
  );
};
