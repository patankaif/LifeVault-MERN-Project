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

export default function PresentVault() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
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
        {!readOnlyMode && (
          <div className="mb-6">
            <Button 
              onClick={() => setShowAddSlot(!showAddSlot)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
            >
              <Plus size={20} className="mr-2" />
              Create New Memory
            </Button>
          </div>
        )}

        {/* Add Slot Form */}
        {showAddSlot && (
          <Card className="mb-6 border-none shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex gap-2">
                <Input 
                  placeholder="Memory name..." 
                  value={newSlotName} 
                  onChange={e => setNewSlotName(e.target.value)} 
                  className="flex-1"
                />
                <Button onClick={createSlot}>
                  <Plus size={18} className="mr-2" />Add
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slots.map(slot => {
            const texts = slot.texts || [];
            const media = slot.media || [];
            
            return (
              <Card key={slot._id} className="flex flex-col overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
                {/* Header with Slot Name */}
                <CardHeader className="flex flex-col items-center justify-center text-center pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
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
                        className="text-2xl font-bold text-center mb-2 text-gray-800 cursor-pointer hover:text-blue-600" 
                        onClick={() => {
                          setEditingSlot(slot._id);
                          setEditingSlotName(slot.name);
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
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 w-full mt-3">
                    {!readOnlyMode && (
                      <Button variant="outline" size="sm" onClick={() => {
                        setExpandedSlot(expandedSlot === slot._id ? null : slot._id);
                        setTimeout(() => document.getElementById(`text-input-${slot._id}`)?.focus(), 100);
                      }} className="text-xs">
                        <MessageSquare size={12} className="mr-1" /> Text
                      </Button>
                    )}
                    {!readOnlyMode && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => {
                          setExpandedSlot(expandedSlot === slot._id ? null : slot._id);
                          setTimeout(() => document.getElementById(`image-input-${slot._id}`)?.click(), 100);
                        }} className="text-xs">
                          <ImageIcon size={12} className="mr-1" /> Image
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setExpandedSlot(expandedSlot === slot._id ? null : slot._id);
                          setTimeout(() => document.getElementById(`video-input-${slot._id}`)?.click(), 100);
                        }} className="text-xs">
                          <VideoIcon size={12} className="mr-1" /> Video
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>

                {/* Content Area */}
                <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
                  {/* Hidden Inputs */}
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

                  {/* Messages Section */}
                  {texts.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <MessageSquare size={14} />
                        Messages ({texts.length})
                      </h4>
                      <div className="space-y-2">
                        {texts.map(t => (
                          <div key={t._id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-gray-800 text-sm">{t.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(t.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Media Section */}
                  {media.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <ImageIcon size={14} />
                        Photos & Videos ({media.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {media.map(m => (
                          <div key={m._id} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            {m.type === 'image' ? (
                              <img 
                                src={m.url} 
                                alt="Media" 
                                className="w-full h-full object-cover"
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
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Content Area */}
                  {expandedSlot === slot._id && !readOnlyMode && (
                    <div className="border-t pt-3 mt-auto">
                      <Input
                        placeholder="Type your message..."
                        value={newText[slot._id] || ''}
                        onChange={e => setNewText({ ...newText, [slot._id]: e.target.value })}
                        className="w-full mb-2"
                        onKeyPress={e => e.key === 'Enter' && addText(slot._id)}
                      />
                      <Button onClick={() => addText(slot._id)} size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        <MessageSquare size={14} className="mr-1" /> Add Message
                      </Button>
                    </div>
                  )}

                  {/* Empty State */}
                  {texts.length === 0 && media.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No content yet. Add messages or media to get started!</p>
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
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No memories yet</h3>
            <p className="text-gray-500 mb-6">Create your first memory to get started</p>
            <Button onClick={() => setShowAddSlot(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus size={20} className="mr-2" />
              Create First Memory
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
