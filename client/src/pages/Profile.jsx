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
  FileText, Image as ImageIcon, Video, Send, Target, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Profile
              </h1>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProfileSection user={user} />
        </motion.div>
      </div>
    </div>
  );
}
