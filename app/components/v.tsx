"use client"
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ContentFile, VideoFolderItem, VideoFolderPromotion, User, Episode } from '@/app/lib/types';
import { getEpisodeById, getFileContent, getVideoItem, onVerifyPaidContent, purchase } from '../lib/dataSource/contentDataSource';
import { RootState, useAppSelector } from '../lib/local/redux/store';
import { VideoPlayer } from './videoPlayer';
import { AppContext } from '../appContext';
import { firestoreTimestampToDate } from '../lib/config/timestamp';
import Image from 'next/image';
import { ThumbsDown, ThumbsUp, Download, Share, Lock, Heart, Loader, Play, Calendar, Eye, Check, PersonStanding } from 'lucide-react';
import { toast } from 'sonner';
import { Comments } from './commentSnippet';
import ExpandableComments from './expnandableComments';
import DownloadButton from './downloadButton';
import { motion, AnimatePresence } from 'framer-motion';
import { DefaultMovie } from '../lib/dataSource/global';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

const formatTime = (timeInSeconds: number) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const WatchPage: React.FC = () => {
  const router = useRouter();
  const { v } = useParams();
  const searchParams = useSearchParams()
  const isEpisode = searchParams.get("isEpisode");
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { videoManager } = useContext(AppContext)!;
  const { 
    currentPlayingVideo, 
    relatedVideos, 
    price, 
    requiresPayment, 
    currency, 
    isPaidContent, 
    likes, 
    handleLike, 
    isLiked, 
    download, 
    downloadProgress, 
    isDownloading, 
    views, 
    isSubscribing, 
    isSubscribed, 
    onSubscribe 
  } = videoManager;
  
  const [ui, setUi] = useState<number>(3);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants : any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const handleAvatarClick = (user: User) => {
    router.push(`/media/movies/collection/${user.userId}`);
  };

  const updateUi = useCallback(() => {
    setUi(prev => prev == 3 ? 2 : 3);
  }, [ui]);

  const handlePurchase = async () => {
    if (!currentPlayingVideo || !user) {
      toast.error('Please log in to purchase content');
      return;
    }

    if (!user || !user.userId || user.userId.length < 5) {
      router.push(`/login`);
      return;
    }

    setIsPurchasing(true);
    try {
      await videoManager.purchaseCurrentPlayingVideo();
      setShowPurchaseModal(false);
      toast.success('Purchase successful!');
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const getVideo = async () => {
    if (v) {
       
      let _item : Episode | VideoFolderItem | null 
      if((isEpisode || "")?.length > 0){
        _item = await getEpisodeById(v as string,user);
      }else{
        
       _item = await getVideoItem(v as string, user) 
      }
      if (_item) {
        if(!_item.content){
          _item.content = DefaultMovie
        }
        await videoManager.directPlay(_item);
        videoManager.onUpdateUi();
      }
    }

  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const onStartPlay = useCallback((item: VideoFolderItem) => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/media/movies/play/${item.content.contentId}`);
    }
  }, [videoManager]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  const handleShare = async () => {
    if (!currentPlayingVideo) return;
    
    const shareUrl = `${window.location.origin}/media/movies/play/${currentPlayingVideo.content.contentId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPlayingVideo.content.title,
          text: `Check out "${currentPlayingVideo.content.title}" by ${currentPlayingVideo.owner.name}`,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  useEffect(() => {
    videoManager.user = user;
    videoManager._updateui = updateUi;
    videoManager.onStartPlay = onStartPlay;
    getVideo();
  }, [v]);

  if (!currentPlayingVideo) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading video...</p>
        </motion.div>
      </div>
    );
  }

  const actionButtons = [
    {
      id: 1,
      icon: (
        <motion.div
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Heart 
            fill={isLiked ? "#ff3b30" : "none"}
            stroke={isLiked ? "#ff3b30" : "currentColor"}
            className={`transition-colors duration-200 ${
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
            }`}
          />
        </motion.div>
      ),
      label: 'Like',
      count: likes,
      onClick: async () => await handleLike(currentPlayingVideo, user)
    },
    {
      id: 2,
      icon: (
        <motion.div whileTap={{ scale: 0.95 }}>
          <Share className="text-muted-foreground hover:text-foreground transition-colors" />
        </motion.div>
      ),
      label: 'Share',
      onClick: handleShare
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen h-full w-full bg-background text-foreground"
    >
      <AnimatePresence>
        {showPurchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-background rounded-2xl   w-full border border-border shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Premium Content</h3>
                <p className="text-muted-foreground">
                  Purchase to unlock this content permanently
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{currentPlayingVideo.content.title}</span>
                  <span className="text-2xl font-bold text-primary">{price} {currency}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Lifetime access</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPurchaseModal(false)}
                  disabled={isPurchasing}
                  className="flex-1 px-4 py-3 border border-border rounded-xl hover:bg-muted transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 font-medium flex items-center justify-center gap-2 transition-all"
                >
                  {isPurchasing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Purchase Now'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className=" mx-auto   pt-4 pb-8 w-full">
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 w-full">
          <div className="flex-1 ">
            <motion.div variants={itemVariants} className="aspect-video h-[24rem]  overflow-auto w-full shadow-2xl relative">
              {currentPlayingVideo && requiresPayment && !isPaidContent ? (
                <div className="w-full h-full flex flex-col items-center justify-center  text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full"
                  >
                    <Lock className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-3">Premium Content</h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      This content requires purchase to watch
                    </p>
                    <div className="text-3xl font-bold text-primary mb-6">
                      {price} {currency}
                    </div>
                    <button 
                      onClick={() => setShowPurchaseModal(true)}
                      className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all text-lg shadow-lg hover:shadow-xl"
                    >
                      Purchase to Watch
                    </button>
                  </motion.div>
                </div>
              ) : (
                <div className='w-full h-full bg-black'><VideoPlayer className='rounded-none w-full'/></div>
              )}
            </motion.div>

            <motion.div variants={containerVariants} className="mt-6 lg:mt-8 space-y-6">
              <motion.div variants={itemVariants} className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight flex-1">
                  {currentPlayingVideo.content?.title}
                </h1>
                {requiresPayment && (
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                    isPaidContent 
                      ? 'bg-green-500/20 text-green-600 border border-green-500/30' 
                      : 'bg-primary/20 text-primary border border-primary/30'
                  }`}>
                    {isPaidContent ? 'Purchased' : 'Premium'}
                  </div>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(views)} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatTimeAgo(new Date((currentPlayingVideo.content?.releaseDate || new Date()) as any))}</span>
                  </div>
                  {requiresPayment && (
                    <div className="flex items-center gap-1 font-semibold text-primary">
                      <span>•</span>
                      <span>{price} {currency}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {actionButtons.map((action) => (
                    <motion.button
                      key={action.id}
                      onClick={action.onClick}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-muted transition-all duration-200"
                    >
                      {action.icon}
                      <span className="text-sm font-medium hidden sm:inline-block">{action.label}</span>
                      {action.count !== undefined && (
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">
                          {formatNumber(action.count)}
                        </span>
                      )}
                    </motion.button>
                  ))}
                  <DownloadButton download={download} isDownloading={isDownloading} progress={downloadProgress} />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border">
                <div 
                  onClick={() => handleAvatarClick(currentPlayingVideo.owner)}
                  className="flex items-center gap-4 cursor-pointer group flex-1"
                >
                  <div className="relative">
                    {/* <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={currentPlayingVideo.owner?.avatar || "/default-avatar.png"}
                      alt={currentPlayingVideo.owner?.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-border group-hover:border-primary transition-colors"
                    /> */}
                    <Avatar>
                      <AvatarImage src={currentPlayingVideo.owner?.avatar}/>
                      <AvatarFallback>
                        <PersonStanding/>
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {currentPlayingVideo.owner?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">1.2M subscribers</p>
                  </div>
                </div>

                <motion.button
                  disabled={isSubscribing}
                  onClick={onSubscribe}
                  whileHover={{ scale: isSubscribing ? 1 : 1.05 }}
                  whileTap={{ scale: isSubscribing ? 1 : 0.95 }}
                  className={`
                    px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border min-w-[120px]
                    ${isSubscribed
                      ? 'bg-transparent border-border text-foreground hover:bg-muted'
                      : 'bg-primary border-primary text-primary-foreground hover:bg-primary/90'
                    }
                    ${isSubscribing ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  {isSubscribing ? (
                    <div className="flex items-center gap-2 justify-center">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Processing...</span>
                    </div>
                  ) : isSubscribed ? (
                    'Subscribed'
                  ) : (
                    'Subscribe'
                  )}
                </motion.button>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-muted/30 rounded-2xl p-6">
                <div className={`prose prose-sm max-w-none ${isDescriptionExpanded ? '' : 'line-clamp-3'}`}>
                  <p className="text-foreground whitespace-pre-line leading-relaxed">
                    {currentPlayingVideo.content?.description || 'No description available.'}
                  </p>
                </div>
                {currentPlayingVideo.content?.description && currentPlayingVideo.content.description.length > 200 && (
                  <button
                    onClick={toggleDescription}
                    className="text-primary hover:text-primary/80 font-medium text-sm mt-3 transition-colors"
                  >
                    {isDescriptionExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <ExpandableComments item={currentPlayingVideo as any} />
              </motion.div>
            </motion.div>
          </div>

          <motion.div 
            variants={itemVariants}
            className="xl:w-96 w-full flex-shrink-0"
          >
            <div className="sticky top-4">
              <h2 className="text-xl font-bold mb-6 text-foreground pb-4 border-b border-border">
                Related Videos
              </h2>
              <div className="space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                {relatedVideos.map((video, i) => {
                  const relatedPrice = video.total || video.price?.price || 0;
                  const requiresRelatedPayment = relatedPrice > 0;
                  const isRelatedPaid = video.isPaid;
                  
                  return (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => await videoManager.directPlay(video)} 
                      key={video.content.contentId || i} 
                      className="flex gap-4 p-4 rounded-2xl hover:bg-muted/50 cursor-pointer group transition-all duration-200 border border-transparent hover:border-border"
                    >
                      <div className="relative flex-shrink-0 w-40 h-24">
                        <Image 
                          alt={video.content.title || 'Related video'} 
                          src={video.content.thumbnail || video.folderPoster || "/images/tv.jpg"} 
                          fill
                          className="rounded-xl object-cover group-hover:rounded-lg transition-all duration-200"
                          sizes="160px"
                        />
                        {requiresRelatedPayment && !isRelatedPaid && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                            {relatedPrice} {video.price?.currency || 'USD'}
                          </div>
                        )}
                        {video.content.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-1.5 py-0.5 rounded">
                            {formatTime(video.content.duration)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-xl flex items-center justify-center">
                          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="white" />
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1 py-1">
                        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                          {video.content.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          {video.owner.name}
                          {video.owner && (
                            <Check className="w-3 h-3 text-primary" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatNumber((video as any).content.listens || 0)} views • {formatTimeAgo(new Date(video.content.releaseDate as any))}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default WatchPage;