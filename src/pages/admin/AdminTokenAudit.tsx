import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, ExternalLink, Image as ImageIcon, MessageSquare, Clock, User, Cpu, Hash, ShieldAlert, Activity } from 'lucide-react';
import { getDetailedAiLogs, type DetailedAiLog } from '../../api/admin';
import { useAuth } from '../../context/useAuth';

const AdminTokenAudit: React.FC = () => {
    const [logs, setLogs] = useState<DetailedAiLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState<DetailedAiLog | null>(null);
    const { user } = useAuth();

    const fetchLogs = async (p: number) => {
        setLoading(true);
        try {
            const data = await getDetailedAiLogs(p, 15);
            setLogs(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch detailed logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.email === 'hkbharti77@gmail.com') {
            fetchLogs(page);
        }
    }, [page, user]);

    if (loading && !logs.length) return (
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
                    <p className="text-white/40 mt-2">Only the Primary Project Owner can access Audit logs.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 bg-[#030303] min-h-screen text-white/90">
             {/* Header */}
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">AI TOKEN AUDIT</h1>
                    <p className="text-white/40 text-sm mt-1 uppercase tracking-widest">Granular Usage & Prompt History</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search prompts or users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 w-[400px] outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-white/40">
                            <th className="px-6 py-5">Timestamp</th>
                            <th className="px-6 py-5">Identities</th>
                            <th className="px-6 py-5">Model & Operation</th>
                            <th className="px-6 py-5">Prompt Context</th>
                            <th className="px-6 py-5 text-right">Consumption</th>
                            <th className="px-6 py-5 text-center">Audit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                        <AnimatePresence mode='popLayout'>
                        {logs.map((log) => (
                            <motion.tr 
                                key={log.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="group hover:bg-white/[0.03] transition-all"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-3.5 h-3.5 text-white/20" />
                                        <span className="text-xs font-mono text-white/60">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="text-[10px] text-white/20 ml-6">{new Date(log.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-white/40 border border-white/5">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">{log.user?.fullName || 'Root System'}</p>
                                            <p className="text-[10px] text-white/30">{log.user?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <Cpu className="w-3 h-3 text-purple-400" />
                                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter bg-purple-400/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                                {log.modelId}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono text-white/40 ml-5">{log.actionType}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="max-w-[300px] truncate">
                                        <p className="text-xs text-white/60 italic">
                                            {log.promptText || 'System generated parameters'}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-black text-blue-400">{log.totalTokens}</span>
                                        <span className="text-[9px] text-white/20 uppercase">Units</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-3">
                                        <button 
                                            onClick={() => setSelectedLog(log)}
                                            className="p-2 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-all"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {log.resultUrl && (
                                            <a 
                                                href={log.resultUrl} 
                                                target="_blank" 
                                                className="p-2 hover:bg-white/5 rounded-lg text-blue-400 transition-all"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                        </AnimatePresence>
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="px-8 py-6 flex justify-between items-center bg-white/5 border-t border-white/5">
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                        Page {page + 1} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 disabled:opacity-30 transition-all"
                        >
                            Previous
                        </button>
                        <button 
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                            className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 disabled:opacity-30 transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Detailed Modal Overlay */}
            <AnimatePresence>
                {selectedLog && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
                        onClick={() => setSelectedLog(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] w-full max-w-2xl p-12 relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 blur-[120px]" />
                            
                            <h3 className="text-3xl font-black mb-10">AUDIT DETAIL</h3>
                            
                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <section>
                                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Hash className="w-3 h-3" /> Artifact ID
                                    </h4>
                                    <p className="font-mono text-xs">{selectedLog.id}</p>
                                </section>
                                <section>
                                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Timestamp
                                    </h4>
                                    <p className="text-xs">{selectedLog.createdAt}</p>
                                </section>
                            </div>

                            <section className="mb-10">
                                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" /> Prompt Intent
                                </h4>
                                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-sm text-white/70 leading-relaxed font-serif">
                                    {selectedLog.promptText || 'Internal model configuration'}
                                </div>
                            </section>

                            <div className="flex justify-end gap-4">
                                <button 
                                    onClick={() => setSelectedLog(null)}
                                    className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all"
                                >
                                    Dismiss
                                </button>
                                {selectedLog.resultUrl && (
                                    <a 
                                        href={selectedLog.resultUrl} 
                                        target="_blank"
                                        className="px-8 py-3 bg-blue-600 rounded-2xl text-xs font-black shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Visual Result
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminTokenAudit;
