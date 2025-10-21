"use client"
import VideoComponent from '@/app/components/video';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { getSeries } from '@/app/lib/dataSource/contentDataSource';
import { VideoFolderItem } from '@/app/lib/types';
import { InView } from '@/app/components/inView';

const Series: React.FC = () => {
  const [videos, setVideos] = useState<VideoFolderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const initialized = useRef(false);



  const onGetVideos = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const lastDoc = isLoadMore ? videos[videos.length - 1] : undefined;
      const _videos = await getSeries(lastDoc);
      
      if (_videos.length === 0) {
        setHasMore(false);
      } else {
        setVideos(prev => isLoadMore ? [...prev, ..._videos] : _videos);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [videos]);

  // Enhanced skeleton component with animation
  const SkeletonCard = ({ mode = 'grid' }: { mode?: 'grid' | 'list' }) => {
    if (mode === 'list') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-4 p-4 border border-border rounded-2xl bg-background"
        >
          <Skeleton className="w-40 h-24 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col space-y-3 p-4 border border-border rounded-2xl bg-background"
      >
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonCard key={i} mode={viewMode} />
      ))}
    </div>
  );

  // Filter videos based on search query
  const filteredVideos = videos.filter(video =>
    video.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.owner?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.content.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!initialized.current) {
      onGetVideos();
      initialized.current = true;
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
       

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SkeletonGrid />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Videos Grid/List */}
              {filteredVideos.length > 0 ? (
                <>
                  <div className={
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                      : "space-y-4"
                  }>
                    {filteredVideos.map((video, i) => (
                      <motion.div
                        key={`${video.content.contentId}-${i}`}
                        variants={itemVariants}
                        layout
                      >
                        <VideoComponent
                          video={video}
                          inFolder={true}
                          index={i}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Load More Section */}
                  {hasMore && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center pt-8"
                    >
                      <InView onView={() => onGetVideos(true)} />
                      {loadingMore && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 text-muted-foreground"
                        >
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                          <span>Loading more videos...</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </>
              ) : (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No videos found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery 
                      ? `No results for "${searchQuery}". Try different keywords.`
                      : 'No videos available at the moment.'
                    }
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                    >
                      Clear search
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* End of Content Message */}
        {!hasMore && videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">You've reached the end!</h3>
            <p className="text-muted-foreground">
              You've seen all {videos.length} videos. Check back later for more content.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Series;