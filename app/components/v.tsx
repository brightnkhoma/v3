"use client"
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ContentFile, VideoFolderItem, VideoFolderPromotion, User } from '@/app/lib/types';
import { getFileContent, getVideoItem, onVerifyPaidContent, purchase } from '../lib/dataSource/contentDataSource';
import { RootState, useAppSelector } from '../lib/local/redux/store';
import { VideoPlayer } from './videoPlayer';
import { AppContext } from '../appContext';
import { firestoreTimestampToDate } from '../lib/config/timestamp';
import Image from 'next/image';
import {ThumbsDown,ThumbsUp, Download, Share, Lock, Heart, Loader} from 'lucide-react'
import { toast } from 'sonner';
import { Comments } from './commentSnippet';
import ExpandableComments from './expnandableComments';
import DownloadButton from './downloadButton';

const formatTime = (timeInSeconds: number) => {
  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const WatchPage: React.FC = () => {
  const router = useRouter();
  const { v } = useParams();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { videoManager } = useContext(AppContext)!;
  const { currentPlayingVideo, relatedVideos,price,requiresPayment, currency,isPaidContent ,likes,handleLike,isLiked,download,downloadProgress,isDownloading,views,isSubscribing,isSubscribed,onSubscribe} = videoManager;
  const [ui, setUi] = useState<number>(3);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);

  const handleAvatarClick = (user : User)=>{
    router.push(`/media/movies/collection/${user.userId}`)
  }

 


  






  const updateUi = useCallback(() => {
    setUi(prev => prev == 3 ? 2 : 3);
  }, [ui]);

  const handlePurchase = async () => {
    if (!currentPlayingVideo || !user) {
      toast.error('Please log in to purchase content');
      return;
    }

    if(!user || !user.userId || user.userId.length < 5){
      router.push(`/login`)
    }

    setIsPurchasing(true);

    try {
      await videoManager.purchaseCurrentPlayingVideo();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const getVideo = async () => {
    if (v) {
      const _item = await getVideoItem(v as string, user);
      if (_item) {
        await videoManager.directPlay(_item);
        videoManager.onUpdateUi()
      }
    }
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

    const onStartPlay = useCallback((item : VideoFolderItem)=>{
    if(typeof window != undefined){
    window.history.replaceState(null, "", `/media/movies/play/${item.content.contentId}`);
    }
  },[videoManager])
  
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
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  useEffect(() => {
    videoManager.user = user
    videoManager._updateui = updateUi;
    videoManager.onStartPlay = onStartPlay
    getVideo();
  }, [v]);


  const handleShare = async () => {
    if(!currentPlayingVideo) return;
    if (navigator.share) {
      try {
        const uri = window.location.href.split("/") 
        const uri1 = uri.slice(0,uri.length-1).join("/") + "/" + currentPlayingVideo.content.contentId
        await navigator.share({
          title: "Check out this Video from" +   currentPlayingVideo.owner.name || "",
          text: "Listen to this awesome Video! \n" + currentPlayingVideo.content.title,
          url: uri1, 
        });
        console.log("Shared successfully!");
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Sharing not supported on this browser, please copy the link manually.");
    }
  };

  if (!currentPlayingVideo) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }



  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-200">
      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Purchase Content</h3>
            <p className="text-muted-foreground mb-4">
              Purchase "{currentPlayingVideo.content.title}" for {price} {currency}
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowPurchaseModal(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                disabled={isPurchasing}
              >
                Cancel
              </button>
              <button 
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {isPurchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  'Purchase'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 w-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
          {/* Video Player Section */}
          <div className="flex-1 w-full">
            {/* Video Player */}
            <div className="aspect-video bg-black text-gray-50 rounded-xl overflow-hidden w-full shadow-lg relative">
              {currentPlayingVideo && requiresPayment && !isPaidContent ? (
                <div className="w-full h-full flex flex-col items-center justify-center ">
                  <Lock className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
                  <p className="text-muted-foreground mb-4 text-center">
                    This content requires purchase to watch
                  </p>
                  <div className="text-2xl font-bold text-green-50 mb-4 ">
                    {price} {currency}
                  </div>
                  <button 
                    onClick={() => setShowPurchaseModal(true)}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90"
                  >
                    Purchase Now
                  </button>
                </div>
              ) : (
                <VideoPlayer />
              )}
            </div>

            {/* Price Display */}
            {requiresPayment && (
              <div className="mt-4 flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {isPaidContent ? 'Purchased' : 'Premium Content'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {price} {currency}
                  </div>
                  {!isPaidContent && (
                    <button 
                      onClick={() => setShowPurchaseModal(true)}
                      className="text-sm text-primary hover:text-primary/80 font-medium mt-1"
                    >
                      Purchase to watch
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Video Info */}
            <div className="mt-4 lg:mt-6">
              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3 leading-tight">
                {currentPlayingVideo?.content.title}
                {requiresPayment && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    Premium
                  </span>
                )}
              </h1>

              {/* Stats and Actions */}
              <div className="flex  flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 mb-4">
                <div className="flex flex-row items-center space-x-4 text-sm text-muted-foreground">
                  <span>{formatNumber(views)} views</span>
                  <span>•</span>
                  <span>
                    {formatTimeAgo(new Date((
                      (currentPlayingVideo?.content.releaseDate || new Date()) as any
                    )))}
                  </span>
                  {requiresPayment && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-primary">
                        {price} {currency}
                      </span>
                    </>
                  )}
                </div>

               <div className='w-full flex flex-row  items-center justify-between'>
                {[
  { 
    id: 1, 
    icon:  <Heart 
    fill={isLiked ? "#ff3b30" : "white"} 
    className={`transition-all duration-300 ease-in-out ${
      isLiked 
        ? "scale-110" 
        : "scale-100 hover:scale-110 hover:text-gray-600"
    }`}
  />, 
    label: 'Like', 
    count: likes,
    onClick: async () => await handleLike(currentPlayingVideo, user)
  },
  { id: 3, icon: <Share />, label: 'Share', onClick: handleShare },
  // { id: 4, icon: <DownloadButton downLoad={download} isDownloading = {isDownloading} progress={downloadProgress} />, label: 'Save', onClick: handleSave }
].map((action) => (
  <button
    key={action.id}
    onClick={action.onClick}
    className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-muted"
  >
    <div className="w-5 h-5 flex items-center justify-center">
      {action.icon}
    </div>
    <span className="text-sm font-medium hidden sm:inline-block">{action.label}</span>
    {action.count !== undefined && (
      <span className="text-sm text-muted-foreground hidden sm:inline-block">
        {action.count}
      </span>
    )}
  </button>
))}
<DownloadButton download={download} isDownloading = {isDownloading} progress={downloadProgress} />
               </div>
              </div>

              {/* Channel Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border mb-4">
                <div className="flex items-center space-x-3">
                  <div onClick={()=>handleAvatarClick(currentPlayingVideo.owner)} className="relative">
                    <img
                      src={currentPlayingVideo?.owner?.avatar || "https://cdn-icons-png.freepik.com/512/5951/5951752.png"}
                      alt={currentPlayingVideo?.owner?.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-border"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{currentPlayingVideo?.owner?.name}</h3>
                    <p className="text-sm text-muted-foreground">1.2M subscribers</p>
                  </div>
                </div>
               <button
  disabled={isSubscribing}
  onClick={onSubscribe}
  className={`
    relative
    px-4 py-2
    rounded-full
    font-medium
    text-sm
    transition-all
    duration-200
    border
    min-h-[36px]
    min-w-[100px]
    flex items-center justify-center
    gap-2
    group
    ${
      isSubscribed
        ? `
          bg-transparent
          border-border
          text-foreground
          hover:bg-muted/50
          dark:hover:bg-muted/20
          hover:border-muted-foreground/30
        `
        : `
          bg-primary
          border-primary
          text-primary-foreground
          hover:bg-primary/90
          active:bg-primary/80
        `
    }
    ${
      isSubscribing 
        ? "opacity-80 cursor-not-allowed" 
        : "hover:shadow-md active:scale-95"
    }
    disabled:opacity-80 
    disabled:cursor-not-allowed
    focus:outline-none 
    focus:ring-2 
    focus:ring-ring 
    focus:ring-offset-2
    focus:ring-offset-background
  `}
  aria-live="polite"
  aria-label={isSubscribed ? "Unsubscribe" : "Subscribe"}
>
  {isSubscribing ? (
    <>
      <div className="flex items-center gap-2">
        <Loader className="animate-spin" size={16} />
        <span className="text-xs opacity-90">
          {isSubscribed ? "Unsubscribing" : "Subscribing"}
        </span>
      </div>
    </>
  ) : (
    <span className="flex items-center gap-1">
      {isSubscribed ? (
        <>
          <span>Subscribed</span>
          <svg 
            className="w-4 h-4 opacity-70 group-hover:opacity-100" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </>
      ) : (
        "Subscribe"
      )}
    </span>
  )}
</button>
              </div>

              {/* Description */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className={`${isDescriptionExpanded ? '' : 'max-h-20 overflow-hidden'}`}>
                  <p className="text-sm text-foreground whitespace-pre-line">
                    {currentPlayingVideo?.content.description || 'No description available.'}
                  </p>
                </div>
                {currentPlayingVideo?.content.description && 
                 currentPlayingVideo.content.description.length > 200 && (
                  <button
                    onClick={toggleDescription}
                    className="text-primary hover:text-primary/80 font-medium text-sm mt-2"
                  >
                    {isDescriptionExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
              <ExpandableComments item={currentPlayingVideo as any}/>
              
            </div>
          </div>

          {/* Related Videos Sidebar */}
          <div className="lg:w-96 w-full flex-1">
            <h2 className="text-lg font-semibold mb-4 text-foreground sticky top-4 bg-background/80 backdrop-blur-sm py-2 z-10">
              Related videos
            </h2>
            <div className="space-y-3 max-h-screen overflow-y-auto pb-8">
              {relatedVideos.map((video, i) => {
                const relatedPrice = video.price?.price || 0;
                const requiresRelatedPayment = relatedPrice > 0;
                const isRelatedPaid = video.isPaid;
                
                return (
                  <div 
                    onClick={async () => await videoManager.directPlay(video)} 
                    key={video.content.contentId || i} 
                    className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer group relative"
                  >
                    {requiresRelatedPayment && !isRelatedPaid && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        {relatedPrice} {video.price?.currency || 'USD'}
                      </div>
                    )}
                    <div className="relative flex-shrink-0 w-40 h-24">
                      <Image 
                        alt={video.content.title || 'Related video'} 
                        src={video.content.thumbnail || video.folderPoster || "/images/f.jpg"} 
                        fill
                        className="rounded-lg object-cover"
                        sizes="(max-width: 768px) 160px, 240px"
                      />
                      {video.content.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                          {formatTime(video.content.duration)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <h3 className="text-sm font-semibold line-clamp-2">
                        {video.content.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        {video.owner.name}
                        {video.owner && (
                          <span className="ml-1 text-primary">
                            <svg  xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatNumber((video as any).content.listens || 0)} views • {formatTimeAgo(new Date(video.content.releaseDate as any))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;