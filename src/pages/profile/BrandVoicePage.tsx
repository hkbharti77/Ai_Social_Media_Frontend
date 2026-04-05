import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  Type, 
  CheckCircle2,
  AlertCircle,
  Zap,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile, updateProfile, generateStyleDna, type ProfileData } from '../../api/profile';
import { cn } from '../../lib/utils';

const BrandVoicePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDna, setIsGeneratingDna] = useState(false);
  const [newSample, setNewSample] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data.profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSample = () => {
    if (!newSample.trim() || !profile) return;
    const samples = profile.brandVoiceSamples || [];
    setProfile({
      ...profile,
      brandVoiceSamples: [...samples, newSample.trim()]
    });
    setNewSample('');
  };

  const handleRemoveSample = (index: number) => {
    if (!profile || !profile.brandVoiceSamples) return;
    const samples = [...profile.brandVoiceSamples];
    samples.splice(index, 1);
    setProfile({ ...profile, brandVoiceSamples: samples });
  };

  const handleSave = async (showStatus = true) => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await updateProfile(profile);
      if (showStatus) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateDna = async () => {
    if (!profile || (profile.brandVoiceSamples?.length || 0) < 3) {
      alert('Please add at least 3 samples to analyze your style.');
      return;
    }
    
    await handleSave(false);
    setIsGeneratingDna(true);
    try {
      const result = await generateStyleDna();
      setProfile({ ...profile, brandStyleDna: result.dna });
    } catch (error) {
      console.error('DNA Generation failed:', error);
    } finally {
      setIsGeneratingDna(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-blue-500/5 to-transparent border border-white/10 p-12">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/20 text-primary border border-primary/20 backdrop-blur-md">
              <Sparkles className="w-5 h-5 fill-primary/30" />
              <span className="text-sm font-black uppercase tracking-widest">Brand Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">
              AI Brand <span className="text-primary italic">Voice</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
              Train the AI on your unique writing style. Upload past posts so the AI can mimic your tone, vocabulary, and emoji usage.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                    <Type size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Writing Samples</h2>
                    <p className="text-sm text-muted-foreground font-medium">Add captions from your best-performing posts</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {profile?.brandVoiceSamples?.length || 0} / 10 Samples
                </span>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <textarea
                    value={newSample}
                    onChange={(e) => setNewSample(e.target.value)}
                    placeholder="Paste a caption here..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none font-medium"
                  />
                  <Button 
                    onClick={handleAddSample}
                    disabled={!newSample.trim()}
                    className="absolute bottom-4 right-4 h-12 px-6 rounded-xl shadow-xl shadow-primary/20"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Add Sample
                  </Button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {profile?.brandVoiceSamples?.map((sample, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative flex items-start gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.07] hover:border-white/10 transition-all"
                      >
                        <div className="flex-1 text-sm text-foreground/80 font-medium leading-relaxed italic">
                          "{sample}"
                        </div>
                        <button
                          onClick={() => handleRemoveSample(idx)}
                          className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl space-y-6">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500" /> Personalization Mode
              </h3>
              
              <div className="space-y-3">
                {[
                  { id: 'STYLE_DNA', label: 'Style DNA', price: '+2 Credits', desc: 'Uses your summarized persona' },
                  { id: 'FULL_CONTEXT', label: 'Full Context', price: '+5 Credits', desc: 'Analyzes raw posts & images' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setProfile({ ...profile!, defaultVoiceMode: mode.id as any })}
                    className={cn(
                      "w-full p-5 rounded-2xl border transition-all text-left group",
                      profile?.defaultVoiceMode === mode.id
                        ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                        : "bg-white/5 border-white/5 hover:border-white/20"
                    )}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-sm uppercase tracking-widest">{mode.label}</span>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        profile?.defaultVoiceMode === mode.id ? "bg-primary text-white border-primary" : "bg-white/5 border-white/10 text-muted-foreground"
                      )}>
                        {mode.price}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-blue-600/5 backdrop-blur-xl border border-primary/20 rounded-[2rem] p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" /> Analyzed Persona
                </h3>
                
                {profile?.brandStyleDna ? (
                  <div className="p-5 bg-white/10 rounded-2xl border border-white/10 text-sm font-medium leading-relaxed italic text-white/90">
                    {profile.brandStyleDna}
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-primary/20 rounded-2xl text-center space-y-4">
                    <p className="text-sm text-muted-foreground font-medium">No persona analyzed yet.</p>
                  </div>
                )}

                <Button
                  onClick={handleGenerateDna}
                  disabled={isGeneratingDna || (profile?.brandVoiceSamples?.length || 0) < 3}
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                >
                  {isGeneratingDna ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Analyze My Style <ChevronRight className="ml-2 w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </div>

            <div className="sticky bottom-8 z-30">
              <Button
                onClick={() => handleSave()}
                disabled={isSaving}
                className={cn(
                  "w-full h-16 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-2xl text-xs",
                  saveStatus === 'success' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-white text-black hover:bg-white/90"
                )}
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : saveStatus === 'success' ? (
                  <><CheckCircle2 className="mr-2 w-5 h-5" /> All Samples Saved</>
                ) : saveStatus === 'error' ? (
                  <><AlertCircle className="mr-2 w-5 h-5" /> Save Failed</>
                ) : (
                  <><Save className="mr-2 w-5 h-5" /> Save Brand Voice</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default BrandVoicePage;
