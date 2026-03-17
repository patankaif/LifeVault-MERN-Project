import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AccountDeletionDialog } from '@/components/account-deletion/AccountDeletionDialog';
import { User, Mail, Calendar, Shield, Settings, Trash2, AlertTriangle, Phone, Globe, Bell, CheckCircle2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export function ProfileSection({ user }) {
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAccountAge = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden border border-slate-100/50">
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Main Profile Info */}
          <div className="lg:w-2/3 p-8 lg:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-blue-200 ring-4 ring-white transition-transform duration-500 group-hover:scale-105">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-blue-600 cursor-pointer hover:bg-slate-50 transition-colors">
                  <User size={18} />
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{user?.name}</h2>
                <p className="text-slate-400 font-medium">{user?.email}</p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full">Premium</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <Input 
                    value={user?.name} 
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-blue-500/20 transition-all font-medium text-slate-700" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <Input 
                    disabled 
                    value={user?.email} 
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 cursor-not-allowed font-medium text-slate-400" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <Input 
                    placeholder="+1 234 567 8900" 
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-blue-500/20 transition-all font-medium text-slate-700" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Language</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <Input 
                    value="English (United States)" 
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-blue-500/20 transition-all font-medium text-slate-700" 
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                  <Bell size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">SMS Alerts activation</h4>
                  <p className="text-xs text-slate-400">Receive security notifications via SMS</p>
                </div>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
            </div>

            <div className="mt-10">
              <Button className="w-48 h-14 rounded-2xl bg-[#ff6b00] hover:bg-[#e66000] text-white font-bold text-lg shadow-xl shadow-orange-200 transition-all hover:scale-105 active:scale-95">
                Save
              </Button>
            </div>
          </div>

          {/* Side Info & Settings */}
          <div className="lg:w-1/3 bg-slate-50/50 p-8 lg:p-12 space-y-10">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">My Life Vault accounts</h3>
                <Search className="text-slate-300" size={18} />
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active account</h4>
                      <p className="text-sm font-bold text-slate-700 mt-1">8040 5000 8028 4525</p>
                    </div>
                  </div>
                  <Button className="w-full h-10 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-lg shadow-rose-100">
                    Block Account
                  </Button>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm opacity-60">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Blocked account</h4>
                   <p className="text-sm font-bold text-slate-700 mt-1">7582 3000 3562 2548</p>
                   <Button variant="outline" className="w-full h-10 rounded-xl mt-4 border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs">
                     Unblock account
                   </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-6">Member Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-slate-300" size={18} />
                    <span className="text-sm font-medium text-slate-600">Joined</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{formatDate(user?.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Shield className="text-slate-300" size={18} />
                    <span className="text-sm font-medium text-slate-600">Security</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 uppercase">Enhanced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50/50 rounded-[2.5rem] border border-rose-100/50 p-8 lg:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-rose-900">Danger Zone</h3>
            <p className="text-sm text-rose-500 font-medium">Irreversible account actions</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-rose-100 shadow-xl shadow-rose-500/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900">Delete Account</h4>
              <p className="text-sm text-slate-500 font-medium max-w-md">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <AccountDeletionDialog>
              <Button variant="destructive" className="h-14 px-8 rounded-2xl font-bold shadow-lg shadow-rose-100 transition-all hover:scale-105 active:scale-95">
                <Trash2 className="mr-2 h-5 w-5" />
                Delete Account
              </Button>
            </AccountDeletionDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
