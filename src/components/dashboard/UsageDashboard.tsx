import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Activity, Info, BarChart3, Database } from 'lucide-react';
import { getAiUsageSummary, type AiUsageSummary } from '../../api/usage';

const AiUsageDashboard: React.FC = () => {
    const [summary, setSummary] = useState<AiUsageSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await getAiUsageSummary();
                setSummary(data);
            } catch (error) {
                console.error("Failed to fetch AI usage summary:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    const totalTokens = summary.reduce((acc, curr) => acc + curr.totalTokens, 0);
    const totalPrompt = summary.reduce((acc, curr) => acc + curr.promptTokens, 0);

    const getModelColor = (modelId: string) => {
        if (modelId.includes('pro')) return 'text-purple-400 bg-purple-400/10 border-purple-500/20';
        if (modelId.includes('flash')) return 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20';
        if (modelId.includes('imagen')) return 'text-orange-400 bg-orange-400/10 border-orange-500/20';
        return 'text-blue-400 bg-blue-400/10 border-blue-500/20';
    };

    if (loading) {
        return (
            <div className="animate-pulse bg-white/5 border border-white/10 rounded-2xl p-6 h-64 flex items-center justify-center">
                <div className="text-white/40 flex flex-col items-center gap-2">
                    <Activity className="w-8 h-8 animate-spin" />
                    <span>Loading usage data...</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden relative"
        >
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-[80px]" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 blur-[80px]" />

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400">
                        <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">AI Model Intelligence</h3>
                        <p className="text-sm text-white/50">Token consumption & model stats</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-white/70 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    Real-time
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Tokens</p>
                    <h4 className="text-2xl font-bold text-white font-mono">{(totalTokens / 1000).toFixed(1)}k</h4>
                    <div className="mt-4 flex items-center gap-2">
                         <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500" style={{ width: '70% '}} />
                         </div>
                    </div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Prompt Weight</p>
                    <h4 className="text-2xl font-bold text-white font-mono">{((totalPrompt / (totalTokens || 1)) * 100).toFixed(0)}%</h4>
                    <div className="mt-4 flex items-center gap-2">
                         <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-purple-500" style={{ width: `${(totalPrompt / (totalTokens || 1)) * 100}%` }} />
                         </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Efficiency Score</p>
                    <h4 className="text-2xl font-bold text-white font-mono">94</h4>
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400">
                        <Activity className="w-3 h-3" />
                         Optimal Performance
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h5 className="text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Usage by Model
                </h5>
                <AnimatePresence>
                    {summary.map((item, index) => (
                        <motion.div 
                            key={item.modelId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 border border-white/5 rounded-xl p-4 group hover:border-white/10 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-md border ${getModelColor(item.modelId)}`}>
                                        <Database className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                                        {item.modelId.replace(/-/g, ' ').toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-xs text-white/40 font-mono">
                                    {(item.totalTokens / 1000).toFixed(1)}k tokens
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-white/30 uppercase">
                                    <span>Input: {item.promptTokens}</span>
                                    <span>Output: {item.completionTokens}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                                    <div 
                                        className="h-full bg-blue-500/80 hover:bg-blue-400 transition-colors" 
                                        style={{ width: `${(item.promptTokens / (item.totalTokens || 1)) * 100}%` }} 
                                    />
                                    <div 
                                        className="h-full bg-purple-500/80 hover:bg-purple-400 transition-colors" 
                                        style={{ width: `${(item.completionTokens / (item.totalTokens || 1)) * 100}%` }} 
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-start gap-3">
                <Info className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/30 leading-relaxed">
                    Tokens are calculated based on the actual context window used by the AI model. 
                    Image generation models are tracked by API request volume.
                </p>
            </div>
        </motion.div>
    );
};

export default AiUsageDashboard;
