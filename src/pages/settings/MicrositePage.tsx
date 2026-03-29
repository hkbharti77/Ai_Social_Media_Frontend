import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Eye, 
  Settings, 
  Sparkles,
  Smartphone,
  MousePointer2,
  PieChart,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { getMicrositeLinksApi, createMicrositeLinkApi, deleteMicrositeLinkApi, type MicrositeLink } from '../../api/microsite';
import { getProfile } from '../../api/profile';

const MicrositePage: React.FC = () => {
  const [links, setLinks] = useState<MicrositeLink[]>([]);
  const [brandSlug, setBrandSlug] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '', icon: 'Link' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resp = await getProfile();
      const slug = resp.profile.brandSlug || 'my-brand';
      setBrandSlug(slug);
      if (resp.profile.brandSlug) {
        const data = await getMicrositeLinksApi(resp.profile.brandSlug);
        setLinks(data);
      }
    } catch (e) {
      toast.error("Failed to load microsite data.");
    }
  };

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) return;
    try {
      const added = await createMicrositeLinkApi({ ...newLink, orderIndex: links.length });
      setLinks([...links, added]);
      setNewLink({ title: '', url: '', icon: 'Link' });
      setIsAdding(false);
      toast.success("Link added to Microsite!");
    } catch (e) {
      toast.error("Failed to add link.");
    }
  };

  const handleDeleteLink = async (id: number) => {
    try {
      await deleteMicrositeLinkApi(id);
      setLinks(links.filter(l => l.id !== id));
      toast.error("Link removed.");
    } catch (e) {
      toast.error("Failed to delete link.");
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-10 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground uppercase italic px-1">Link Engine</h1>
            <p className="text-muted-foreground text-base md:text-lg font-medium opacity-80 max-w-xl px-1">Your premium Link-in-Bio microsite controller.</p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => window.open(`http://localhost:8080/m/${brandSlug}`, '_blank')}
              className="rounded-2xl border-white/10 hover:bg-white/5 h-14 px-8 font-black uppercase text-[10px] tracking-widest gap-2"
            >
              <Eye size={16} />
              Preview Live
            </Button>
            <Button 
               className="rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20"
               onClick={() => setIsAdding(true)}
            >
              <Plus size={16} />
              Add Strategy Link
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Link Editor */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-6 px-4">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                 <Settings size={28} />
              </div>
              <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
              <h3 className="font-black text-xl uppercase tracking-[0.2em] text-muted-foreground shrink-0 italic italic">Manager</h3>
            </div>

            <AnimatePresence>
              {isAdding && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card/60 backdrop-blur-xl border-2 border-primary/30 p-8 rounded-[2.5rem] space-y-6 shadow-2xl overflow-hidden"
                >
                  <h4 className="text-xl font-black tracking-tighter uppercase italic text-primary">New Link Capsule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title</label>
                      <input 
                        className="w-full bg-secondary/30 border-2 border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:border-primary/50 outline-none"
                        placeholder="e.g. Visit our Shop"
                        value={newLink.title}
                        onChange={e => setNewLink({...newLink, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL</label>
                      <input 
                        className="w-full bg-secondary/30 border-2 border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:border-primary/50 outline-none"
                        placeholder="https://..."
                        value={newLink.url}
                        onChange={e => setNewLink({...newLink, url: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={handleAddLink} className="flex-1 h-14 rounded-xl font-black uppercase tracking-widest text-[10px]">Deploy Link</Button>
                    <Button variant="ghost" onClick={() => setIsAdding(false)} className="px-10 h-14 rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              {links.map((link) => (
                <motion.div 
                  key={link.id}
                  layout
                  className="bg-card/40 backdrop-blur-xl border-2 border-white/5 p-8 rounded-[2.5rem] flex items-center gap-8 group hover:border-primary/20 transition-all shadow-xl"
                >
                  <div className="p-4 bg-secondary/30 rounded-2xl text-muted-foreground group-hover:text-primary transition-colors cursor-grab">
                    <GripVertical size={24} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xl font-black tracking-tight">{link.title}</h4>
                    <p className="text-xs text-muted-foreground font-medium truncate max-w-xs">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Clicks</p>
                      <p className="text-xl font-black tracking-tighter">{link.clickCount || 0}</p>
                    </div>
                    <Button 
                       size="icon" variant="ghost" 
                       onClick={() => handleDeleteLink(link.id!)}
                       className="rounded-2xl h-12 w-12 text-rose-500 hover:bg-rose-500/10 hover:scale-110 active:scale-95 transition-all"
                    >
                      <Trash2 size={20} />
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              {links.length === 0 && !isAdding && (
                <div className="py-20 text-center border-4 border-dashed border-white/5 rounded-[4rem] bg-secondary/5 space-y-6">
                  <Smartphone size={64} className="mx-auto text-muted-foreground/20" />
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Your Link-in-Bio is currently empty.</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel - Premium Phone Mockup */}
          <div className="lg:col-span-5 relative">
             <div className="sticky top-10 flex flex-col items-center">
                <div className="w-[320px] h-[640px] bg-black rounded-[4rem] p-4 border-8 border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-b-3xl z-40" />
                   
                   <div className="flex-1 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-black p-8 flex flex-col pt-16">
                      <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-6 shadow-2xl border-4 border-white/10 flex items-center justify-center font-black text-3xl">
                        {brandSlug.substring(0, 1).toUpperCase()}
                      </div>
                      <h4 className="text-center font-black text-xl tracking-tight mb-2">@{brandSlug}</h4>
                      <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-10">Official Microsite</p>

                      <div className="space-y-4">
                        {links.map(link => (
                          <div key={link.id} className="w-full h-14 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-xs font-black uppercase tracking-widest text-white/90 shadow-xl">
                            {link.title}
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto items-center justify-center flex gap-4 text-white/40">
                         <Sparkles size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Powered by VaniAI</span>
                      </div>
                   </div>
                </div>
                
                <div className="mt-10 flex items-center gap-10">
                   <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                         <MousePointer2 size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Interactive</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
                         <Globe size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Premium Domain</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                         <PieChart size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Analytics Real-time</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default MicrositePage;
