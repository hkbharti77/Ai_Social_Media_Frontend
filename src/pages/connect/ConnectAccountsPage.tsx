import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { 
  Link, 
  Share2, 
  CheckCircle2, 
  ChevronRight, 
  Link2, 
  AlertCircle,
  Loader2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { getFacebookConnectUrl, getLinkedInConnectUrl, getXConnectUrl, getSocialAccounts, disconnectSocialAccount } from '../../api/social';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface Platform {
  id: string;
  name: string;
  type: string;
  connected: boolean;
  handle: string | null;
  details: string;
  icon: React.ElementType;
  color: string;
  dbId?: number;
  accountName?: string;
  profilePictureUrl?: string;
  pageId?: string;
  igBusinessAccountId?: string;
}

const LinkedinLogo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);

const XLogo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

const ConnectAccountsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: 'FB', name: 'Facebook Page', type: 'Link', connected: false, handle: null, details: 'Connect your Facebook Page', icon: Link, color: 'bg-blue-600' },
    { id: 'IG', name: 'Instagram Business', type: 'Share2', connected: false, handle: null, details: 'Connect your Instagram Business', icon: Share2, color: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600' },
    { id: 'LI', name: 'LinkedIn Profile', type: 'Linkedin', connected: false, handle: null, details: 'Connect your LinkedIn Profile', icon: LinkedinLogo, color: 'bg-blue-700' },
    { id: 'X', name: 'X / Twitter', type: 'Twitter', connected: false, handle: null, details: 'Connect your X Account', icon: XLogo, color: 'bg-black' },
  ]);

  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track which platforms were just connected via OAuth
  const [fbConnected, setFbConnected] = useState(false);

  useEffect(() => {
    // Handle OAuth callback query params FIRST before fetching
    const isSuccess = searchParams.get('success') === 'true';
    const igConnectedParam = searchParams.get('instagram');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      toast.error(`Connection failed: ${errorParam}`, { duration: 6000 });
      const cleaned = new URLSearchParams(searchParams);
      cleaned.delete('error');
      setSearchParams(cleaned, { replace: true });
    }

    if (isSuccess) {
      if (searchParams.get('platform') === 'linkedin') {
        toast.success('LinkedIn connected successfully! 🚀');
      } else {
        const igAlsoConnected = igConnectedParam === 'true';
        if (igAlsoConnected) {
          toast.success('Facebook & Instagram connected successfully! 🎉');
        } else {
          toast.success('Facebook connected! Instagram needs to be linked to your FB Page to auto-connect.');
        }
      }
      // Clean up URL params
      const cleaned = new URLSearchParams(searchParams);
      cleaned.delete('success');
      cleaned.delete('instagram');
      cleaned.delete('platform');
      setSearchParams(cleaned, { replace: true });
    }

    // Always refresh account list on mount
    fetchConnectedAccounts();
  }, [searchParams, setSearchParams]); // ← handle callback params when they arrive and refresh

  const fetchConnectedAccounts = async () => {
    try {
      const accounts = await getSocialAccounts();
      const hasFB = accounts.some(a => a.platform.toUpperCase() === 'FACEBOOK');
      setFbConnected(hasFB);
      setPlatforms(prev => prev.map(p => {
        let fullPlatform = '';
        if (p.id === 'FB') fullPlatform = 'FACEBOOK';
        else if (p.id === 'IG') fullPlatform = 'INSTAGRAM';
        else if (p.id === 'LI') fullPlatform = 'LINKEDIN';
        else if (p.id === 'X') fullPlatform = 'X';

        const acc = accounts.find(a => a.platform.toUpperCase() === fullPlatform);
        if (!acc) return { ...p, connected: false, handle: null, accountName: undefined, profilePictureUrl: undefined, pageId: undefined, igBusinessAccountId: undefined };
        
        // Use accountName for handle if available, otherwise use ID
        const displayHandle = acc.accountName 
          ? (acc.platform === 'INSTAGRAM' ? `@${acc.accountName}` : acc.accountName)
          : (acc.platform === 'INSTAGRAM' ? `IG: ${acc.igBusinessAccountId}` : `Page: ${acc.pageId}`);

        return {
          ...p,
          connected: true,
          handle: displayHandle,
          accountName: acc.accountName,
          profilePictureUrl: acc.profilePictureUrl,
          pageId: acc.pageId,
          igBusinessAccountId: acc.igBusinessAccountId,
          dbId: acc.id,
        };
      }));
    } catch (error) {
      console.error('Failed to fetch accounts', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (id: string) => {
    if (id === 'FB' || id === 'IG') {
      try {
        setConnectingId(id);
        // Both Facebook and Instagram usually go through the same Meta OAuth flow
        const url = await getFacebookConnectUrl();
        window.location.href = url;
      } catch (error) {
        console.error('Failed to get connection URL', error);
        setConnectingId(null);
      }
    } else if (id === 'LI') {
      try {
        setConnectingId(id);
        const url = await getLinkedInConnectUrl();
        window.location.href = url;
      } catch (error) {
        console.error('Failed to get LinkedIn connection URL', error);
        setConnectingId(null);
      }
    } else if (id === 'X') {
      try {
        setConnectingId(id);
        const state = Math.random().toString(36).substring(2);
        const url = await getXConnectUrl(state);
        window.location.href = url;
      } catch (error) {
        console.error('Failed to get X connection URL', error);
        setConnectingId(null);
      }
    }
  };

  const handleDisconnect = async (id: string, dbId?: number) => {
    if (!dbId) return;
    try {
      setConnectingId(id);
      await disconnectSocialAccount(dbId);
      await fetchConnectedAccounts();
    } catch (error) {
      console.error('Failed to disconnect account', error);
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Connect Social Media</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Link your platforms to start automating your growth with AI.
          </p>
        </header>

        <div className="grid gap-6">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : (
            platforms.map((platform) => (
              <motion.div 
                layout
                key={platform.id}
                className={cn(
                  "bg-card border-2 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 group transition-all shadow-lg",
                  platform.connected ? "border-primary/20 hover:border-primary shadow-primary/5" : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                  {/* Profile avatar — real picture or platform icon */}
                  <div className="relative shrink-0">
                    {platform.connected && platform.profilePictureUrl ? (
                      <img
                        src={platform.profilePictureUrl}
                        alt={platform.accountName || platform.name}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-xl border-2 border-white/10"
                      />
                    ) : (
                      <div className={cn(
                        "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-xl text-white transition-transform group-hover:scale-105 duration-500",
                        platform.color
                      )}>
                        <platform.icon size={36} className="md:size-44" />
                      </div>
                    )}
                    {platform.connected && (
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 shadow-lg border-2 border-background">
                        <CheckCircle2 size={14} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                      <h3 className="font-bold text-xl md:text-2xl">
                        {platform.connected && platform.accountName ? platform.accountName : platform.name}
                      </h3>
                      <AnimatePresence>
                        {platform.connected && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-1.5 text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
                          >
                            <CheckCircle2 size={12} /> Connected
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {platform.connected ? (
                      <div className="space-y-1">
                        {/* Sub-label: original platform name */}
                        <p className="text-sm text-muted-foreground font-medium">{platform.name}</p>
                        {/* ID badges */}
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                          {platform.pageId && (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                              Page ID: {platform.pageId}
                            </span>
                          )}
                          {platform.igBusinessAccountId && (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                              IG ID: {platform.igBusinessAccountId}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-base md:text-lg">{platform.details}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {connectingId === platform.id ? (
                    <Button disabled variant="secondary" className="w-full md:w-auto gap-2 px-6">
                      <Loader2 className="animate-spin" size={18} />
                      {platform.connected ? 'Disconnecting...' : 'Connecting...'}
                    </Button>
                  ) : platform.connected ? (
                    <Button 
                      variant="ghost" 
                      onClick={() => handleDisconnect(platform.id, platform.dbId)}
                      className="w-full md:w-auto text-destructive border-transparent hover:bg-destructive/10 px-6 gap-2"
                    >
                      <XCircle size={18} />
                      Disconnect
                    </Button>
                  ) : platform.id === 'IG' && fbConnected && !platform.connected ? (
                    // FB connected but IG not found — inline setup guide
                    <div className="w-full mt-4 md:mt-0 space-y-3">
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                        <p className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                          <span>⚠️</span> Instagram Not Detected — Setup Required
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Meta requires Instagram to be <strong className="text-foreground">linked to a Facebook Page</strong>. Without this, API publishing is not possible.
                        </p>
                        <ol className="space-y-2 text-xs text-muted-foreground leading-relaxed list-none">
                          <li className="flex gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                            <span>
                              <strong className="text-foreground">No Facebook Page?</strong>{' '}
                              Create one free at{' '}
                              <a href="https://facebook.com/pages/create" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">facebook.com/pages/create</a>
                              {' '}(any category — e.g. "Brand")
                            </span>
                          </li>
                          <li className="flex gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                            <span>Make Instagram a <strong className="text-foreground">Business/Creator account</strong>: Instagram → Settings → Account → Switch to Professional</span>
                          </li>
                          <li className="flex gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                            <span><strong className="text-foreground">Facebook Page</strong> → Settings → <strong className="text-foreground">Linked Accounts</strong> → Connect Instagram → confirm</span>
                          </li>
                          <li className="flex gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black text-[10px] flex items-center justify-center shrink-0">4</span>
                            <span>Click <strong className="text-foreground">Reconnect Facebook Now</strong> — Instagram will auto-link</span>
                          </li>
                        </ol>
                        <Button
                          onClick={() => handleConnect('FB')}
                          size="sm"
                          className="w-full gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl font-black uppercase tracking-widest text-[10px]"
                        >
                          <Link2 size={14} /> Reconnect Facebook Now
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleConnect(platform.id)}
                      className={cn(
                        "w-full md:w-auto gap-2 px-10 h-14 font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all active:scale-95 group relative overflow-hidden",
                        platform.id === 'IG' 
                          ? "bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 border-none hover:shadow-rose-500/25" 
                          : platform.id === 'LI'
                            ? "bg-blue-700 hover:bg-blue-800 shadow-blue-500/20"
                            : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                      )}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Link2 size={18} className="group-hover:rotate-12 transition-transform" />
                      Connect {platform.id === 'FB' ? 'Facebook' : platform.id === 'IG' ? 'Instagram' : platform.id === 'LI' ? 'LinkedIn' : 'X'}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}

          {/* Info Box */}
          <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-3xl flex gap-6">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-xl text-amber-500">Important Permission Note</h4>
              <p className="text-muted-foreground leading-relaxed">
                VaniAI requires <strong>'manage_pages'</strong> and <strong>'publish_media'</strong> permissions to post on your behalf. We will never post without your explicit schedule or confirmation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-border">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="w-full md:w-auto text-muted-foreground h-12 px-8">Skip for now</Button>
          <Button onClick={() => navigate('/dashboard')} className="w-full md:w-auto px-12 h-12 text-lg font-bold group shadow-xl">
            Go to Dashboard
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ConnectAccountsPage;

