import { useState } from 'react';
import { broadcastEmail, type BroadcastEmailRequest } from '../../api/admin';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Mail, Send, Users, AlertCircle } from 'lucide-react';

export default function AdminBroadcast() {
    const [subject, setSubject] = useState('');
    const [htmlBody, setHtmlBody] = useState('');
    const [targetTier, setTargetTier] = useState('ALL');
    const [sending, setSending] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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
                targetTier
            };
            const response = await broadcastEmail(request);
            toast.success(`Email sent successfully to ${response.recipientCount} users!`);
            
            // Reset form
            setSubject('');
            setHtmlBody('');
            setTargetTier('ALL');
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
            <div className="p-8 space-y-8 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <Mail className="text-blue-400" size={36} />
                        BROADCAST EMAIL
                    </h1>
                    <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-bold">
                        Send emails to all users or specific subscription tiers
                    </p>
                </div>

                {/* Warning Banner */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-[2.5rem] p-6 mb-6">
                    <div className="flex items-start gap-4">
                        <AlertCircle className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="font-black text-yellow-400 mb-2 text-lg uppercase tracking-tight">
                                Important Notice
                            </h3>
                            <p className="text-sm text-yellow-300/80">
                                Broadcast emails are sent asynchronously. Please ensure your email content is correct before sending. 
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Email Templates */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 mb-6">
                    <h2 className="text-xl font-bold mb-6 uppercase tracking-tight">
                        Quick Templates
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {emailTemplates.map((template) => (
                            <button
                                key={template.name}
                                onClick={() => loadTemplate(template)}
                                className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl hover:border-blue-500/50 hover:bg-white/[0.06] transition-all text-left group"
                            >
                                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                                    {template.name}
                                </h3>
                                <p className="text-sm text-white/40 line-clamp-2">
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
                                className="w-full px-6 py-4 border border-white/10 rounded-3xl bg-white/[0.03] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                            >
                                <option value="ALL">All Users</option>
                                <option value="FREE">FREE Tier Users</option>
                                <option value="BASIC">BASIC Tier Users</option>
                                <option value="PRO">PRO Tier Users</option>
                                <option value="ENTERPRISE">ENTERPRISE Tier Users</option>
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest text-white/40 mb-3">
                                Email Subject *
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter email subject..."
                                className="w-full px-6 py-4 border border-white/10 rounded-3xl bg-white/[0.03] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium placeholder:text-white/20"
                            />
                        </div>

                        {/* HTML Body */}
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest text-white/40 mb-3">
                                Email Body (HTML) *
                            </label>
                            <textarea
                                value={htmlBody}
                                onChange={(e) => setHtmlBody(e.target.value)}
                                placeholder="Enter email body in HTML format..."
                                rows={15}
                                className="w-full px-6 py-4 border border-white/10 rounded-3xl bg-white/[0.03] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono text-sm placeholder:text-white/20"
                            />
                            <p className="mt-3 text-sm text-white/40">
                                You can use HTML tags for formatting. Preview the email before sending.
                            </p>
                        </div>

                        {/* Preview */}
                        {htmlBody && (
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-white/40 mb-3">
                                    Preview
                                </label>
                                <div 
                                    className="p-8 border border-white/10 rounded-3xl bg-white/[0.03] overflow-auto max-h-96"
                                    dangerouslySetInnerHTML={{ __html: htmlBody }}
                                />
                            </div>
                        )}

                        {/* Send Button */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                onClick={() => {
                                    setSubject('');
                                    setHtmlBody('');
                                    setTargetTier('ALL');
                                }}
                                className="px-8 py-4 border border-white/10 rounded-3xl hover:bg-white/[0.05] transition-all font-bold"
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={sending || !subject.trim() || !htmlBody.trim()}
                                className="px-8 py-4 bg-blue-600 rounded-3xl hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3 font-black shadow-lg shadow-blue-500/20 transition-all"
                            >
                                {sending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Send Email
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
                    message={`Are you sure you want to send this email to ${targetTier === 'ALL' ? 'ALL users' : targetTier + ' tier users'}? This action cannot be undone.`}
                    variant="warning"
                    confirmText="Send Email"
                    cancelText="Cancel"
                />
            </div>
        </PageWrapper>
    );
}