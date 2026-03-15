// import { useState, useEffect } from 'react';
// import { useLocation } from 'wouter';
// import { useAuth } from '@/contexts/AuthContext';
// import { authFetch } from '@/lib/authFetch';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { 
//   Package, Shield, ArrowLeft, Plus, Trash2, 
//   Mail, User, ChevronRight, Loader2, AlertCircle,
//   CheckCircle2, Info, Send, Archive, Zap
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// export default function PresentVault() {
//   const [, navigate] = useLocation();
//   const { isAuthenticated, loading: authLoading } = useAuth();
//   const [slots, setSlots] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showAddSlot, setShowAddSlot] = useState(false);
//   const [newSlot, setNewSlot] = useState({
//     name: '',
//     recipientEmail: '',
//   });
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     if (!authLoading) {
//       if (!isAuthenticated) {
//         navigate('/login');
//         return;
//       }
//       fetchSlots();
//     }
//   }, [isAuthenticated, navigate, authLoading]);

//   const fetchSlots = async () => {
//     try {
//       setLoading(true);
//       const response = await authFetch('/api/vaults/present/slots');
//       const data = await response.json();
//       if (data.success) {
//         setSlots(data.slots || []);
//       } else {
//         setError(data.message || 'Failed to fetch slots');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddSlot = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setError('');
//     try {
//       const response = await authFetch('/api/vaults/present/slots', {
//         method: 'POST',
//         body: JSON.stringify({ slotName: newSlot.name }),
//       });
//       const data = await response.json();
//       if (data.success) {
//         if (newSlot.recipientEmail) {
//           await authFetch(`/api/slots/${data.slot._id}/schedule`, {
//             method: 'POST',
//             body: JSON.stringify({
//               recipientEmail: newSlot.recipientEmail,
//               scheduledDate: new Date().toISOString(),
//               vaultType: 'present',
//             }),
//           });
//         }
//         setShowAddSlot(false);
//         setNewSlot({ name: '', recipientEmail: '' });
//         fetchSlots();
//       } else {
//         setError(data.message || 'Failed to add slot');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDeleteSlot = async (slotId) => {
//     if (!window.confirm('Are you sure you want to delete this memory?')) return;
//     try {
//       const response = await authFetch(`/api/slots/${slotId}`, {
//         method: 'DELETE',
//         body: JSON.stringify({ vaultType: 'present' }),
//       });
//       const data = await response.json();
//       if (data.success) {
//         fetchSlots();
//       } else {
//         setError(data.message || 'Failed to delete slot');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     }
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.1 }
//     }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0 }
//   };

//   if (loading || authLoading) return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50">
//       <div className="flex flex-col items-center gap-4">
//         <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
//         <p className="text-slate-500 font-medium">Opening Present Vault...</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#f8fafc]">
//       <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
//           <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-900">
//             <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
//           </Button>
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
//               <Package size={18} />
//             </div>
//             <span className="font-bold text-slate-900">Present Vault</span>
//           </div>
//           <Button 
//             onClick={() => setShowAddSlot(true)}
//             className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-100"
//           >
//             <Plus size={18} className="mr-2" /> New Memory
//           </Button>
//         </div>
//       </header>

//       <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="mb-10">
//           <h1 className="text-3xl font-bold text-slate-900">Instant Memories</h1>
//           <p className="text-slate-500 mt-2">Share messages and media that can be delivered immediately.</p>
//         </div>

//         {error && (
//           <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium">
//             <AlertCircle size={18} />
//             {error}
//           </div>
//         )}

//         <AnimatePresence>
//           {showAddSlot && (
//             <motion.div 
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               className="mb-10 overflow-hidden"
//             >
//               <Card className="border-none shadow-xl bg-white ring-1 ring-slate-200">
//                 <CardHeader className="border-b border-slate-50">
//                   <CardTitle className="text-lg">Create Instant Memory</CardTitle>
//                   <CardDescription>Share something special right now</CardDescription>
//                 </CardHeader>
//                 <CardContent className="p-6">
//                   <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-slate-700 ml-1">Memory Name</label>
//                       <Input 
//                         placeholder="e.g., Surprise Photo" 
//                         value={newSlot.name}
//                         onChange={(e) => setNewSlot({...newSlot, name: e.target.value})}
//                         className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-slate-700 ml-1">Recipient Email (Optional)</label>
//                       <Input 
//                         type="email"
//                         placeholder="recipient@example.com" 
//                         value={newSlot.recipientEmail}
//                         onChange={(e) => setNewSlot({...newSlot, recipientEmail: e.target.value})}
//                         className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
//                       />
//                     </div>
//                     <div className="md:col-span-2 flex justify-end gap-3 pt-4">
//                       <Button variant="ghost" type="button" onClick={() => setShowAddSlot(false)} className="text-slate-500">
//                         Cancel
//                       </Button>
//                       <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8">
//                         {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
//                         Create Memory
//                       </Button>
//                     </div>
//                   </form>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <motion.div 
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//         >
//           {slots.length > 0 ? (
//             slots.map((slot) => (
//               <motion.div key={slot._id} variants={itemVariants}>
//                 <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all group overflow-hidden">
//                   <div className={`h-1.5 w-full ${slot.delivered ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
//                   <CardHeader className="pb-2">
//                     <div className="flex items-center justify-between">
//                       <div className={`p-2 rounded-lg ${slot.delivered ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
//                         {slot.delivered ? <CheckCircle2 size={18} /> : <Zap size={18} />}
//                       </div>
//                       <Button 
//                         variant="ghost" 
//                         size="sm" 
//                         onClick={() => handleDeleteSlot(slot._id)}
//                         className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
//                       >
//                         <Trash2 size={16} />
//                       </Button>
//                     </div>
//                     <CardTitle className="text-lg mt-4 truncate">{slot.name}</CardTitle>
//                     <CardDescription className="flex items-center gap-1.5 mt-1">
//                       <Mail size={14} /> {slot.scheduledEmail || 'No recipient set'}
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="pt-4">
//                     <div className="flex items-center justify-between text-sm text-slate-500 bg-slate-50 p-3 rounded-xl">
//                       <div className="flex items-center gap-2">
//                         <Send size={14} />
//                         <span>{slot.delivered ? 'Sent' : 'Ready to send'}</span>
//                       </div>
//                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
//                         slot.delivered ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
//                       }`}>
//                         {slot.delivered ? 'Delivered' : 'Draft'}
//                       </span>
//                     </div>
//                     <Button 
//                       variant="outline" 
//                       className="w-full mt-6 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 group/btn"
//                       onClick={() => navigate(`/slots/${slot._id}`)}
//                     >
//                       Manage Content <ChevronRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             ))
//           ) : (
//             <div className="col-span-full py-20 text-center">
//               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
//                 <Archive size={40} />
//               </div>
//               <h3 className="text-xl font-bold text-slate-900">No memories yet</h3>
//               <p className="text-slate-500 mt-2 max-w-xs mx-auto">
//                 Start by creating your first instant memory to share with someone special.
//               </p>
//               <Button 
//                 onClick={() => setShowAddSlot(true)}
//                 className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8"
//               >
//                 Create First Memory
//               </Button>
//             </div>
//           )}
//         </motion.div>

//         {/* Info Card */}
//         <Card className="mt-16 border-none shadow-sm bg-emerald-50/50 border border-emerald-100">
//           <CardContent className="p-6 flex items-start gap-4">
//             <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
//               <Info size={20} />
//             </div>
//             <div>
//               <h4 className="font-bold text-emerald-900">About Present Vault</h4>
//               <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
//                 The Present Vault is for memories you want to share right now. Unlike the Future Vault, there's no long-term scheduling required. Simply add your content, set a recipient, and send it instantly.
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/lib/authFetch';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, Shield, ArrowLeft, Plus, Trash2, 
  Mail, User, ChevronRight, Loader2, AlertCircle,
  CheckCircle2, Info, Send, Archive, Zap, MessageSquare,
  Image as ImageIcon, Video as VideoIcon, Calendar, Heart, ThumbsUp, Eye, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hook to get URL query parameters
const useQuery = () => {
  const [location] = useLocation();
  // Use window.location.search to get query parameters more reliably
  const searchParams = typeof window !== 'undefined' ? window.location.search : '';
  const query = new URLSearchParams(searchParams);
  console.log('[PresentVault] useQuery location:', location);
  console.log('[PresentVault] useQuery searchParams:', searchParams);
  console.log('[PresentVault] useQuery query params:', Object.fromEntries(query.entries()));
  return query;
};

// Animated Button Component
const AnimatedButton = ({ children, className, ...props }) => (
  <Button 
    className={`${className} transform transition-all duration-200 hover:scale-105 active:scale-95`} 
    {...props}
  >
    {children}
  </Button>
);

export default function PresentVault() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const query = useQuery();
  const [slots, setSlots] = useState([]);
  const [newSlotName, setNewSlotName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [focusedSlotId, setFocusedSlotId] = useState(null); // For showing only specific slot
  const [readOnlyMode, setReadOnlyMode] = useState(false); // For read-only shared slot view
  const [editingText, setEditingText] = useState(null);
  const [newText, setNewText] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    slotId: null,
    type: 'slot', // 'slot' or 'schedule'
    slotName: ''
  });
  const [uploadingMedia, setUploadingMedia] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editingSlotName, setEditingSlotName] = useState('');
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [activeTab, setActiveTab] = useState({});
  const [viewSlotModal, setViewSlotModal] = useState(null);

  useEffect(() => {
    // Only check authentication after auth loading is complete
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      fetchSlots();
    }
  }, [isAuthenticated, navigate, authLoading]);

  // Handle schedule query parameter
  useEffect(() => {
    const scheduleSlotId = query.get('schedule');
    console.log('[PresentVault] Schedule parameter check:', { scheduleSlotId, slotsLength: slots.length });
    if (scheduleSlotId && slots.length > 0) {
      const slotToSchedule = slots.find(slot => slot._id === scheduleSlotId);
      console.log('[PresentVault] Found slot to schedule:', slotToSchedule);
      if (slotToSchedule) {
        console.log('[PresentVault] Setting focused slot and opening schedule modal for:', slotToSchedule._id);
        // Set focused slot to show only this slot
        setFocusedSlotId(scheduleSlotId);
        // Set read-only mode for shared slot view
        setReadOnlyMode(true);
        // Expand this specific slot
        setExpandedSlot(scheduleSlotId);
        // Open schedule modal
        setScheduleModal(scheduleSlotId);
        setScheduleEmail(slotToSchedule.scheduledEmail || '');
        setScheduleDate(slotToSchedule.scheduledDate ? new Date(slotToSchedule.scheduledDate).toISOString().split('T')[0] : '');
        // Clear the query parameter to prevent reopening on refresh
        window.history.replaceState({}, '', '/present-vault');
      }
    }
  }, [query, slots]);

  const checkDeliveryStatus = async (slots) => {
    try {
      const deliveryChecks = await Promise.all(
        slots.map(async (slot) => {
          if (slot.scheduledDate && !slot.delivered) {
            const response = await authFetch(`/api/slots/${slot._id}/delivery-status`);
            const data = await response.json();
            return { slotId: slot._id, delivered: data.delivered };
          }
          return { slotId: slot._id, delivered: slot.delivered };
        })
      );
      
      // Update slots with delivery status
      const updatedSlots = slots.map(slot => {
        const deliveryInfo = deliveryChecks.find(d => d.slotId === slot._id);
        if (deliveryInfo && deliveryInfo.delivered !== slot.delivered) {
          return { ...slot, delivered: deliveryInfo.delivered };
        }
        return slot;
      });
      
      return updatedSlots;
    } catch (err) {
      console.error('Error checking delivery status:', err);
      return slots;
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/vaults/present/slots');
      const data = await response.json();
      if (data.success) {
        const slotsWithDeliveryStatus = await checkDeliveryStatus(data.slots);
        setSlots(slotsWithDeliveryStatus || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSlot = async () => {
    if (!newSlotName.trim()) return;
    try {
      const response = await authFetch('/api/vaults/present/slots', {
        method: 'POST',
        body: JSON.stringify({ slotName: newSlotName }),
      });
      const data = await response.json();
      if (data.success) {
        setSlots([...slots, data.slot]);
        setNewSlotName('');
        setError('');
        setShowAddSlot(false);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteSlot = async (slotId) => {
    const slot = slots.find(s => s._id === slotId);
    setDeleteDialog({
      isOpen: true,
      slotId,
      type: 'slot',
      slotName: slot?.name || 'this memory'
    });
  };

  const confirmDeleteSlot = async () => {
    try {
      const response = await authFetch(`/api/slots/${deleteDialog.slotId}`, {
        method: 'DELETE',
        body: JSON.stringify({ vaultType: 'present' }),
      });
      const data = await response.json();
      if (data.success) {
        fetchSlots();
        setDeleteDialog({ isOpen: false, slotId: null, type: 'slot', slotName: '' });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDeleteSchedule = async () => {
    // Delete delivery schedule
    setSlots(slots.map(s => 
      s._id === deleteDialog.slotId 
        ? { ...s, scheduledDate: null, scheduledEmail: null, delivered: false }
        : s
    ));
    setDeleteDialog({ isOpen: false, slotId: null, type: 'schedule', slotName: '' });
  };

  const addText = async (slotId) => {
    const text = newText[slotId]?.trim();
    if (!text) return;
    try {
      const response = await authFetch(`/api/slots/${slotId}/text`, {
        method: 'POST',
        body: JSON.stringify({ textContent: text }),
      });
      const data = await response.json();
      if (data.success) {
        setSlots(slots.map(s => 
          s._id === slotId 
            ? { ...s, texts: [...(s.texts || []), data.text] } 
            : s
        ));
        setNewText({ ...newText, [slotId]: '' });
        setExpandedSlot(null);
        setError('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteText = async (slotId, textId) => {
    try {
      const response = await authFetch(`/api/slots/${slotId}/text/${textId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setSlots(slots.map(s => s._id === slotId ? { ...s, texts: s.texts.filter(t => t._id !== textId) } : s));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const addMedia = async (slotId, file) => {
    if (!file) return;
    try {
      setUploadingMedia(slotId);
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) return;
        const base64 = e.target.result.split(',')[1];
        const mediaType = file.type.startsWith('image') ? 'image' : 'video';
        
        try {
          const response = await authFetch(`/api/slots/${slotId}/media`, {
            method: 'POST',
            body: JSON.stringify({ file: base64, mediaType }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload failed:', errorText);
            // Provide better error messages based on status code
            let errorMessage = `Upload failed: ${response.status}`;
            if (response.status === 413) {
              errorMessage = 'File too large - please upload a smaller file';
            } else if (response.status === 415) {
              errorMessage = 'Unsupported file type - please upload images or videos only';
            } else if (response.status === 429) {
              errorMessage = 'Too many upload attempts - please wait and try again';
            } else if (response.status >= 500) {
              errorMessage = 'Server error - please try again later';
            }
            setError(errorMessage);
          } else {
            const data = await response.json();
            if (data.success) {
              setSlots(slots.map(s => 
                s._id === slotId 
                  ? { ...s, media: [...(s.media || []), data.media] } 
                  : s
              ));
              setExpandedSlot(null);
              setError('');
            } else {
              setError(data.message || 'Failed to upload media');
            }
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          // Provide more specific error messages for deployment
          let errorMessage = 'Network error during upload';
          if (fetchError.message.includes('Failed to fetch')) {
            errorMessage = 'Network connection failed - please check your internet connection';
          } else if (fetchError.message.includes('CORS')) {
            errorMessage = 'CORS error - please check server configuration';
          } else if (fetchError.message.includes('timeout')) {
            errorMessage = 'Upload timeout - please try again with a smaller file';
          }
          setError(errorMessage);
        } finally {
          setUploadingMedia(null);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setUploadingMedia(null);
      };
      reader.onprogress = (e) => {
        const progress = (e.loaded / e.total) * 100;
        console.log(`Uploading media... ${progress}%`);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message || 'Failed to upload media');
      setUploadingMedia(null);
    }
  };

  const deleteMedia = async (slotId, mediaId) => {
    try {
      const response = await authFetch(`/api/slots/${slotId}/media/${mediaId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setSlots(slots.map(s => s._id === slotId ? { ...s, media: s.media.filter(m => m._id !== mediaId) } : s));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const updateSlotName = async (slotId) => {
    if (!editingSlotName.trim()) {
      setEditingSlot(null);
      return;
    }
    try {
      const response = await authFetch(`/api/slots/${slotId}`, {
        method: 'PUT',
        body: JSON.stringify({ slotName: editingSlotName }),
      });
      const data = await response.json();
      if (data.success) {
        setSlots(slots.map(s => s._id === slotId ? { ...s, name: editingSlotName } : s));
        setEditingSlot(null);
        setEditingSlotName('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const scheduleSlot = async (slotId) => {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!scheduleEmail || !scheduleDate) {
      setError('Please enter email and date');
      return;
    }
    
    if (!emailRegex.test(scheduleEmail)) {
      setError('Please enter a valid email address (e.g., patan@gmail.com)');
      return;
    }
    
    try {
      const response = await authFetch(`/api/slots/${slotId}/schedule`, {
        method: 'POST',
        body: JSON.stringify({
          recipientEmail: scheduleEmail,
          scheduledDate: scheduleDate,
          vaultType: 'present',
        }),
      });
      const data = await response.json();
      if (data.success) {
        if (data.slot) {
          setSlots(slots.map(s => 
            s._id === slotId 
              ? data.slot
              : s
          ));
        } else {
          setSlots(slots.map(s => 
            s._id === slotId 
              ? { ...s, scheduledDate: scheduleDate, scheduledEmail: scheduleEmail }
              : s
          ));
        }
        setScheduleModal(null);
        setScheduleEmail('');
        setScheduleDate('');
        setError('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Opening Present Vault...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Present Vault</h1>
            <p className="text-gray-600">Share memories within 1 month</p>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="outline">Back</Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!readOnlyMode && (
        <Card className="mb-8">
          <CardHeader><CardTitle>Create New Slot</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="Slot name..." value={newSlotName} onChange={e => setNewSlotName(e.target.value)} />
              <Button onClick={createSlot}><Plus size={18} className="mr-2" />Add Slot</Button>
            </div>
          </CardContent>
        </Card>
      )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {focusedSlotId && (
          <div className="mb-6 flex items-center justify-center">
            <div className="text-sm text-gray-600 text-center">
              Viewing shared slot: <span className="font-semibold">{slots.find(s => s._id === focusedSlotId)?.name}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slots.filter(slot => !focusedSlotId || slot._id === focusedSlotId).map(slot => {
            const texts = slot.texts || [];
            const media = slot.media || [];
            const totalItems = texts.length + media.length;
            
            let cardHeight = 'h-138';
            if (totalItems > 3) cardHeight = 'h-141';
            if (totalItems > 6) cardHeight = 'h-163';
            if (totalItems > 9) cardHeight = 'h-168';
            
            return (
              <Card key={slot._id} className={`flex flex-col overflow-hidden ${cardHeight} bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all`}>
                {/* Slot Name in Middle - Header */}
                <CardHeader className="flex flex-col items-center justify-center text-center pb-4 flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="relative w-full">
                    {editingSlot === slot._id ? (
                      <Input 
                        value={editingSlotName}
                        onChange={e => setEditingSlotName(e.target.value)}
                        onBlur={() => updateSlotName(slot._id)}
                        onKeyDown={e => e.key === 'Enter' && updateSlotName(slot._id)}
                        className="text-2xl font-bold text-center mb-2 border-2 border-blue-500 bg-white"
                        autoFocus
                      />
                    ) : (
                      <CardTitle 
                        className={`text-2xl font-bold text-center mb-2 text-gray-800 ${!readOnlyMode ? 'cursor-pointer hover:text-blue-600' : ''}`} 
                        onClick={() => {
                          if (!readOnlyMode) {
                            setEditingSlot(slot._id);
                            setEditingSlotName(slot.name);
                          }
                        }}
                      >
                        {slot.name}
                      </CardTitle>
                    )}
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => setViewSlotModal(slot)}>
                        <Eye size={16} />
                      </Button>
                      {!readOnlyMode && (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => deleteSlot(slot._id)}>
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-sm text-gray-600">{media.length} media, {texts.length} texts</CardDescription>
                  
                  {/* Scheduled Email Display */}
                  {slot.scheduledEmail && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-blue-600" />
                          <div>
                            <p className="text-sm font-semibold text-blue-800">Scheduled for:</p>
                            <p className="text-lg font-bold text-blue-900">{slot.scheduledEmail}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => console.log('User liked scheduled email for:', slot.scheduledEmail)}
                        >
                          <ThumbsUp size={14} />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Add Content Buttons Row */}
                  <div className="grid grid-cols-3 gap-4 mb-2 flex-shrink-0">
                    {!readOnlyMode && (
                      <Button variant="outline" size="sm" onClick={() => {
                        setExpandedSlot(expandedSlot === slot._id ? null : slot._id);
                        setTimeout(() => document.getElementById(`text-input-${slot._id}`)?.focus(), 100);
                      }} className="text-xs h-8">
                        <MessageSquare size={12} className="mr-1" /> Text
                      </Button>
                    )}
                    {!readOnlyMode && (
                    <>
                    <Button variant="outline" size="sm" onClick={() => {
                      setExpandedSlot(expandedSlot === slot._id ? null : slot._id);
                      setTimeout(() => document.getElementById(`image-input-${slot._id}`)?.click(), 100);
                    }} className="text-xs h-8">
                      <ImageIcon size={12} className="mr-1" /> Image
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setExpandedSlot(expandedSlot === slot._id ? null : slot._id);
                      setTimeout(() => document.getElementById(`video-input-${slot._id}`)?.click(), 100);
                    }} className="text-xs h-8">
                      <VideoIcon size={12} className="mr-1" /> Video
                    </Button>
                    </>
                  )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
                  {/* Hidden file inputs */}
                  <input
                    id={`text-input-${slot._id}`}
                    type="text"
                    placeholder="Type your message..."
                    className="hidden"
                  />
                  <input
                    id={`image-input-${slot._id}`}
                    type="file"
                    accept="image/*"
                    onChange={e => addMedia(slot._id, e.target.files?.[0])}
                    className="hidden"
                  />
                  <input
                    id={`video-input-${slot._id}`}
                    type="file"
                    accept="video/*"
                    onChange={e => addMedia(slot._id, e.target.files?.[0])}
                    className="hidden"
                  />

                  {/* Content Display - Messages First, Then Media */}
                  <div className="flex-1 overflow-y-auto space-y-4">
                    {/* Messages Section - Always First */}
                    {texts.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          <MessageSquare size={14} />
                          Messages ({texts.length})
                        </h4>
                        <div className="space-y-2">
                          {texts.map(t => (
                            <div key={t._id} className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                              <p className="text-gray-800 text-sm leading-relaxed">{t.content}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(t.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Media Section - After Messages */}
                    {media.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <ImageIcon size={14} />
                          Photos & Videos ({media.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {media.map(m => (
                            <div key={m._id} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                {m.type === 'image' ? (
                                  <img 
                                    src={m.url} 
                                    alt="Media" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    onClick={() => window.open(m.url, '_blank')}
                                  />
                                ) : (
                                  <video 
                                    src={m.url} 
                                    className="w-full h-full object-cover"
                                    controls
                                    onClick={() => window.open(m.url, '_blank')}
                                  />
                                )}
                              </div>
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white" onClick={() => window.open(m.url, '_blank')}>
                                  <Eye size={12} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {texts.length === 0 && media.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No content yet. Add messages or media to get started!</p>
                      </div>
                    )}
                  </div>

                  {/* Add Content Section */}
                  {expandedSlot === slot._id && !readOnlyMode && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      {/* Text Input */}
                      <div className="mb-3">
                        <Input
                          id={`text-input-${slot._id}`}
                          placeholder="Type your message..."
                          value={newText[slot._id] || ''}
                          onChange={e => setNewText({ ...newText, [slot._id]: e.target.value })}
                          className="w-full"
                          onKeyPress={e => e.key === 'Enter' && addText(slot._id)}
                        />
                        <Button 
                          onClick={() => addText(slot._id)} 
                          size="sm" 
                          className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <MessageSquare size={14} className="mr-1" /> Add Message
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

      </div>
    </div>
  );
}
