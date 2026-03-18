import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/lib/authFetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { 
  User, Mail, Shield, Bell, Clock, LogOut, 
  ArrowLeft, CheckCircle2, AlertCircle, Loader2,
  Settings, Lock, Key, Globe, Heart, Archive,
  FileText, Image as ImageIcon, Video, Send, Target, Star, Layout, Calendar, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function Profile() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading, user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inactivityStatus, setInactivityStatus] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [futureSlotsCount, setFutureSlotsCount] = useState(0);
  const [presentSlotsCount, setPresentSlotsCount] = useState(0);
  const [memoryStats, setMemoryStats] = useState({
    totalMemories: 0,
    textCount: 0,
    imageCount: 0,
    videoCount: 0,
    scheduledDeliveries: 0,
    completedDeliveries: 0
  });
  const [legacyProgress, setLegacyProgress] = useState({
    level: 'Beginner',
    progress: 0,
    nextMilestone: 'Create 5 memories',
    memoriesToNext: 5
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) return navigate('/login');
      fetchData();
    }
  }, [isAuthenticated, navigate, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSlotCounts(),
      fetchInactivityStatus()
    ]);
    setLoading(false);
  };

  const fetchInactivityStatus = async () => {
    try {
      const response = await authFetch('/api/inactivity-status');
      const data = await response.json();
      if (data.success) {
        setInactivityStatus(data.status);
      }
    } catch (err) {
      console.error('Failed to fetch inactivity status:', err);
    }
  };

  const fetchSlotCounts = async () => {
    try {
      const [futureRes, presentRes] = await Promise.all([
        authFetch('/api/vaults/future/slots'),
        authFetch('/api/vaults/present/slots')
      ]);
      
      const futureData = await futureRes.json();
      const presentData = await presentRes.json();
      
      const futureSlots = futureData.success ? (futureData.slots || []) : [];
      const presentSlots = presentData.success ? (presentData.slots || []) : [];
      
      setFutureSlotsCount(futureSlots.length);
      setPresentSlotsCount(presentSlots.length);
      
      const allSlots = [...futureSlots, ...presentSlots];
      let textCount = 0, imageCount = 0, videoCount = 0;
      let scheduledDeliveries = 0, completedDeliveries = 0;
      
      allSlots.forEach(slot => {
        if (slot.texts) textCount += slot.texts.length;
        if (slot.media) {
          slot.media.forEach(media => {
            if (media.type === 'image') imageCount++;
            else if (media.type === 'video') videoCount++;
          });
        }
        if (slot.scheduledDate) {
          if (slot.delivered) completedDeliveries++;
          else scheduledDeliveries++;
        }
      });
      
      const totalMemories = textCount + imageCount + videoCount;
      let level, progress, nextMilestone, memoriesToNext;
      
      if (totalMemories < 5) {
        level = 'Beginner';
        progress = (totalMemories / 5) * 100;
        nextMilestone = 'Create 5 memories';
        memoriesToNext = 5 - totalMemories;
      } else if (totalMemories < 15) {
        level = 'Memory Keeper';
        progress = ((totalMemories - 5) / 10) * 100;
        nextMilestone = 'Create 15 memories';
        memoriesToNext = 15 - totalMemories;
      } else {
        level = 'Legacy Builder';
        progress = 100;
        nextMilestone = 'Maximum level achieved';
        memoriesToNext = 0;
      }
      
      setMemoryStats({
        totalMemories,
        textCount,
        imageCount,
        videoCount,
        scheduledDeliveries,
        completedDeliveries
      });
      
      setLegacyProgress({ level, progress, nextMilestone, memoriesToNext });
    } catch (err) {
      setError('Performance data unavailable');
    }
  };

  const handleConfirmAlive = async () => {
    setConfirming(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await authFetch('/api/confirm-alive', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Activity confirmed! Your legacy is safe.' });
        fetchInactivityStatus();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to confirm activity' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="flex">
        {/* Persistent Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-10" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Shield className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Life Vault</h1>
          </div>

          <nav className="flex-1 space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50" onClick={() => navigate('/dashboard')}>
              <Layout size={20} /> Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50" onClick={() => navigate('/present-vault')}>
              <Calendar size={20} /> Present Vault
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50" onClick={() => navigate('/future-vault')}>
              <Clock size={20} /> Future Vault
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50" onClick={() => navigate('/death-vault')}>
              <Heart size={20} /> Death Vault
            </Button>
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">Account</p>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-3 text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => navigate('/profile')}>
              <User size={20} /> Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50">
              <Settings size={20} /> Settings
            </Button>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => {
              logout();
              window.location.href = 'https://lifevault-api-cmmw.onrender.com';
            }}>
              <LogOut size={20} /> Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-auto">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="lg:hidden flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-0 h-auto w-auto hover:bg-transparent">
                      <Menu className="text-slate-600" size={24} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-6">
                    <SheetHeader className="mb-10 text-left">
                      <SheetTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                          <Shield className="text-white" size={24} />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">Life Vault</span>
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50" onClick={() => navigate('/dashboard')}>
                        <Layout size={20} /> Dashboard
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50" onClick={() => navigate('/present-vault')}>
                        <Calendar size={20} /> Present Vault
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50" onClick={() => navigate('/future-vault')}>
                        <Clock size={20} /> Future Vault
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50" onClick={() => navigate('/death-vault')}>
                        <Heart size={20} /> Death Vault
                      </Button>
                      <div className="pt-4 pb-2 text-left">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">Account</p>
                      </div>
                      <Button variant="ghost" className="w-full justify-start gap-3 text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => navigate('/profile')}>
                        <User size={20} /> Profile
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50">
                        <Settings size={20} /> Settings
                      </Button>
                    </nav>
                    <div className="mt-auto pt-6 border-t border-slate-100">
                      <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => {
                        logout();
                        window.location.href = 'https://lifevault-api-cmmw.onrender.com';
                      }}>
                        <LogOut size={20} /> Logout
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
                <div className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
                  <Shield className="text-blue-600" size={28} />
                  <span className="font-bold text-lg">Life Vault</span>
                </div>
              </div>

              <div className="hidden lg:block">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Account Settings</h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Premium Member</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-100 ring-2 ring-white">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProfileSection user={user} />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
