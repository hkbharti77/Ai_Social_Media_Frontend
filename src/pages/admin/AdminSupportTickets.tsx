import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { getAllTicketsApi, updateTicketStatusApi, replyToTicketApi } from '../../api/supportTicket.api';
import type { SupportTicketResponse } from '../../types/support-ticket.types';
import { SupportTicketStatus } from '../../types/support-ticket.types';
import { Loader2, CheckCircle2, MessageCircle, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  // Reply Modal State
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketResponse | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await getAllTicketsApi();
      setTickets(data);
    } catch {
      toast.error('Failed to load tickets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (id: number, status: SupportTicketStatus) => {
    setUpdatingId(id);
    try {
      const updated = await updateTicketStatusApi(id, status);
      setTickets(tickets.map(t => t.id === id ? updated : t));
      toast.success('Ticket status updated.');
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsSendingReply(true);
    try {
      await replyToTicketApi(selectedTicket.id, replyMessage);
      toast.success('Reply sent successfully!');
      setIsReplyModalOpen(false);
      setReplyMessage('');
    } catch {
      toast.error('Failed to send reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'IN_PROGRESS': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'RESOLVED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'CLOSED': return 'text-muted-foreground bg-white/5 border-white/10';
      default: return 'text-muted-foreground bg-white/5 border-white/10';
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'LOW': return 'text-emerald-400';
      case 'MEDIUM': return 'text-amber-400';
      case 'HIGH': return 'text-orange-500';
      case 'URGENT': return 'text-rose-500';
      case 'CRITICAL': return 'text-rose-500';
      default: return 'text-muted-foreground';
    }
  };

  const filteredTickets = filterStatus === 'ALL' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/30 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3 italic">
              SUPPORT <span className="text-primary tracking-widest not-italic">MANAGEMENT</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Manage and resolve user support tickets.</p>
          </div>
          
          <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
            <div className="flex bg-secondary/20 p-1 rounded-xl border border-white/5 flex-1 md:flex-none">
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                    filterStatus === s
                      ? "bg-background shadow-lg text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="bg-card/20 rounded-[2rem] border border-white/5 p-6 min-h-[500px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 opacity-60 min-h-[400px] space-y-4">
              <CheckCircle2 size={48} className="text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">All Caught Up!</h3>
                <p className="text-sm">No tickets found for the selected filter.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTickets.map(ticket => (
                <div key={ticket.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col h-full hover:border-white/10 transition-all">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg leading-tight mb-1">{ticket.subject}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Ticket #{ticket.id} • {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shrink-0", getStatusColor(ticket.status))}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-foreground/80 mb-1">User Details:</p>
                    <p className="text-xs text-muted-foreground">{ticket.userFullName || 'Unknown User'} ({ticket.userEmail})</p>
                  </div>
                  
                  <div className="bg-black/20 p-4 rounded-xl text-sm text-foreground/80 whitespace-pre-wrap flex-1 mb-4">
                    {ticket.description}
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground">Priority:</span>
                      <span className={getPriorityColor(ticket.priority)}>{ticket.priority}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setIsReplyModalOpen(true);
                        }}
                        className="h-8 px-3 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-lg flex items-center gap-2"
                      >
                        <MessageCircle size={14} />
                        Reply
                      </Button>
                      <select
                        disabled={updatingId === ticket.id}
                        value={ticket.status}
                        onChange={(e) => handleUpdateStatus(ticket.id, e.target.value as SupportTicketStatus)}
                        className="bg-secondary/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold uppercase outline-none focus:border-primary disabled:opacity-50"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                      {updatingId === ticket.id && <Loader2 size={14} className="animate-spin text-primary" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {isReplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-background border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-card/50">
                <div>
                  <h2 className="text-xl font-black italic tracking-tighter">Send Reply</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    To: {selectedTicket?.userEmail}
                  </p>
                </div>
                <button 
                  onClick={() => setIsReplyModalOpen(false)}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Original Ticket Subject</p>
                  <p className="text-sm font-bold">{selectedTicket?.subject}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Your Message</label>
                  <textarea 
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    placeholder="Type your response to the user here..."
                    className="w-full h-48 bg-black/20 border border-white/10 rounded-2xl p-4 text-sm focus:border-primary outline-none transition-colors resize-none"
                    autoFocus
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    The user will receive this reply via email and see it on their dashboard.
                  </p>
                </div>
              </div>
              
              <div className="p-6 border-t border-white/5 bg-card/50 flex justify-end gap-3">
                <Button 
                  type="button"
                  onClick={() => setIsReplyModalOpen(false)}
                  className="bg-transparent border border-white/10 hover:bg-white/5 text-foreground rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendReply}
                  disabled={isSendingReply || !replyMessage.trim()}
                  className="bg-primary text-white flex items-center gap-2 rounded-xl px-6"
                >
                  {isSendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Email Reply
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default AdminSupportTickets;
