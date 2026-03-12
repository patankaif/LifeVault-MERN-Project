import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, CheckCircle2, Calendar, Clock, Mail, 
  Heart, Image as ImageIcon, Video as VideoIcon, MessageSquare,
  Download, ExternalLink, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SharedVault() {
  const [match, params] = useRoute('/shared-vault/:token');
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('SharedVault useEffect - match:', match, 'params:', params);
    if (params?.token) {
      console.log('Token found, fetching shared slot...');
      fetchSharedSlot(params.token);
    } else {
      console.log('No token found in URL');
      setLoading(false);
    }
  }, [params?.token]);

  const fetchSharedSlot = async (token) => {
    try {
      console.log('Fetching shared slot with token:', token);
      const response = await fetch(`/api/shared-vault/${token}`);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setSlot(data.slot);
      } else {
        setError(data.message || 'Shared slot not found or link expired');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading shared memory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
              <div>
                <p className="font-semibold text-red-600">Error</p>
                <p className="text-gray-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Shared Memory
              </h1>
              <p className="text-gray-600 mt-1">A precious memory has been shared with you 💝</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {slot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold mb-2">{slot.name}</CardTitle>
                    <CardDescription className="text-purple-100 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created {new Date(slot.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                      {slot.delivered && (
                        <Badge variant="secondary" className="bg-green-500 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Delivered
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                {/* Media Section */}
                {slot.media && slot.media.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <ImageIcon className="h-5 w-5 text-purple-600" />
                      <h3 className="text-xl font-semibold text-gray-800">
                        Photos & Videos ({slot.media.length})
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AnimatePresence>
                        {slot.media.map((media, index) => (
                          <motion.div
                            key={media._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                            className="group relative"
                          >
                            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                              <div className="relative aspect-video bg-gray-100">
                                {media.type === 'image' ? (
                                  <>
                                    <img
                                      src={media.url}
                                      alt="Shared memory"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                                        <Button size="sm" variant="secondary" asChild>
                                          <a href={media.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                          </a>
                                        </Button>
                                        <Button size="sm" variant="secondary" asChild>
                                          <a href={media.url} download>
                                            <Download className="h-4 w-4" />
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <video
                                    src={media.url}
                                    controls
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    {media.type === 'image' ? (
                                      <><ImageIcon className="h-3 w-3 mr-1" /> Photo</>
                                    ) : (
                                      <><VideoIcon className="h-3 w-3 mr-1" /> Video</>
                                    )}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(media.uploadedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {slot.media && slot.media.length > 0 && slot.texts && slot.texts.length > 0 && (
                  <Separator className="my-8" />
                )}

                {/* Text Section */}
                {slot.texts && slot.texts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                      <h3 className="text-xl font-semibold text-gray-800">
                        Messages ({slot.texts.length})
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      <AnimatePresence>
                        {slot.texts.map((text, index) => (
                          <motion.div
                            key={text._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-sm">
                              <CardContent className="p-6">
                                <p className="text-gray-800 leading-relaxed text-lg">{text.content}</p>
                                <div className="flex items-center justify-between mt-4">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(text.createdAt).toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  <Heart className="h-4 w-4 text-red-500" />
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {(!slot.media || slot.media.length === 0) && (!slot.texts || slot.texts.length === 0) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
                      <Gift className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Empty Memory Slot</h3>
                    <p className="text-gray-600">This memory slot is waiting to be filled with precious moments 💝</p>
                  </motion.div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-4">
                      This memory was shared with you from Life Vault
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://lifevault-api-cmmw.onrender.com" target="_blank" rel="noopener noreferrer">
                          <Gift className="h-4 w-4 mr-2" />
                          Create Your Own Life Vault
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
