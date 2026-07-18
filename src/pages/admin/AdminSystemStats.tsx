import { useState, useEffect } from 'react';
import { getSystemStats, getRevenueStats, getCreditStats, getPostStats, type SystemStats, type RevenueStats, type CreditStats, type PostStats } from '../../api/admin';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import { 
    Users, 
    DollarSign, 
    CreditCard, 
    FileText, 
    TrendingUp, 
    AlertTriangle,
    Activity
} from 'lucide-react';

export default function AdminSystemStats() {
    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
    const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
    const [creditStats, setCreditStats] = useState<CreditStats | null>(null);
    const [postStats, setPostStats] = useState<PostStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllStats();
    }, []);

    const loadAllStats = async () => {
        setLoading(true);
        try {
            const [system, revenue, credits, posts] = await Promise.all([
                getSystemStats(),
                getRevenueStats(),
                getCreditStats(),
                getPostStats()
            ]);
            setSystemStats(system);
            setRevenueStats(revenue);
            setCreditStats(credits);
            setPostStats(posts);
        } catch {
            toast.error('Failed to load system stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex h-[80vh] items-center justify-center">
                    <Activity className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="p-8 space-y-8 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-4xl font-black tracking-tight">
                        SYSTEM DASHBOARD
                    </h1>
                    <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-bold">
                        Platform-wide Statistics & Analytics
                    </p>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Total Users */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[40px] group-hover:bg-blue-500/20 transition-all duration-500" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                            <Users size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-full">
                            Active
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold font-mono">
                        {systemStats?.totalUsers?.toLocaleString() || '0'}
                    </h3>
                    <p className="text-white/40 text-sm mt-1">Total Users</p>
                    <p className="text-sm text-green-400 mt-2">
                        {systemStats?.activeUsers || 0} active
                    </p>
                </div>

                {/* Total Revenue */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 blur-[40px] group-hover:bg-green-500/20 transition-all duration-500" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-full">
                            Revenue
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold font-mono">
                        ₹{systemStats?.totalRevenue?.toLocaleString() || '0'}
                    </h3>
                    <p className="text-white/40 text-sm mt-1">Total Revenue</p>
                    <p className="text-sm text-green-400 mt-2">
                        ₹{systemStats?.monthlyRevenue?.toLocaleString() || '0'} this month
                    </p>
                </div>

                {/* Total Credits Used */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-[40px] group-hover:bg-purple-500/20 transition-all duration-500" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
                            <CreditCard size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-full">
                            Credits
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold font-mono">
                        {systemStats?.totalCreditsUsed?.toLocaleString() || '0'}
                    </h3>
                    <p className="text-white/40 text-sm mt-1">Credits Used</p>
                    <p className="text-sm text-purple-400 mt-2">
                        {systemStats?.monthlyCreditsUsed?.toLocaleString() || '0'} this month
                    </p>
                </div>

                {/* Total Posts */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-[40px] group-hover:bg-orange-500/20 transition-all duration-500" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400">
                            <FileText size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-full">
                            Content
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold font-mono">
                        {systemStats?.totalPosts?.toLocaleString() || '0'}
                    </h3>
                    <p className="text-white/40 text-sm mt-1">Total Posts</p>
                    <p className="text-sm text-orange-400 mt-2">
                        {systemStats?.monthlyPosts?.toLocaleString() || '0'} this month
                    </p>
                </div>
            </div>

            {/* Revenue Details */}
            {revenueStats && (
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 mb-6">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <TrendingUp size={24} className="text-green-400" />
                        Revenue Analytics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-2">Total Revenue</h3>
                            <p className="text-3xl font-bold font-mono">
                                ₹{revenueStats?.totalRevenue?.toLocaleString() || '0'}
                            </p>
                            <p className="text-sm text-white/40 mt-2">
                                {revenueStats?.totalPayments || 0} payments
                            </p>
                        </div>
                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-2">Monthly Revenue</h3>
                            <p className="text-3xl font-bold font-mono">
                                ₹{revenueStats?.monthlyRevenue?.toLocaleString() || '0'}
                            </p>
                            <p className="text-sm text-white/40 mt-2">
                                {revenueStats?.monthlyPayments || 0} payments
                            </p>
                        </div>
                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-2">Daily Revenue</h3>
                            <p className="text-3xl font-bold font-mono">
                                ₹{revenueStats?.dailyRevenue?.toLocaleString() || '0'}
                            </p>
                            <p className="text-sm text-white/40 mt-2">Today</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Credit Analytics */}
            {creditStats && (
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 mb-6">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <CreditCard size={24} className="text-purple-400" />
                        Credit Analytics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-2">Total Credits Used</h3>
                            <p className="text-3xl font-bold font-mono">
                                {creditStats?.totalCreditsUsed?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-2">Monthly Credits Used</h3>
                            <p className="text-3xl font-bold font-mono">
                                {creditStats?.monthlyCreditsUsed?.toLocaleString() || '0'}
                            </p>
                        </div>
                    </div>

                    {/* Top Users */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold mb-4 text-white/80">
                            Top Credit Users
                        </h3>
                        <div className="space-y-3">
                            {creditStats?.topUsers?.slice(0, 5).map((user, index) => (
                                <div key={user.userId} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.06] transition-all">
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-black text-white/20 w-8">#{index + 1}</span>
                                        <span className="text-sm font-medium">{user.email}</span>
                                    </div>
                                    <span className="font-bold text-purple-400 text-sm">
                                        {user.totalCredits?.toLocaleString() || '0'} credits
                                    </span>
                                </div>
                            )) || <div className="text-white/40 text-center py-4">No data available</div>}
                        </div>
                    </div>

                    {/* Credits by Purpose */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-white/80">
                            Credits by Purpose
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {creditStats?.creditsByPurpose?.map((item) => (
                                <div key={item.purpose} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-3xl">
                                    <span className="text-sm font-medium">{item.purpose}</span>
                                    <span className="font-bold text-purple-400 text-sm">
                                        {item.total?.toLocaleString() || '0'}
                                    </span>
                                </div>
                            )) || <div className="text-white/40 text-center py-4">No data available</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* Post Analytics */}
            {postStats && (
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 mb-6">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <FileText size={24} className="text-orange-400" />
                        Content Analytics
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-2">Total Posts</h3>
                            <p className="text-3xl font-bold font-mono">
                                {postStats?.totalPosts || 0}
                            </p>
                        </div>
                        <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-blue-400/60 tracking-widest mb-2">Draft</h3>
                            <p className="text-3xl font-bold font-mono text-blue-400">
                                {postStats?.draftPosts || 0}
                            </p>
                        </div>
                        <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-yellow-400/60 tracking-widest mb-2">Scheduled</h3>
                            <p className="text-3xl font-bold font-mono text-yellow-400">
                                {postStats?.scheduledPosts || 0}
                            </p>
                        </div>
                        <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-green-400/60 tracking-widest mb-2">Published</h3>
                            <p className="text-3xl font-bold font-mono text-green-400">
                                {postStats?.publishedPosts || 0}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-red-400/60 tracking-widest mb-2">Failed</h3>
                            <p className="text-3xl font-bold font-mono text-red-400">
                                {postStats?.failedPosts || 0}
                            </p>
                        </div>
                        <div className="p-5 bg-purple-500/10 border border-purple-500/20 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-purple-400/60 tracking-widest mb-2">Monthly Posts</h3>
                            <p className="text-3xl font-bold font-mono text-purple-400">
                                {postStats?.monthlyPosts || 0}
                            </p>
                        </div>
                        <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-indigo-400/60 tracking-widest mb-2">Published Today</h3>
                            <p className="text-3xl font-bold font-mono text-indigo-400">
                                {postStats?.dailyPublished || 0}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Alerts */}
            {systemStats && systemStats.fraudFlaggedUsers > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-[2.5rem] p-8 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="text-red-400" size={28} />
                        <h2 className="text-2xl font-black text-red-400">
                            SECURITY ALERT
                        </h2>
                    </div>
                    <p className="text-red-300/80 text-sm">
                        {systemStats.fraudFlaggedUsers} user(s) flagged for suspicious activity. 
                        Please review in the Fraud Management section.
                    </p>
                </div>
            )}

            {/* AI Token Usage */}
            {systemStats && (
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <Activity size={24} className="text-blue-400" />
                        AI Token Usage
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-2">Total AI Tokens</h3>
                            <p className="text-3xl font-bold font-mono">
                                {systemStats?.totalAiTokens?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                            <h3 className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-2">Monthly AI Tokens</h3>
                            <p className="text-3xl font-bold font-mono">
                                {systemStats?.monthlyAiTokens?.toLocaleString() || '0'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </PageWrapper>
    );
}