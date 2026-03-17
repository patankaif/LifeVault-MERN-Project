import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/lib/authFetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LogOut, Clock, User, Trash2, Calendar, TrendingUp, 
  Award, BarChart3, Sun, Moon, Layout, Grid, List,
  Zap, Target, Flame, Shield, Heart, Share2, Bell,
  ChevronRight, Plus, Settings, HelpCircle, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [nextScheduled, setNextScheduled] = useState(null);
  const [inactivityStatus, setInactivityStatus] = useState(null);
  const [stats, setStats] = useState({
    totalMemories: 0,
    deliveredMemories: 0,
    activeVaults: 3,
    daysUntilNext: 0
  });
  const [showDemo, setShowDemo] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    fetchNextScheduledAndStats();
    fetchInactivityStatus();
  }, []);

  const fetchNextScheduledAndStats = async () => {
    try {
      // Fetch Next Scheduled
      const nextResponse = await authFetch('/api/next-scheduled');
      const nextData = await nextResponse.json();
      
      let daysUntilNext = 0;
      if (nextData.success && nextData.scheduling) {
        setNextScheduled(nextData.scheduling);
        const scheduledDate = new Date(nextData.scheduling.scheduledDate);
        const now = new Date();
        const diffTime = scheduledDate - now;
        daysUntilNext = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysUntilNext < 0) daysUntilNext = 0;
      } else {
        setNextScheduled(null);
      }

      // Fetch memory counts
      const [futureRes, presentRes] = await Promise.all([
        authFetch('/api/vaults/future/slots'),
        authFetch('/api/vaults/present/slots')
      ]);
      
      const futureData = await futureRes.json();
      const presentData = await presentRes.json();
      
      const futureSlots = futureData.success ? (futureData.slots || []) : [];
      const presentSlots = presentData.success ? (presentData.slots || []) : [];
      
      const allSlots = [...futureSlots, ...presentSlots];
      
      let textCount = 0, imageCount = 0, videoCount = 0;
      let deliveredMemories = 0;
      
      allSlots.forEach(slot => {
        if (slot.texts) textCount += slot.texts.length;
        if (slot.media) {
          slot.media.forEach(media => {
            if (media.type === 'image') imageCount++;
            else if (media.type === 'video') videoCount++;
          });
        }
        if (slot.scheduledDate && slot.delivered) {
          deliveredMemories++;
        }
      });
      
      const totalMemories = textCount + imageCount + videoCount;

      setStats({
        totalMemories,
        deliveredMemories,
        activeVaults: 3, // Fixed to 3 based on structure: Present, Future, Death
        daysUntilNext: daysUntilNext > 0 ? daysUntilNext : (nextData.scheduling ? 0 : '--')
      });

    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const Counter = ({ value, duration = 2 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const end = parseInt(value);
      if (isNaN(end)) {
        setCount(value);
        return;
      }
      if (start === end) {
        setCount(end);
        return;
      }

      let totalMiliseconds = duration * 1000;
      let incrementTime = (totalMiliseconds / end);

      let timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count}</span>;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Sidebar / Navigation */}
      <div className="flex">
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Shield className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Life Vault</h1>
          </div>

          <nav className="flex-1 space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3 text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => navigate('/dashboard')}>
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
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50" onClick={() => navigate('/profile')}>
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
                      <Button variant="ghost" className="w-full justify-start gap-3 text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => navigate('/dashboard')}>
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
                      <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50" onClick={() => navigate('/profile')}>
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
                <h2 className="text-lg font-semibold text-slate-800">Hello, {user?.name?.split(' ')[0]}! Welcome to your Life Vault.</h2>
              </div>

              <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="h-8 w-px bg-slate-200 mx-1"></div>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">{user?.name}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Inactivity Warning */}
            {inactivityStatus?.isInactive && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mb-8"
              >
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <Bell size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-amber-900">Inactivity Warning</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      We haven't seen you in a while. Please confirm you're still active to keep your Death Vault safe.
                      {inactivityStatus.confirmationStatus && (
                        <span className="font-bold ml-1">
                          {inactivityStatus.confirmationStatus.daysRemaining} days remaining.
                        </span>
                      )}
                    </p>
                  </div>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => navigate('/profile')}>
                    Confirm Now
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Stats Grid */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
            >
              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-sm bg-white hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shadow-sm shadow-blue-100 group-hover:scale-110 transition-transform duration-300">
                        <Share2 size={20} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Archive</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Total Memories</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">
                      <Counter value={stats.totalMemories} />
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-sm bg-white hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-green-50 rounded-xl text-green-600 shadow-sm shadow-green-100 group-hover:scale-110 transition-transform duration-300">
                        <Target size={20} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-md">Success</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Delivered</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">
                      <Counter value={stats.deliveredMemories} />
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-sm bg-white hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 shadow-sm shadow-purple-100 group-hover:scale-110 transition-transform duration-300">
                        <Shield size={20} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded-md">Secure</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Active Vaults</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">
                      <Counter value={stats.activeVaults} />
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-sm bg-white hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 shadow-sm shadow-amber-100 group-hover:scale-110 transition-transform duration-300">
                        <Clock size={20} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Pending</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Next Delivery</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">
                      {stats.daysUntilNext === '--' ? '--' : <><Counter value={stats.daysUntilNext} /> Days</>}
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Vaults Section */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Your Vaults</h3>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">View All</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Present Vault */}
                  <motion.div whileHover={{ y: -6 }} className="cursor-pointer" onClick={() => navigate('/present-vault')}>
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-emerald-50/50 to-white hover:shadow-emerald-500/10 overflow-hidden group transition-all duration-500 relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                      <CardHeader className="pb-2 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 bg-emerald-100/50 backdrop-blur-sm rounded-xl text-emerald-600 shadow-sm shadow-emerald-100 group-hover:scale-110 transition-transform duration-500">
                            <Calendar size={20} />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                            <ChevronRight size={18} className="text-emerald-500" />
                          </div>
                        </div>
                        <CardTitle className="text-xl mt-4 font-bold text-slate-900">Present Vault</CardTitle>
                        <CardDescription className="text-slate-500 font-medium tracking-tight">Memories for the near future</CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <p className="text-sm text-slate-500 leading-relaxed font-medium opacity-80">
                          Store and schedule memories to share with loved ones within the next 30 days.
                        </p>
                        <div className="mt-8 pt-6 border-t border-emerald-100/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="flex -space-x-2">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600 shadow-sm">
                                  {user?.name?.charAt(0) || 'U'}
                                </div>
                              ))}
                            </div>
                            <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider ml-1">Live Slots</span>
                          </div>
                          <span className="text-xs text-slate-400 font-bold">{stats.totalMemories > 0 ? stats.totalMemories : '4'} Items</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Future Vault */}
                  <motion.div whileHover={{ y: -6 }} className="cursor-pointer" onClick={() => navigate('/future-vault')}>
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-blue-50/50 to-white hover:shadow-blue-500/10 overflow-hidden group transition-all duration-500 relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>
                      <CardHeader className="pb-2 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 bg-blue-100/50 backdrop-blur-sm rounded-xl text-blue-600 shadow-sm shadow-blue-100 group-hover:scale-110 transition-transform duration-500">
                            <Clock size={20} />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                            <ChevronRight size={18} className="text-blue-500" />
                          </div>
                        </div>
                        <CardTitle className="text-xl mt-4 font-bold text-slate-900">Future Vault</CardTitle>
                        <CardDescription className="text-slate-500 font-medium tracking-tight">Long-term memory planning</CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <p className="text-sm text-slate-500 leading-relaxed font-medium opacity-80">
                          Plan ahead with memories scheduled for delivery up to 9 months in advance.
                        </p>
                        <div className="mt-8 pt-6 border-t border-blue-100/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="flex -space-x-2">
                              {[1, 2].map(i => (
                                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shadow-sm">
                                  {user?.name?.charAt(0) || 'U'}
                                </div>
                              ))}
                            </div>
                            <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wider ml-1">Planned</span>
                          </div>
                          <span className="text-xs text-slate-400 font-bold">2 Items</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Death Vault */}
                  <motion.div whileHover={{ y: -6 }} className="cursor-pointer md:col-span-2" onClick={() => navigate('/death-vault')}>
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-rose-50/50 to-white hover:shadow-rose-500/10 overflow-hidden group transition-all duration-500 relative">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-rose-500/10 transition-colors duration-500"></div>
                      <CardHeader className="pb-2 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 bg-rose-100/50 backdrop-blur-sm rounded-xl text-rose-600 shadow-sm shadow-rose-100 group-hover:scale-110 transition-transform duration-500">
                            <Heart size={20} />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                            <ChevronRight size={18} className="text-rose-500" />
                          </div>
                        </div>
                        <CardTitle className="text-xl mt-4 font-bold text-slate-900">Death Vault</CardTitle>
                        <CardDescription className="text-slate-500 font-medium tracking-tight">Your ultimate legacy and messages for loved ones</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                        <p className="text-sm text-slate-500 leading-relaxed font-medium opacity-80 flex-1">
                          Leave important messages that will be delivered to your loved ones after 9 months of inactivity. This is your digital legacy, handled with the utmost care and security.
                        </p>
                        <div className="flex-shrink-0">
                          <Button className="bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100 px-8 py-6 rounded-xl font-bold transition-all duration-300 transform group-hover:scale-105 active:scale-95">
                            Manage Legacy
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="space-y-8">
                {/* Next Scheduled */}
                {/* Next Scheduled */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Upcoming</h3>
                  <Card className="border-none shadow-xl shadow-slate-200/40 bg-white overflow-hidden group">
                    <CardContent className="p-6">
                      {nextScheduled ? (
                        <div className="space-y-5">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-500">
                              <span className="text-[10px] font-bold uppercase opacity-80">{new Date(nextScheduled.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                              <span className="text-xl font-bold leading-none">{new Date(nextScheduled.scheduledDate).getDate()}</span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1">
                              <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">Memory Delivery</h4>
                              <p className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Scheduled</p>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400">
                              <User size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Recipient</p>
                              <p className="text-xs text-slate-700 font-medium truncate">{nextScheduled.recipientEmail}</p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 italic">Protected by Life Vault</span>
                            <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg">View Details</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200 border-2 border-dashed border-slate-100">
                            <Calendar size={28} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 italic">No schedules yet</h4>
                          <p className="text-xs text-slate-400 mt-2 px-4 leading-relaxed">Your future memories will appear here once scheduled.</p>
                          <Button variant="outline" className="mt-6 border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 font-bold text-xs py-5 rounded-xl w-full" onClick={() => navigate('/present-vault')}>
                            <Plus size={14} className="mr-2" /> Schedule Now
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h3>
                  <Card className="border-none shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-50">
                        {[
                          { icon: <Shield size={14}/>, color: 'text-blue-500', bg: 'bg-blue-50', title: 'Security Check', time: '2 hours ago', desc: 'Vault status verified' },
                          { icon: <MessageSquare size={14}/>, color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'New Memory', time: '5 hours ago', desc: 'Added to Present Vault' },
                          { icon: <User size={14}/>, color: 'text-purple-500', bg: 'bg-purple-50', title: 'Profile Updated', time: 'Yesterday', desc: 'Personal details changed' }
                        ].map((activity, idx) => (
                          <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 group">
                            <div className={`w-8 h-8 ${activity.bg} ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                              {activity.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs font-bold text-slate-900 truncate">{activity.title}</h4>
                                <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{activity.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{activity.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-slate-50/50">
                        <Button variant="ghost" className="w-full text-[11px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest">
                          Full Activity History
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Help Card */}
                <Card className="border-none shadow-sm bg-gradient-to-br from-slate-800 to-slate-900 text-white overflow-hidden relative">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <CardContent className="p-6 relative z-10">
                    <HelpCircle className="text-slate-400 mb-4" size={24} />
                    <h4 className="text-lg font-bold mb-2">Need help?</h4>
                    <p className="text-sm text-slate-400 mb-6">
                      Learn how to set up your digital legacy and ensure your memories live on.
                    </p>
                    <Button className="w-full bg-white text-slate-900 hover:bg-slate-100" onClick={() => setShowDemo(true)}>
                      Live Demo
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-none">
          <div className="aspect-video w-full relative">
            <video 
              className="w-full h-full"
              controls
              autoPlay
              src="/demo.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
