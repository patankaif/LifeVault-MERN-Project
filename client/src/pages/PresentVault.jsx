import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/lib/authFetch';
import { Button } from '@/components/ui/button';
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
  const query = new URLSearchParams(location.split('?')[1] || '');
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
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [editingText, setEditingText] = useState(null);
  const [newText, setNewText] = useState({});
  const [uploadingMedia, setUploadingMedia] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editingSlotName, setEditingSlotName] = useState('');
  const [viewSlotModal, setViewSlotModal] = useState(null);
  const focusedSlotId = query.get('slot');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      fetchSlots();
    }
  }, [isAuthenticated, navigate, authLoading]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/vaults/present/slots');
      const data = await response.json();
      if (data.success) {
        setSlots(data.slots || []);
      } else {
        setError(data.message || 'Failed to fetch slots');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createSlot = async () => {
    if (!newSlotName.trim()) return;
    try {
      const response = await authFetch('/api/vaults/present/slots', {
        method: 'POST',
        body: JSON.stringify({ name: newSlotName }),
      });
      const data = await response.json();
      if (data.success) {
        setSlots([...slots, data.slot]);
        setNewSlotName('');
        setShowAddSlot(false);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const response = await authFetch(`/api/slots/${slotId}`, {
        method: 'DELETE',
        body: JSON.stringify({ vaultType: 'present' }),
      });
      const data = await response.json();
      if (data.success) {
        fetchSlots();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
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

  const addMedia = async (slotId, file) => {
    if (!file) return;
    try {
      setUploadingMedia(slotId);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const response = await authFetch(`/api/slots/${slotId}/media`, {
            method: 'POST',
            body: JSON.stringify({
              file: e.target.result,
              mediaType: file.type.startsWith('image/') ? 'image' : 'video'
            }),
          });
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
            setError(data.message);
          }
        } catch (fetchError) {
          setError('Upload failed. Please try again.');
        } finally {
          setUploadingMedia(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message || 'Failed to upload media');
      setUploadingMedia(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Present Vault</h1>
          <p className="text-gray-600">Share memories instantly with your loved ones</p>
        </div>

        {/* Add Slot Button */}
        <div className="mb-6">
          <AnimatedButton 
            onClick={() => setShowAddSlot(!showAddSlot)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3"
          >
            <Plus size={20} className="mr-2" />
            Create New Memory
          </AnimatedButton>
        </div>

        {/* Add Slot Form */}
        {showAddSlot && (
          <Card className="mb-6 border-none shadow-xl bg-white ring-1 ring-slate-200">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg">Create Instant Memory</CardTitle>
              <CardDescription>Share something special right now</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-2">
                <Input 
                  placeholder="Memory name..." 
                  value={newSlotName} 
                  onChange={e => setNewSlotName(e.target.value)} 
                  className="flex-1"
                />
                <AnimatedButton onClick={createSlot}>
                  <Plus size={18} className="mr-2" />Add
                </AnimatedButton>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
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
              <Card key={slot._id} className={`flex flex-col overflow-hidden ${cardHeight}`}>
                <CardHeader className="flex flex-col items-center justify-center text-center pb-2 flex-shrink-0">
                  <div className="relative w-full">
                    {editingSlot === slot._id ? (
                      <Input 
                        value={editingSlotName}
                        onChange={e => setEditingSlotName(e.target.value)}
                        onBlur={() => updateSlotName(slot._id)}
                        onKeyDown={e => e.key === 'Enter' && updateSlotName(slot._id)}
                        className="text-xl font-bold text-center mb-2 border-2 border-blue-500"
                        autoFocus
                      />
                    ) : (
                      <CardTitle 
                        className="text-xl font-bold text-center mb-2 cursor-pointer hover:text-blue-600" 
                        onClick={() => {
                          setEditingSlot(slot._id);
                          setEditingSlotName(slot.name);
                        }}
                      >
                        {slot.name}
                      </CardTitle>
                    )}
                    <div className="flex gap-2 absolute top-0 right-0">
                      <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => setViewSlotModal(slot)}>
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => deleteSlot(slot._id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-sm mb-3">{media.length} media, {texts.length} texts</CardDescription>
                  
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
                    <Button variant="outline" size="sm" onClick={() => {
                      setExpandedSlot(expandedSlot === slot._id ? null : slot._id);
                      setTimeout(() => document.getElementById(`text-input-${slot._id}`)?.focus(), 100);
                    }} className="text-xs h-8">
                      <MessageSquare size={12} className="mr-1" /> Text
                    </Button>
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

                  {/* Content Display Area - Unified Grid like FutureVault */}
                  <div className={`flex-1 space-y-3 ${totalItems > 9 ? 'overflow-y-auto' : ''}`}>
                    {totalItems > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-xs text-gray-600">Content</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {/* Render text items */}
                          {texts.slice(0, 9).map(t => (
                            <div key={t._id} className="relative group bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200 h-24 flex flex-col justify-between hover:shadow-md transition-all duration-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="bg-blue-100 p-1.5 rounded-full">
                                    <MessageSquare className="text-blue-600" size={10} />
                                  </div>
                                  <span className="text-xs text-gray-500 font-medium">Text</span>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Delete text functionality if needed
                                  }} 
                                  className="opacity-0 group-hover:opacity-100 transition-all duration-200"
                                >
                                  <div className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                                    <Trash2 size={8} />
                                  </div>
                                </button>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed line-clamp-3 break-all flex-1">{t.content}</p>
                            </div>
                          ))}
                          
                          {/* Render media items */}
                          {media.slice(0, 9).map(m => (
                            <div key={m._id} className="relative group cursor-pointer" onClick={() => setExpandedSlot(expandedSlot === slot._id ? null : slot._id)}>
                              <div className="h-24 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100 hover:border-blue-300 transition-all">
                                {m.type === 'image' ? (
                                  <div className="relative w-full h-full">
                                    <img 
                                      src={m.url} 
                                      className="w-full h-full object-cover" 
                                      alt="Media"
                                      onLoad={() => console.log('Image loaded successfully:', m.url)}
                                      onError={(e) => {
                                        console.error('Image failed to load:', m.url, e);
                                        e.target.style.backgroundColor = '#ff0000';
                                      }}
                                    />
                                    <div className="absolute top-2 right-2 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center p-1 rounded-full opacity-0 group-hover:opacity-100">
                                      <ImageIcon size={16} className="text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative w-full h-full">
                                    <video 
                                      src={m.url} 
                                      className="w-full h-full object-cover"
                                      muted
                                      controls={false}
                                      onMouseEnter={(e) => e.target.play()}
                                      onMouseLeave={(e) => e.target.pause()}
                                      onError={(e) => {
                                        console.error('Video failed to load:', m.url, e);
                                        e.target.style.backgroundColor = '#ff0000';
                                      }}
                                    />
                                    <div className="absolute top-2 right-2 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center p-1 rounded-full opacity-0 group-hover:opacity-100">
                                      <VideoIcon size={16} className="text-white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Delete media functionality if needed
                                }} 
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {/* Show more indicator if content exceeds 9 items */}
                        {totalItems > 9 && (
                          <div className="h-20 bg-gray-50 rounded border border-gray-200 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-xs text-gray-500">+{totalItems - 9}</div>
                              <div className="text-xs text-gray-500">more</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Empty State */
                      <div className="text-center py-8 text-gray-400">
                        <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No content yet. Add messages or media to get started!</p>
                      </div>
                    )}
                  </div>

                  {/* Add Content Section */}
                  {expandedSlot === slot._id && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="space-y-3">
                        <Input
                          id={`text-input-${slot._id}`}
                          placeholder="Type your message..."
                          value={newText[slot._id] || ''}
                          onChange={e => setNewText({ ...newText, [slot._id]: e.target.value })}
                          className="w-full"
                          onKeyPress={e => e.key === 'Enter' && addText(slot._id)}
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => addText(slot._id)} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                            <MessageSquare size={14} className="mr-1" /> Add Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State for No Slots */}
        {slots.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50">
                <Package className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No memories yet</h3>
              <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
                Start creating your first instant memory to share with someone special.
              </p>
            </div>
            <AnimatedButton 
              onClick={() => setShowAddSlot(true)} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 text-lg shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              Create First Memory
            </AnimatedButton>
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-16 border-none shadow-sm bg-emerald-50/50 border border-emerald-100">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <Info size={20} />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900">About Present Vault</h4>
              <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
                The Present Vault is for memories you want to share right now. Unlike the Future Vault, there's no long-term scheduling required. Simply add your content, set a recipient, and send it instantly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
