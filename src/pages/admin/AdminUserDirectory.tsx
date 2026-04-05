import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    TrendingUp, 
    ChevronLeft, 
    ChevronRight, 
    Zap, 
    Activity, 
    ShieldAlert, 
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserDirectory, type UserIntelligence } from '../../api/admin';
import { useAuth } from '../../context/useAuth';

const AdminUserDirectory: React.FC = () => {
    const [users, setUsers] = useState<UserIntelligence[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchUsers = async (p: number, query: string) => {
        setLoading(true);
        try {
            const data = await getUserDirectory(query, p, 12);
            setUsers(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch user directory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.email === 'hkbharti77@gmail.com') {
            fetchUsers(page, searchTerm);
        }
    }, [page, searchTerm, user]);

    if (user?.email !== 'hkbharti77@gmail.com') {
        return (
            <div className="flex flex-col h-[80vh] items-center justify-center space-y-6">
                <ShieldAlert className="w-16 h-16 text-rose-500" />
                <div className="text-center">
                    <h2 className="text-2xl font-black">ACCESS DENIED</h2>
                    <p className="text-white/40 mt-2">Only the Primary Project Owner can access the Identity Directory.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 bg-[#030303] min-h-screen text-white/90">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white/40 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            USER INTELLIGENCE <span className="text-blue-500 text-sm font-mono bg-blue-500/10 px-3 py-1 rounded-full">{totalPages * 12}+ RECORDS</span>
                        </h1>
                        <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-bold">Global Identity Directory & Token Mapping</p>
                    </div>
                </div>
                
                <div className="relative group w-full md:w-[400px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(0);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-3xl pl-14 pr-6 py-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
                    />
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="h-[280px] bg-white/[0.02] border border-white/5 rounded-[2.5rem] animate-pulse" />
                    ))
                ) : (
                    <AnimatePresence mode='popLayout'>
                        {users.map((u, idx) => (
                            <motion.div 
                                key={u.userId}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: (idx % 12) * 0.05 }}
                                className="group bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all relative overflow-hidden"
                            >
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/5 blur-[50px] group-hover:bg-blue-600/10 transition-all" />
                                
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xl font-black shadow-xl shadow-blue-900/40">
                                        {u.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                                            <Zap className="w-3 h-3 fill-current" />
                                            <span className="text-xs font-black">{(u.totalTokens / 1000).toFixed(1)}k</span>
                                        </div>
                                        <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">{u.topModelId}</span>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-8">
                                    <h3 className="text-lg font-black truncate">{u.fullName}</h3>
                                    <p className="text-xs text-white/30 font-medium truncate">{u.email}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                                    <div>
                                        <p className="text-[9px] uppercase font-black text-white/20 tracking-tighter mb-1">Activity</p>
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3 h-3 text-green-400" />
                                            <span className="text-[10px] font-bold text-white/60">{u.loginCount} Logins</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-black text-white/20 tracking-tighter mb-1">Last Sync</p>
                                        <span className="text-[10px] font-bold text-white/40">{new Date(u.lastLoginAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate(`/admin/audit?email=${u.email}`)}
                                    className="absolute bottom-6 right-8 p-3 bg-white/5 rounded-2xl hover:bg-blue-600 hover:text-white transition-all text-white/20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                                >
                                    <TrendingUp className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-6 pt-12">
                <button 
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl disabled:opacity-20 hover:bg-white/10 transition-all group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-2 capitalize font-black text-sm tracking-widest">
                    <span className="text-blue-500">{page + 1}</span>
                    <span className="text-white/20">/</span>
                    <span className="text-white/40">{totalPages}</span>
                </div>
                <button 
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl disabled:opacity-20 hover:bg-white/10 transition-all group"
                >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default AdminUserDirectory;
