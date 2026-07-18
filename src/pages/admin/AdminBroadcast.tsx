import { useState, useEffect } from 'react';
import { broadcastEmail, getUserSummaries, type BroadcastEmailRequest } from '../../api/admin';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Mail, Send, Users, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminBroadcast() {
    const [subject, setSubject] = useState('');
    const [htmlBody, setHtmlBody] = useState('');
    const [targetTier, setTargetTier] = useState('ALL');
    const [targetEmail, setTargetEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userSummaries, setUserSummaries] = useState<{ userId: number; email: string }[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                const data = await getUserSummaries();
                setUserSummaries(data);
            } catch (error) {
                console.error('Failed to fetch user summaries:', error);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    const handleSendEmail = async () => {
        if (!subject.trim()) {
            toast.error('Please enter email subject');
            return;
        }
        if (!htmlBody.trim()) {
            toast.error('Please enter email body');
            return;
        }

        // Show confirmation modal instead of browser confirm
        setShowConfirmModal(true);
    };

    const confirmSendEmail = async () => {
        setSending(true);
        setShowConfirmModal(false);
        
        try {
            const request: BroadcastEmailRequest = {
                subject,
                htmlBody,
                targetTier,
                targetEmail: targetTier === 'SPECIFIC' ? targetEmail : undefined
            };
            const response = await broadcastEmail(request);
            toast.success(`Email sent successfully to ${response.recipientCount} users!`);
            
            // Reset form
            setSubject('');
            setHtmlBody('');
            setTargetTier('ALL');
            setTargetEmail('');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const emailTemplates = [
        {
            name: 'Welcome Email',
            subject: 'Welcome to VaniAI - Your AI Social Media Assistant',
            body: `<h1>Welcome to VaniAI!</h1>
<p>We're excited to have you on board. VaniAI is your intelligent social media automation platform.</p>
<h2>Getting Started:</h2>
<ul>
<li>Connect your social media accounts</li>
<li>Generate AI-powered content</li>
<li>Schedule posts across platforms</li>
</ul>
<p>If you have any questions, feel free to reach out to our support team.</p>
<p>Best regards,<br>The VaniAI Team</p>`
        },
        {
            name: 'Feature Announcement',
            subject: 'New Feature: AI Video Generation Now Available!',
            body: `<h1>Exciting News!</h1>
<p>We've just launched a powerful new feature: <strong>AI Video Generation</strong></p>
<h2>What's New:</h2>
<ul>
<li>Generate professional videos from text prompts</li>
<li>Multiple aspect ratios supported</li>
<li>High-quality output powered by Google Veo</li>
</ul>
<p>Try it now from your dashboard!</p>
<p>Happy creating,<br>The VaniAI Team</p>`
        },
        {
            name: 'Subscription Reminder',
            subject: 'Your Subscription is Expiring Soon',
            body: `<h1>Subscription Reminder</h1>
<p>Your VaniAI subscription will expire in 3 days.</p>
<p>Renew now to continue enjoying:</p>
<ul>
<li>Unlimited AI content generation</li>
<li>Multi-platform scheduling</li>
<li>Advanced analytics</li>
<li>Priority support</li>
</ul>
<p><a href="https://yourapp.com/pricing" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Renew Subscription</a></p>
<p>Thank you for being a valued member!</p>`
        }
    ];

    const loadTemplate = (template: typeof emailTemplates[0]) => {
        setSubject(template.subject);
        setHtmlBody(template.body);
    };

    return (
        <PageWrapper>
            <div className="p-8 space-y-10 min-h-screen max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter flex items-center gap-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                            <Mail className="text-blue-400" size={48} />
                            BROADCAST
                        </h1>
                        <p className="text-white/30 text-sm mt-2 uppercase tracking-[0.3em] font-bold">
                            Strategic Communication Engine
                        </p>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <Users className="text-blue-400/50" size={20} />
                        <span className="text-sm font-bold text-white/40">{userSummaries.length} TOTAL USERS</span>
                    </div>
                </div>

                {/* Warning Banner */}
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertCircle size={80} className="text-amber-500" />
                    </div>
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                            <AlertCircle className="text-amber-400" size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-amber-400 mb-2 text-xl uppercase tracking-tighter">
                                Safety Protocol
                            </h3>
                            <p className="text-amber-300/60 leading-relaxed max-w-2xl">
                                Broadcast emails are dispatched via our asynchronous queue. Verify your content meticulously; 
                                once the broadcast begins, it cannot be recalled or edited.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Email Templates */}
                <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Sparkles className="text-blue-400" size={24} />
                            Quick Templates
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {emailTemplates.map((template) => (
                            <button
                                key={template.name}
                                onClick={() => loadTemplate(template)}
                                className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:border-blue-500/30 hover:bg-white/[0.05] transition-all text-left group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
                                <h3 className="font-bold text-xl mb-3 group-hover:text-blue-400 transition-colors relative z-10">
                                    {template.name}
                                </h3>
                                <p className="text-sm text-white/30 line-clamp-2 leading-relaxed relative z-10">
                                    {template.subject}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Email Form */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8">
                    <div className="space-y-6">
                        {/* Target Audience */}
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest text-white/40 mb-3">
                                <Users className="inline mr-2" size={16} />
                                Target Audience
                            </label>
                            <select
                                value={targetTier}
                                onChange={(e) => setTargetTier(e.target.value)}
                                style={{ colorScheme: 'dark' }}
                                className="w-full px-6 py-4 border border-white/10 rounded-3xl bg-[#0f172a] text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium outline-none cursor-pointer hover:bg-[#1e293b]"
                            >
                                <option value="ALL" className="bg-[#0f172a] text-white">All Users</option>
                                <option value="FREE" className="bg-[#0f172a] text-white">FREE Tier Users</option>
                                <option value="BASIC" className="bg-[#0f172a] text-white">BASIC Tier Users</option>
                                <option value="PRO" className="bg-[#0f172a] text-white">PRO Tier Users</option>
                                <option value="ENTERPRISE" className="bg-[#0f172a] text-white">ENTERPRISE Tier Users</option>
                                <option value="SPECIFIC" className="bg-[#0f172a] text-white">Specific User</option>
                            </select>
                        </div>

                        {/* Specific User Email Dropdown */}
                        {targetTier === 'SPECIFIC' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-black uppercase tracking-widest text-white/40 mb-3">
                                    Select User Email *
                                </label>
                                <select
                                    value={targetEmail}
                                    onChange={(e) => setTargetEmail(e.target.value)}
                                    style={{ colorScheme: 'dark' }}
                                    className="w-full px-6 py-4 border border-white/10 rounded-3xl bg-[#0f172a] text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium outline-none cursor-pointer hover:bg-[#1e293b]"
                                >
                                    <option value="" className="bg-[#0f172a] text-white">-- Choose a user email --</option>
                                    {userSummaries.map((user) => (
                                        <option key={user.userId} value={user.email} className="bg-[#0f172a] text-white">
                                            {user.email}
                                        </option>
                                    ))}
                                </select>
                                {loadingUsers && (
                                    <p className="mt-2 text-xs text-blue-400 animate-pulse">Loading users...</p>
                                )}
                            </div>
                        )}

                        {/* Subject */}
                        <div className="space-y-3">
                            <label className="block text-xs font-black uppercase tracking-[0.2em] text-white/30 px-1">
                                Email Subject *
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter a compelling subject..."
                                className="w-full px-8 py-5 border border-white/5 rounded-[2rem] bg-[#0f172a] focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all font-bold text-lg text-white placeholder:text-white/10 outline-none"
                            />
                        </div>

                        {/* HTML Body */}
                        <div className="space-y-3">
                            <label className="block text-xs font-black uppercase tracking-[0.2em] text-white/30 px-1">
                                Email Body (HTML Structure) *
                            </label>
                            <textarea
                                value={htmlBody}
                                onChange={(e) => setHtmlBody(e.target.value)}
                                placeholder="<html>...</html>"
                                rows={12}
                                className="w-full px-8 py-6 border border-white/5 rounded-[2rem] bg-[#0f172a] focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all font-mono text-sm text-blue-100/80 placeholder:text-white/10 outline-none resize-none"
                            />
                            <div className="flex items-center gap-2 text-xs text-white/20 px-1 italic">
                                <AlertCircle size={12} />
                                <span>Thymeleaf fragments and standard HTML5 are supported for responsive design.</span>
                            </div>
                        </div>

                        {/* Preview */}
                        {htmlBody && (
                            <div className="space-y-4 pt-4">
                                <label className="block text-xs font-black uppercase tracking-[0.2em] text-white/30 px-1">
                                    Visual Preview
                                </label>
                                <div 
                                    className="p-10 border border-white/5 rounded-[2.5rem] bg-white/[0.01] overflow-auto max-h-[500px] shadow-inner"
                                    dangerouslySetInnerHTML={{ __html: htmlBody }}
                                />
                            </div>
                        )}

                        {/* Send Button */}
                        <div className="flex flex-col md:flex-row justify-end gap-4 pt-10 border-t border-white/5">
                            <button
                                onClick={() => {
                                    setSubject('');
                                    setHtmlBody('');
                                    setTargetTier('ALL');
                                    setTargetEmail('');
                                }}
                                className="px-10 py-5 border border-white/10 rounded-full hover:bg-white/[0.05] transition-all font-bold text-white/60 hover:text-white"
                            >
                                Reset Form
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={sending || !subject.trim() || !htmlBody.trim()}
                                className="px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-500 hover:to-indigo-500 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-4 font-black shadow-2xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {sending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>INITIATING BROADCAST...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>EXECUTE BROADCAST</span>
                                        <Send size={22} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Confirm Modal */}
                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={confirmSendEmail}
                    title="Confirm Broadcast Email"
                    message={`Are you sure you want to send this email to ${
                        targetTier === 'SPECIFIC' ? targetEmail : 
                        targetTier === 'ALL' ? 'ALL users' : 
                        targetTier + ' tier users'
                    }? This action cannot be undone.`}
                    variant="warning"
                    confirmText="Send Email"
                    cancelText="Cancel"
                />
            </div>
        </PageWrapper>
    );
}