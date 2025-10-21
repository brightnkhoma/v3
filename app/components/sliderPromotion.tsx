import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, ChevronLeft, ChevronRight, Heart, Share, MoreHorizontal, Clock, Headphones } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MusicFolderItem, PromotionGroup } from '../lib/types';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface SliderPromotionProps {
  group: PromotionGroup;
  autoSlideInterval?: number;
  className?: string;
}

// Icons for dropdown
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Album = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const MusicIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

export const SliderPromotion: React.FC<SliderPromotionProps> = ({
  group,
  autoSlideInterval = 7000,
  className = ''
}) => {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const router = useRouter();

  console.log('🎠 SliderPromotion received group:', group);
  console.log('🎠 Group items:', group?.items);

  const items = React.useMemo(() => {
    if (!group?.items) {
      console.log('❌ No items found in group');
      return [];
    }
    
    const validItems = group.items
      .slice(0, 5)
      .filter(item => {
        const hasContent = item?.content || item?.folderPoster;
        const hasTitle = item?.content?.title || item?.folderName;
        console.log('🔍 Item validation:', { 
          item, 
          hasContent, 
          hasTitle,
          content: item?.content,
          folderPoster: item?.folderPoster 
        });
        return hasContent && hasTitle;
      });
    
    console.log('✅ Valid slider items:', validItems.length, validItems);
    return validItems;
  }, [group?.items]);

  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;

    setProgress(0);
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / autoSlideInterval) * 100;
      setProgress(newProgress);

      if (elapsed >= autoSlideInterval) {
        setCurrentSlide((prev) => (prev + 1) % items.length);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, items.length, autoSlideInterval, currentSlide]);

  useEffect(() => {
    if (items.length === 0) {
      setIsLoading(false);
      return;
    }

    const preloadImages = async () => {
      setIsLoading(true);
      const imagePromises = items.map((item, index) => {
        return new Promise((resolve) => {
          const imageUrl = item.content?.thumbnail || item.folderPoster || '/images/default-cover.png';
          console.log(`🖼️ Preloading image ${index}:`, imageUrl);
          
          const img = new window.Image();
          img.src = imageUrl;
          img.onload = () => {
            console.log(`✅ Image ${index} loaded:`, imageUrl);
            resolve(true);
          };
          img.onerror = () => {
            console.warn(`❌ Failed to load image ${index}:`, imageUrl);
            resolve(false);
          };
        });
      });

      await Promise.all(imagePromises);
      setIsLoading(false);
      console.log('🎉 All images preloaded');
    };

    preloadImages();
  }, [items]);

  const nextSlide = useCallback(() => {
    setProgress(0);
    setCurrentSlide((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setProgress(0);
    setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goToSlide = (index: number) => {
    setProgress(0);
    setCurrentSlide(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide();
    } else if (touchEnd - touchStart > 50) {
      prevSlide();
    }
  };

  const handleItemClick = async (item: MusicFolderItem) => {
    const id = item.content?.contentId;
    if (!id) {
      console.warn('❌ No content ID found for item:', item);
      return;
    }

    console.log('🎵 Playing item:', item.content?.title);
    try {
      router.push(`/media/music/play/${id}`);
    } catch (error) {
      console.error('Error navigating to play page:', error);
    }
  };

  const toggleLike = (item: MusicFolderItem) => {
    const itemId = item.content?.contentId;
    if (!itemId) return;

    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentItem = items[currentSlide];
  
  if (!currentItem) {
    console.log('❌ No current item available');
    return (
      <div className={cn("w-full h-80 bg-muted/50 rounded-xl flex items-center justify-center border-2 border-dashed", className)}>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MusicIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No content to display</p>
          <p className="text-sm text-muted-foreground">Add some featured content</p>
        </div>
      </div>
    );
  }

  const featuredArtists = currentItem.featuredArtists || [];
  const artistName = currentItem.artistName || 
                    currentItem.content?.artists?.[0] || 
                    currentItem.owner?.name || 
                    'Unknown Artist';
  
  const duration = currentItem.content?.duration ||0;
  const listens = currentItem.content?.listens || 0;
  const isLiked = currentItem.content?.contentId ? likedItems.has(currentItem.content.contentId) : false;
  
  const imageUrl = currentItem.content?.thumbnail || currentItem.folderPoster || '/images/default-cover.png';
  const title = currentItem.content?.title || currentItem.folderName || 'Untitled Track';
  const description = currentItem.content?.description;

  console.log('🎨 Displaying slide:', {
    currentSlide,
    title,
    artistName,
    imageUrl,
    hasImage: !!imageUrl
  });

  if (isLoading) {
    return <SliderSkeleton className={className} />;
  }

  return (
    <TooltipProvider>
      <div className={cn("relative w-full h-80 md:h-96 rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-br from-primary/5 to-muted/30 border", className)}>
        {/* Background Image */}
        <div className="absolute inset-0 transform group-hover:scale-105 transition-transform duration-700 ease-out">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
            quality={80}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            onLoad={() => {
              console.log('✅ Image loaded successfully:', imageUrl);
              setIsLoading(false);
            }}
            onError={(e) => {
              console.error('❌ Image failed to load:', imageUrl);
              setIsLoading(false);
              // You can set a fallback image here if needed
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-20 h-full flex flex-col justify-end p-6 text-white">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-sm">
              Featured
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
              {group.name}
            </Badge>
            
            {/* Stats */}
            {listens > 0 && (
              <div className="flex items-center gap-1 text-sm text-white/80">
                <Headphones className="h-3 w-3" />
                <span>{listens.toLocaleString()} plays</span>
              </div>
            )}
            
            {duration && (
              <div className="flex items-center gap-1 text-sm text-white/80">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(duration)}</span>
              </div>
            )}
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 line-clamp-2 leading-tight drop-shadow-lg">
            {title}
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-4 drop-shadow-md">
            {artistName}
            {featuredArtists.length > 0 && ` • ${featuredArtists.join(', ')}`}
          </p>

          {description && (
            <p className="text-base md:text-lg text-gray-300 mb-6 line-clamp-2 max-w-2xl drop-shadow-md leading-relaxed">
              {description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleItemClick(currentItem)}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  Play Now
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Play {title}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-white/10 hover:bg-white/20 border-white/30 backdrop-blur-sm h-12 w-12 rounded-full"
                  onClick={() => toggleLike(currentItem)}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''} transition-colors`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isLiked ? 'Remove from favorites' : 'Add to favorites'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 border-white/30 backdrop-blur-sm h-12 w-12 rounded-full">
                  <Share className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Share this track
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 border-white/30 backdrop-blur-sm h-12 w-12 rounded-full">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  More options
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border-0 shadow-xl">
                <DropdownMenuItem className="cursor-pointer">
                  <Play className="h-4 w-4 mr-2" />
                  Add to queue
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to playlist
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  View artist
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Album className="h-4 w-4 mr-2" />
                  Go to album
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Share className="h-4 w-4 mr-2" />
                  Share track
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation Arrows - Only show if multiple items */}
        {items.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 
                       bg-black/40 hover:bg-black/60 text-white rounded-full h-12 w-12
                       opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-sm"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 
                       bg-black/40 hover:bg-black/60 text-white rounded-full h-12 w-12
                       opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg backdrop-blur-sm"
              onClick={nextSlide}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Auto-play Toggle */}
        {items.length > 1 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-30 bg-black/40 hover:bg-black/60 
                         text-white rounded-full h-10 w-10 backdrop-blur-sm shadow-lg"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPlaying ? 'Pause auto-slide' : 'Play auto-slide'}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Progress Bar */}
        {items.length > 1 && isPlaying && (
          <div className="absolute top-0 left-0 right-0 z-30">
            <Progress value={progress} className="h-1 bg-white/20 rounded-none [&>div]:bg-green-500" />
          </div>
        )}

        {/* Slide Indicators */}
        {items.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
            {items.map((_, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "h-3 w-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/30",
                      index === currentSlide
                        ? "bg-white scale-110 shadow-lg"
                        : "bg-white/50 hover:bg-white/70 hover:scale-110"
                    )}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  Slide {index + 1}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Slide Counter */}
        {items.length > 1 && (
          <div className="absolute top-4 left-4 z-30 bg-black/40 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
            {currentSlide + 1} / {items.length}
          </div>
        )}

        {/* Touch handling for mobile */}
        <div
          className="absolute inset-0 z-10 md:pointer-events-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
    </TooltipProvider>
  );
};

// Skeleton Loader
const SliderSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("relative w-full h-80 md:h-96 rounded-xl overflow-hidden bg-muted/50", className)}>
    <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/70" />
    <div className="relative z-20 h-full flex flex-col justify-end p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-12 w-3/4 mb-3" />
      <Skeleton className="h-6 w-1/2 mb-4" />
      <Skeleton className="h-5 w-2/3 mb-6" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-32 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  </div>
);

// Multiple Sliders Container Component
export const SliderPromotionContainer: React.FC<{ groups: PromotionGroup[] }> = ({ groups }) => {
  const sliderGroups = groups.filter(group => group.type === 'Slider');

  if (sliderGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <MusicIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No featured content</h3>
        <p className="text-sm text-muted-foreground">Featured music will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sliderGroups.map((group, index) => (
        <SliderPromotion
          key={`slider-${group.name}-${index}`}
          group={group}
          autoSlideInterval={6000}
          className="mb-8"
        />
      ))}
    </div>
  );
};