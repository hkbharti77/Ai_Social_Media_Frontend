import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    Zap, 
    TrendingUp, 
    Activity, 
    ShieldAlert, 
    Cpu, 
    Database, 
    Filter
} from 'lucide-react';
import { 
    XAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { getAdminStats, getAdminModelStats, getUserIntelligence, type AdminStats, type ModelUsageStats, type UserIntelligence } from '../../api/admin';
import { useAuth } from '../../context/useAuth';
import axios from '../../api/axios';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [models, setModels] = useState<ModelUsageStats[]>([]);
    const [userIntelligence, setUserIntelligence] = useState<UserIntelligence[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [s, m, u] = await Promise.all([
                    getAdminStats(),
                    getAdminModelStats(),
                    getUserIntelligence()
                ]);
                setStats(s);
                setModels(m);
                setUserIntelligence(u);
            } catch (error) {
                console.error("Admin data fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRefreshAccess = async () => {
        if (!window.confirm("This will generate a new password and email it to you. The current password will expire immediately. Continue?")) return;
        setRefreshing(true);
        try {
            await axios.post('/auth/owner/refresh-access');
            toast.success("New Access ID sent to your email!");
        } catch {
            toast.error("Failed to rotate access ID");
        } finally {
            setRefreshing(false);
        }
    };

    const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <Activity className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
    );

    if (user?.email !== 'hkbharti77@gmail.com') {
        return (
            <div className="flex flex-col h-[80vh] items-center justify-center space-y-6">
                <ShieldAlert className="w-16 h-16 text-rose-500" />
                <div className="text-center">
                    <h2 className="text-2xl font-black">ACCESS DENIED</h2>
                    <p className="text-white/40 mt-2">Only the Primary Project Owner can access Intelligence reports.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 bg-[#030303] min-h-screen text-white/90">
            {/* Header */}
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                        OWNER INTELLIGENCE
                    </h1>
                    <p className="text-white/40 mt-2 font-medium tracking-wide">Enterprise Analytics & Token Control</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button 
                        onClick={handleRefreshAccess}
                        disabled={refreshing}
                        className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-rose-400 font-bold"
                    >
                        <ShieldAlert className={`w-4 h-4 ${refreshing ? 'animate-pulse' : ''}`} /> 
                        {refreshing ? 'Generating...' : 'Refresh ID'}
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl transition-all font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </header>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'blue', trend: '+12%' },
                    { label: 'Active (Week)', value: stats?.activeUsersThisWeek || 0, icon: Activity, color: 'purple', trend: 'High' },
                    { label: 'Tokens Burned', value: `${((stats?.totalTokensUsed || 0) / 1000).toFixed(1)}k`, icon: Zap, color: 'yellow', trend: 'Live' },
                    { label: 'System Health', value: '99.9%', icon: ShieldAlert, color: 'green', trend: 'Stable' }
                ].map((kpi, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={kpi.label}
                        className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 relative group overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}-500/10 blur-[40px] group-hover:bg-${kpi.color}-500/20 transition-all duration-500`} />
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 bg-${kpi.color}-500/10 border border-${kpi.color}-500/20 rounded-2xl text-${kpi.color}-400`}>
                                <kpi.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-full">
                                {kpi.trend}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold font-mono">{kpi.value}</h3>
                        <p className="text-white/40 text-sm mt-1">{kpi.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Growth Chart */}
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-blue-400" /> Token Consumption Trend
                        </h2>
                        <select className="bg-transparent border-none text-white/40 text-sm outline-none">
                            <option>Last 30 Days</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[{n: 'Mon', t: 100}, {n: 'Tue', t: 300}, {n: 'Wed', t: 250}, {n: 'Thu', t: 500}, {n: 'Fri', t: 800}, {n: 'Sat', t: 600}, {n: 'Sun', t: 900}]}>
                                <defs>
                                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="n" stroke="#ffffff20" axisLine={false} tickLine={false} style={{fontSize: '12px'}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="t" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Model Distribution */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <Cpu className="w-5 h-5 text-purple-400" /> Model Intelligence
                    </h2>
                    <div className="h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={models.length > 0 ? models : [{modelId: 'None', totalTokens: 100}]}
                                    dataKey="totalTokens"
                                    nameKey="modelId"
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                >
                                    {(models.length > 0 ? models : [1]).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-2xl font-bold">AI</span>
                                <span className="text-[10px] text-white/30 uppercase tracking-widest">Share</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 mt-4">
                        {models.map((m, i) => (
                            <div key={m.modelId} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-white/60">{m.modelId}</span>
                                </div>
                                <span className="font-mono font-bold">{(m.totalTokens / 1000).toFixed(1)}k</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Power Users & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Intelligence Table */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <Users className="w-5 h-5 text-orange-400" /> Active User Intelligence
                        </h2>
                        <span className="text-[10px] bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                            Owner Only
                        </span>
                    </div>
                    <div className="space-y-4">
                        {userIntelligence.map((u) => (
                            <div key={u.userId} className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.06] transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">
                                            {u.fullName?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{u.fullName}</p>
                                            <p className="text-[10px] text-white/30 font-mono">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black uppercase tracking-tighter text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                                            {u.topModelId}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end text-[10px] uppercase font-black tracking-widest text-white/20">
                                        <span>Token Consumption</span>
                                        <span className="text-white/60">{(u.totalTokens / 1000).toFixed(1)}k / total</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((u.totalTokens / (stats?.totalTokensUsed || 1)) * 100 * 5, 100)}%` }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] text-white/20 font-bold uppercase">
                                        <div className="flex gap-3">
                                            <span>Logins: <span className="text-white/40">{u.loginCount}</span></span>
                                            <span>Active: <span className="text-white/40">{new Date(u.lastLoginAt).toLocaleDateString()}</span></span>
                                        </div>
                                        <button className="text-blue-500 hover:text-blue-400 transition-colors">
                                            Inspect Audit →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed / System Logs Placeholder */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 overflow-hidden relative">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <Database className="w-5 h-5 text-cyan-400" /> Real-time Audit Stream
                    </h2>
                    <div className="space-y-6">
                        <div className="border-l-2 border-white/10 pl-6 space-y-8 relative">
                            {[1,2,3,4].map(idx => (
                                <div key={idx} className="relative">
                                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-white/20 border-2 border-[#111]" />
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium">Image Generation Request</p>
                                            <p className="text-xs text-white/40 mt-1 italic">"A cybernetic social media dashboard..."</p>
                                        </div>
                                        <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/40">2m ago</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
