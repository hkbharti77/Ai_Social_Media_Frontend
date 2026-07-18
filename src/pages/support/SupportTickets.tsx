import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { getMyTicketsApi, createTicketApi } from '../../api/supportTicket.api';
import type { SupportTicketResponse, SupportTicketRequest } from '../../types/support-ticket.types';
import { SupportTicketPriority } from '../../types/support-ticket.types';
import { Button } from '../../components/ui/Button';
import { Plus, Ticket, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<SupportTicketPriority>(SupportTicketPriority.MEDIUM);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await getMyTicketsApi();
      setTickets(data);
    } catch (error) {
      toast.error('Failed to load tickets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error('Subject and description are required.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newTicket: SupportTicketRequest = {
        subject,
        description,
        priority
      };
      const created = await createTicketApi(newTicket);
      setTickets([created, ...tickets]);
      setIsModalOpen(false);
      setSubject('');
      setDescription('');
      setPriority(SupportTicketPriority.MEDIUM);
      toast.success('Support ticket created successfully!');
    } catch (error) {
      toast.error('Failed to create ticket.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/30 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3 italic">
              SUPPORT <span className="text-primary tracking-widest not-italic">TICKETS</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Need help? Create a ticket and our team will get back to you.</p>
          </div>
          
          <div className="relative z-10">
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl h-10 px-6 bg-primary text-white font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <Plus size={16} />
              New Ticket
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Tickets List */}
        <div className="bg-card/20 rounded-[2rem] border border-white/5 p-6 min-h-[400px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 opacity-60 min-h-[300px] space-y-4">
              <Ticket size={48} className="text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">No Support Tickets</h3>
                <p className="text-sm">You haven't created any support tickets yet.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{ticket.subject}</h3>
                        <p className="text-xs text-muted-foreground">
                          Created on {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border", getStatusColor(ticket.status))}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 p-4 rounded-xl text-sm text-foreground/80 whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground">Priority:</span>
                    <span className={getPriorityColor(ticket.priority)}>{ticket.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-background border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-card/50">
                <h2 className="text-xl font-black italic tracking-tighter">Create Support Ticket</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <form id="ticketForm" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subject</label>
                    <input 
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Brief summary of your issue"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-colors"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Priority</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as SupportTicketPriority)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-colors appearance-none"
                    >
                      <option value="LOW">Low - General inquiry</option>
                      <option value="MEDIUM">Medium - Issue needing attention</option>
                      <option value="HIGH">High - Significant problem</option>
                      <option value="CRITICAL">Critical - System down / Blocker</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                    <textarea 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Please provide details about the issue..."
                      className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-sm focus:border-primary outline-none transition-colors resize-none"
                      required
                    />
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-white/5 bg-card/50 flex justify-end gap-3">
                <Button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-transparent border border-white/10 hover:bg-white/5 text-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  form="ticketForm"
                  disabled={isSubmitting}
                  className="bg-primary text-white flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Submit Ticket
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default SupportTickets;
