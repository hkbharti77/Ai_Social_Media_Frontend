import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { 
  Building2, 
  Target, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
  Palette,
  Layers,
  Camera,
  Sun,
  Maximize,
  Type,
  Image as ImageIcon,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile, updateProfile, getSuggestedTimes, type ProfileData } from '../../api/profile';

const BusinessProfilePage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    businessName: '',
    brandSlug: '',
    niche: '',
    targetAudience: '',
    brandTone: '',
    postingFrequency: 5,
    preferredHashtags: '',
    imageStyle: 'cinematic',
    peoplePreference: 'PROFESSIONALS',
    brandColors: ['#0A1F44', '#FFFFFF'],
    brandMood: 'modern, clean, high-tech',
    designStyle: 'minimal',
    visualConstraints: 'no clutter, high contrast, sharp lighting',
    imageType: 'social_post',
    compositionStyle: 'centered subject with negative space',
    cameraAngle: 'eye-level',
    lightingStyle: 'studio lighting',
    colorTemperature: 'cool',
    backgroundStyle: 'gradient minimal background',
    subjectFocus: 'product-focused',
    textOverlay: {
      enabled: true,
      style: 'bold modern typography',
      position: 'top-left'
    },
    logoPlacement: 'bottom-right',
    aspectRatio: '1:1',
    qualityLevel: 'high',
    creativityLevel: 0.7,
    negativePrompt: 'blurry, low quality, distorted faces',
    morningDraftTime: '06:00',
    eveningDraftTime: '15:00',
    morningPublishTime: '09:00',
    eveningPublishTime: '20:00',
    useAiBestTime: false
  });
  
  const totalSteps = 6;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const resp = await getProfile();
        if (resp && resp.profile) {
          const p = resp.profile;
          setFormData(prev => ({
            ...prev,
            ...p,
            businessName: p.businessName || '',
            brandSlug: p.brandSlug || '',
            niche: p.niche || '',
            targetAudience: p.targetAudience || '',
            brandTone: p.brandTone || '',
            postingFrequency: p.postingFrequency || 5,
            preferredHashtags: p.preferredHashtags || '',
            imageStyle: p.imageStyle || 'cinematic',
            peoplePreference: p.peoplePreference || 'PROFESSIONALS',
            brandColors: p.brandColors || ['#0A1F44', '#FFFFFF'],
            brandMood: p.brandMood || 'modern, clean, high-tech',
            designStyle: p.designStyle || 'minimal',
            visualConstraints: p.visualConstraints || 'no clutter, high contrast, sharp lighting',
            imageType: p.imageType || 'social_post',
            compositionStyle: p.compositionStyle || 'centered subject with negative space',
            cameraAngle: p.cameraAngle || 'eye-level',
            lightingStyle: p.lightingStyle || 'studio lighting',
            colorTemperature: p.colorTemperature || 'cool',
            backgroundStyle: p.backgroundStyle || 'gradient minimal background',
            subjectFocus: p.subjectFocus || 'product-focused',
            textOverlay: p.textOverlay || { enabled: true, style: 'bold modern typography', position: 'top-left' },
            logoPlacement: p.logoPlacement || 'bottom-right',
            aspectRatio: p.aspectRatio || '1:1',
            qualityLevel: p.qualityLevel || 'high',
            creativityLevel: p.creativityLevel || 0.7,
            negativePrompt: p.negativePrompt || 'blurry, low quality, distorted faces',
            morningDraftTime: p.morningDraftTime || '06:00',
            eveningDraftTime: p.eveningDraftTime || '15:00',
            morningPublishTime: p.morningPublishTime || '09:00',
            eveningPublishTime: p.eveningPublishTime || '20:00',
            useAiBestTime: p.useAiBestTime || false
          }));
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field: keyof ProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAudience = (opt: string) => {
    const current = formData.targetAudience.split(', ').filter(Boolean);
    const updated = current.includes(opt) 
      ? current.filter(a => a !== opt) 
      : [...current, opt];
    handleChange('targetAudience', updated.join(', '));
  };

  const nextStep = async () => {
    if (step === totalSteps) {
      setIsSaving(true);
      try {
        await updateProfile(formData);
        setIsFinished(true);
      } catch (error) {
        console.error("Failed to save profile", error);
        alert("Failed to save profile. Please try again.");
      } finally {
        setIsSaving(false);
      }
    } else {
      setStep(s => s + 1);
    }
  };
  
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </PageWrapper>
    );
  }

  if (isFinished) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 size={64} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight">Setup Complete!</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your business profile is saved. Our AI now understands your brand voice and target audience perfectly.
            </p>
          </div>
          <div className="pt-8">
            <Button size="lg" className="px-12 h-14 text-xl font-bold gap-3 shadow-2xl shadow-primary/20" onClick={() => window.location.href = '/generate'}>
              Start Generating Content
              <ArrowRight size={20} />
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const selectedAudience = formData.targetAudience.split(', ').filter(Boolean);

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Business Profile Setup</h1>
          <p className="text-xl text-muted-foreground leading-relaxed italic">
            "Your brand's DNA, powered by AI."
          </p>
        </header>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500 text-xs",
                step === s ? "bg-primary text-primary-foreground scale-125 shadow-xl shadow-primary/20" : 
                step > s ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"
              )}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < totalSteps && (
                <div className={cn(
                  "w-8 md:w-12 h-1 bg-secondary mx-1 md:mx-2 rounded-full overflow-hidden",
                )}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: step > s ? '100%' : '0%' }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-card border-2 border-border p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles size={120} className="text-primary" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                      <Building2 size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black">Business Details</h3>
                      <p className="text-muted-foreground">The foundation of your presence.</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Business Name</label>
                        <input 
                          value={formData.businessName}
                          onChange={(e) => handleChange('businessName', e.target.value)}
                          placeholder="e.g. Acme Corp"
                          className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Brand URL Slug</label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-mono text-sm group-focus-within:text-primary/40">vaniai.com/m/</span>
                          <input 
                            value={formData.brandSlug}
                            onChange={(e) => handleChange('brandSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="my-brand"
                            className="w-full px-5 py-4 pl-[110px] bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg font-medium font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Niche / Value Proposition</label>
                      <textarea 
                        value={formData.niche}
                        onChange={(e) => handleChange('niche', e.target.value)}
                        placeholder="e.g. AI Automation & Social Media Marketing. We help busy professionals get fit in 20 mins a day..."
                        className="w-full h-32 px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all resize-none text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Preferred Hashtags</label>
                      <input 
                        value={formData.preferredHashtags}
                        onChange={(e) => handleChange('preferredHashtags', e.target.value)}
                        placeholder="e.g. #AI #Automation #DigitalMarketing"
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                      <Target size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black">Target Audience</h3>
                      <p className="text-muted-foreground">Who are we talking to?</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Select Demographics</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Small business owners', 'Startups', 'Digital creators', 'Gen Z (18-24)', 'Millennials (25-40)', 'Professional (40+)', 'Athletes'].map((opt) => (
                          <button 
                            key={opt} 
                            onClick={() => toggleAudience(opt)}
                            className={cn(
                              "px-6 py-4 border-2 rounded-2xl text-left font-bold transition-all",
                              selectedAudience.includes(opt) 
                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                                : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/50"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground px-1 pt-2">
                        Currently tracking: <span className="font-semibold text-foreground">{formData.targetAudience || 'None selected'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                      <MessageSquare size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black">Brand Voice & Frequency</h3>
                      <p className="text-muted-foreground">How should VaniAI speak and post?</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Preferred Tone</label>
                      <div className="flex flex-wrap gap-3">
                        {['Professional, innovative, and engaging', 'Witty', 'Empathetic', 'Minimalist', 'High Energy', 'Serious'].map((tone) => (
                          <button 
                            key={tone} 
                            onClick={() => handleChange('brandTone', tone)}
                            className={cn(
                              "px-8 py-3 rounded-full font-bold transition-all border-2",
                              formData.brandTone === tone 
                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                          >
                            {tone.length > 20 ? tone.substring(0, 17) + '...' : tone}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground px-1">Selected: <span className="font-semibold text-foreground">{formData.brandTone || 'None'}</span></p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Weekly Posting Frequency</label>
                      <input 
                        type="number"
                        min="1"
                        max="50"
                        value={formData.postingFrequency}
                        onChange={(e) => handleChange('postingFrequency', parseInt(e.target.value) || 0)}
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg font-black tracking-tight"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Preferred Hashtags</label>
                      <input 
                        value={formData.preferredHashtags}
                        onChange={(e) => handleChange('preferredHashtags', e.target.value)}
                        placeholder="e.g. #AI #Automation #Marketing"
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                      <Palette size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black">Creative Direction</h3>
                      <p className="text-muted-foreground">Define your visual aesthetics.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                        <ImageIcon size={14} /> Image Style
                      </label>
                      <select 
                        value={formData.imageStyle}
                        onChange={(e) => handleChange('imageStyle', e.target.value)}
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg"
                      >
                        {['cinematic', 'minimalist', 'vibrant', 'corporate', 'artistic', '3d-render'].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Brand Mood</label>
                      <input 
                        value={formData.brandMood}
                        onChange={(e) => handleChange('brandMood', e.target.value)}
                        placeholder="e.g. modern, clean, high-tech"
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Design Style</label>
                      <input 
                        value={formData.designStyle}
                        onChange={(e) => handleChange('designStyle', e.target.value)}
                        placeholder="e.g. minimal, brutalist"
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">People Preference</label>
                      <select 
                        value={formData.peoplePreference}
                        onChange={(e) => handleChange('peoplePreference', e.target.value)}
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg"
                      >
                        {['PROFESSIONALS', 'MODELS', 'NONE', 'DIVERSE', 'CASUAL'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                        <Palette size={14} /> Brand Colors
                      </label>
                      <div className="flex gap-3">
                        {formData.brandColors?.map((color, i) => (
                          <div key={i} className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg border shadow-sm shrink-0" style={{ backgroundColor: color }} />
                              <input 
                                value={color}
                                onChange={(e) => {
                                  const c = [...(formData.brandColors || [])];
                                  c[i] = e.target.value;
                                  handleChange('brandColors', c);
                                }}
                                className="w-full px-3 py-2 bg-secondary/50 border-2 border-border rounded-xl text-xs font-mono"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                      <Zap size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black">Technical Execution</h3>
                      <p className="text-muted-foreground">Fine-tune the AI output properties.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                        <Camera size={14} /> Camera Angle
                      </label>
                      <select 
                        value={formData.cameraAngle}
                        onChange={(e) => handleChange('cameraAngle', e.target.value)}
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg"
                      >
                        {['eye-level', 'top-down', 'low-angle', 'wide-angle', 'macro'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                        <Sun size={14} /> Lighting
                      </label>
                      <select 
                        value={formData.lightingStyle}
                        onChange={(e) => handleChange('lightingStyle', e.target.value)}
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg"
                      >
                        {['studio lighting', 'natural light', 'neon', 'dramatic', 'soft'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                        <Zap size={14} /> Image Type
                      </label>
                      <select 
                        value={formData.imageType}
                        onChange={(e) => handleChange('imageType', e.target.value)}
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg"
                      >
                        {['social_post', 'banner', 'ad_creative', 'story', 'thumbnail'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                        <ImageIcon size={14} /> Logo Placement
                      </label>
                      <select 
                        value={formData.logoPlacement}
                        onChange={(e) => handleChange('logoPlacement', e.target.value)}
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg"
                      >
                        {['bottom-right', 'top-right', 'top-left', 'bottom-left', 'hidden'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                        <Layers size={14} /> Composition
                      </label>
                      <select 
                        value={formData.compositionStyle}
                        onChange={(e) => handleChange('compositionStyle', e.target.value)}
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg"
                      >
                        {['centered', 'rule-of-thirds', 'asymmetrical', 'minimalist'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                        <Maximize size={14} /> Aspect Ratio
                      </label>
                      <select 
                        value={formData.aspectRatio}
                        onChange={(e) => handleChange('aspectRatio', e.target.value)}
                        className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-lg"
                      >
                        {['1:1', '16:9', '9:16', '4:5'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-4 md:col-span-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                        <Type size={14} /> Text Overlay
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                          onClick={() => handleChange('textOverlay', { ...formData.textOverlay, enabled: !formData.textOverlay?.enabled })}
                          className={cn(
                            "px-5 py-4 border-2 rounded-2xl font-bold transition-all text-left flex justify-between items-center",
                            formData.textOverlay?.enabled ? "bg-primary/10 border-primary text-primary" : "bg-secondary/30 border-border text-muted-foreground"
                          )}
                        >
                          {formData.textOverlay?.enabled ? 'Enabled' : 'Disabled'}
                          <div className={cn("w-4 h-4 rounded-full border-2", formData.textOverlay?.enabled ? "bg-primary border-primary" : "border-muted-foreground")} />
                        </button>
                        
                        {formData.textOverlay?.enabled && (
                          <>
                            <input 
                              placeholder="Overlay Style (e.g. bold modern)"
                              value={formData.textOverlay?.style || ''}
                              onChange={(e) => handleChange('textOverlay', { ...formData.textOverlay, style: e.target.value })}
                              className="px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all"
                            />
                            <select 
                              value={formData.textOverlay?.position || ''}
                              onChange={(e) => handleChange('textOverlay', { ...formData.textOverlay, position: e.target.value })}
                              className="px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all"
                            >
                              {['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'].map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Creativity Control</label>
                      <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.creativityLevel}
                        onChange={(e) => handleChange('creativityLevel', parseFloat(e.target.value))}
                        className="w-full h-12 accent-primary"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                        <span>Strict</span>
                        <span>Balanced ({formData.creativityLevel})</span>
                        <span>Creative</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Negative Constraints (What to avoid)</label>
                    <textarea 
                      value={formData.negativePrompt}
                      onChange={(e) => handleChange('negativePrompt', e.target.value)}
                      placeholder="e.g. blurry, low quality, distorted faces"
                      className="w-full h-24 px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all resize-none text-lg"
                    />
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                      <Zap size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black">Automation & Scheduling</h3>
                      <p className="text-muted-foreground">When should VaniAI work for you?</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <button 
                      onClick={() => handleChange('useAiBestTime', !formData.useAiBestTime)}
                      className={cn(
                        "w-full px-8 py-6 border-2 rounded-[2rem] text-left flex items-center justify-between transition-all",
                        formData.useAiBestTime ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("p-2 rounded-xl", formData.useAiBestTime ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                          <Sparkles size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-lg">Enable AI-Suggested Best Posting Times</p>
                          <p className="text-xs opacity-70">Dynamically optimize when your posts go live based on your niche.</p>
                        </div>
                      </div>
                      <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", formData.useAiBestTime ? "border-primary bg-primary" : "border-muted-foreground")}>
                         {formData.useAiBestTime && <CheckCircle2 className="text-white" size={14} />}
                      </div>
                    </button>

                    <div className="relative">
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border/50 -translate-x-1/2 hidden md:block" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-6">
                          <h4 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                            <Sun size={18} className="text-amber-500" /> Morning Slots
                          </h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Generate Drafts At</label>
                              <input 
                                type="time"
                                value={formData.morningDraftTime}
                                onChange={(e) => handleChange('morningDraftTime', e.target.value)}
                                className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-xl font-bold"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Publish (If Approved) At</label>
                              <input 
                                type="time"
                                value={formData.morningPublishTime}
                                onChange={(e) => handleChange('morningPublishTime', e.target.value)}
                                className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-xl font-bold"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h4 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                            <Layers size={18} className="text-indigo-500" /> Evening Slots
                          </h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Generate Drafts At</label>
                              <input 
                                type="time"
                                value={formData.eveningDraftTime}
                                onChange={(e) => handleChange('eveningDraftTime', e.target.value)}
                                className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-xl font-bold"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Publish (If Approved) At</label>
                              <input 
                                type="time"
                                value={formData.eveningPublishTime}
                                onChange={(e) => handleChange('eveningPublishTime', e.target.value)}
                                className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-all text-xl font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        variant="secondary" 
                        type="button"
                        onClick={async () => {
                          try {
                            setIsSaving(true);
                            const suggestions = await getSuggestedTimes();
                            setFormData(prev => ({
                              ...prev,
                              morningDraftTime: suggestions.morningDraftTime,
                              eveningDraftTime: suggestions.eveningDraftTime,
                              morningPublishTime: suggestions.morningPublishTime,
                              eveningPublishTime: suggestions.eveningPublishTime
                            }));
                            alert("AI Suggested times updated! Reason: " + suggestions.reason);
                          } catch (e) {
                            console.error("Failed to fetch suggestions", e);
                            alert("Failed to fetch AI suggestions. Make sure you've filled out your niche in Step 1.");
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                        className="w-full h-16 rounded-[1.5rem] font-black gap-2 group shadow-lg"
                      >
                        <Zap className="group-hover:text-amber-500 transition-colors" />
                        Suggest Optimized Times for my Niche
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t-2 border-border/50">
                <Button 
                  variant="ghost" 
                  onClick={prevStep} 
                  disabled={step === 1 || isSaving}
                  className="w-full md:w-auto gap-2 text-muted-foreground h-12 px-6 hover:bg-secondary rounded-xl order-2 md:order-1"
                >
                  <ChevronLeft size={20} />
                  Previous
                </Button>
                <Button 
                  onClick={nextStep} 
                  disabled={isSaving}
                  className={cn(
                    "w-full md:w-auto px-12 h-14 text-xl font-black group rounded-2xl shadow-xl transition-all active:scale-95 order-1 md:order-2",
                    step === totalSteps ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "shadow-primary/20"
                  )}
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" />
                  ) : step === totalSteps ? (
                    "Finish Setup"
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
};

export default BusinessProfilePage;
