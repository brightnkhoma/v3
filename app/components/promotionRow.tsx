import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, MoreHorizontal, Heart, Share, Headphones, Loader2, Plus, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { MusicFolderItem, PromotionGroup } from '../lib/types';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Scrollbar, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import 'swiper/css/free-mode';
import { getLikeCount } from '../lib/dataSource/contentDataSource';

interface PromotionGroupRowProps {
  group: PromotionGroup;
  className?: string;
  isMusicLoading: string | null;
}

interface MusicItemProps {
  item: MusicFolderItem;
  isArtist?: boolean;
  isLoading: boolean;
}

const MusicItemSkeleton: React.FC<{ isArtist?: boolean }> = ({ isArtist = false }) => {
  if (isArtist) {
    return (
      <div className="flex flex-col items-center space-y-3 min-w-[100px]">
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    );
  }

  return (
    <Card className="w-[160px] sm:w-[180px]">
      <CardContent className="p-3">
        <Skeleton className="aspect-square w-full mb-3 rounded-md" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-3/4 mb-3" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
        </div>
      </CardContent>
    </Card>
  );
};

const MusicItem: React.FC<MusicItemProps> = ({ item, isArtist = false, isLoading }) => {
  const x = item;
  const id = x.content?.contentId;
  const thumNail = x.content?.thumbnail || x.folderPoster;
  const title = x.content?.title || x.folderName;
  const listens = x.content?.listens || 0;
  const artist = x.content?.artists?.[0] || x.artistName || x.owner?.name || 'Unknown Artist';
  const [likes, setLikes] = useState<string>("...");
  const [isLiked, setIsLiked] = useState(false);
  const price = x.total || x.content?.pricing?.price || x.price?.price || 0;
  const isPaid = x.isPaid;
  const duration = x.content?.duration || 0

  const onGetLikeCount = async () => {
    try {
      const count = await getLikeCount(x);
      setLikes(count ? count.toLocaleString() : "0");
    } catch (error) {
      setLikes("0");
    }
  };

  useEffect(() => {
    onGetLikeCount();
  }, []);

  const router = useRouter();

  const handleItemClick = async () => {
    if (isArtist) {
      router.push(`/media/music/album/${item.owner.userId}`);
      return;
    }
    
    try {
      router.push(`/media/music/play/${id}`);
    } catch (error) {
      console.error('Error setting audio item:', error);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleItemClick();
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isArtist) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              onClick={handleItemClick} 
              className="flex flex-col items-center space-y-3 min-w-[100px] p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden group">
                <Image
                  src={thumNail ||  '/images/def.jpeg'}
                  alt={artist}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="80px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                  <Button
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 bg-green-500 hover:bg-green-600 text-white shadow-lg"
                    onClick={handlePlayClick}
                  >
                    <Play className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-sm text-foreground truncate max-w-[100px]">
                  {artist}
                </h3>
                <p className="text-xs text-muted-foreground">Artist</p>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>View {artist}'s profile</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card 
      className="group bg-background/50 hover:bg-accent/50 border-0 backdrop-blur-sm transition-all duration-300 w-[160px] sm:w-[180px] cursor-pointer shadow-sm hover:shadow-md relative overflow-hidden"
      onClick={handleItemClick}
    >
      {isLoading && <LoadingOverlay />}
      
      <CardContent className="p-4">
        <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
          <Image
            src={thumNail || '/images/default-cover.png'}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 160px, 180px"
          />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
            <Button
              size="icon"
              className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 bg-green-500 hover:bg-green-600 text-white shadow-lg"
              onClick={handlePlayClick}
            >
              <Play className="h-4 w-4 fill-current" />
            </Button>
          </div>

          {/* Duration Badge */}
          {duration && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs bg-black/80 text-white px-1.5 py-0.5">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(duration)}
              </Badge>
            </div>
          )}

          {/* Price Badge */}
          {price > 0 && !isPaid && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                MK{price.toFixed(2)}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-semibold text-sm text-foreground truncate leading-tight">
                  {title}
                </h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>{title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground truncate">
                  {artist}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{artist}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <div className="flex items-center space-x-1">
              <Headphones className="h-3 w-3" />
              <span>{listens.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Heart 
                className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : ''} transition-colors`}
              />
              <span>{likes}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomMusicItem: React.FC<{ item: MusicFolderItem, isMusicLoading: boolean }> = ({ item, isMusicLoading }) => {
  const x = item;
  const id = x.content?.contentId;
  const thumNail = x.content?.thumbnail || x.folderPoster;
  const title = x.content?.title || x.folderName;
  const listens = x.content?.listens || 0;
  const artist = x.content?.artists?.[0] || x.artistName || x.owner?.name || 'Unknown Artist';
  const [likes, setLikes] = useState<string>("...");
  const [isLiked, setIsLiked] = useState(false);
  const price = x.total || x.content?.pricing?.price || x.price?.price || 0;
  const isPaid = x.isPaid;
  const duration = x.content?.duration || 0;

  const onGetLikeCount = async () => {
    try {
      const count = await getLikeCount(x);
      setLikes(count ? count.toLocaleString() : "0");
    } catch (error) {
      setLikes("0");
    }
  };

  useEffect(() => {
    onGetLikeCount();
  }, []);

  const router = useRouter();

  const handleItemClick = async () => {
    try {
      router.push(`/media/music/play/${id}`);
    } catch (error) {
      console.error('Error setting audio item:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card 
      className="bg-background/50 hover:bg-accent/50 border-0 backdrop-blur-sm transition-all duration-300 w-full max-w-[320px] cursor-pointer shadow-sm hover:shadow-md"
      onClick={handleItemClick}
    >
      {isMusicLoading && <LoadingOverlay />}
      
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden group flex-shrink-0">
            <Image
              src={thumNail || '/images/default-cover.png'}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="80px"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
              <Button
                size="icon"
                className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 bg-green-500 hover:bg-green-600 text-white"
              >
                <Play className="h-4 w-4 fill-current" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h3 className="font-semibold text-foreground truncate text-sm">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {artist}
              </p>
            </div>

            {/* Price and Duration */}
            <div className="flex items-center justify-between">
              {price > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-500 text-white text-xs">
                    MK{price.toFixed(2)}
                  </Badge>
                  {isPaid && (
                    <Badge variant="outline" className="text-xs">
                      Purchased
                    </Badge>
                  )}
                </div>
              )}
              
              {duration && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(duration)}
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Headphones className="h-3 w-3" />
                  <span>{listens.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Heart 
                    className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : ''} transition-colors`}
                  />
                  <span>{likes}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 pt-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Play className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 rounded-full ${isLiked ? 'text-red-500' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-2 text-white">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-xs">Loading...</span>
    </div>
  </div>
);

export const PromotionGroupRow: React.FC<PromotionGroupRowProps> = ({ 
  group, 
  className = '',
  isMusicLoading
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for skeleton
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const swiperConfig = {
    slidesPerView: 'auto' as const,
    spaceBetween: 20,
    freeMode: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    modules: [Navigation, FreeMode],
    className: "promotion-swiper",
    breakpoints: {
      320: { slidesPerView: 2, spaceBetween: 12 },
      480: { slidesPerView: 2, spaceBetween: 16 },
      640: { slidesPerView: 3, spaceBetween: 16 },
      768: { slidesPerView: 4, spaceBetween: 16 },
      1024: { slidesPerView: 5, spaceBetween: 20 },
      1280: { slidesPerView: 6, spaceBetween: 24 }
    }
  };

  const artistSwiperConfig = {
    ...swiperConfig,
    breakpoints: {
      320: { slidesPerView: 3, spaceBetween: 12 },
      480: { slidesPerView: 4, spaceBetween: 16 },
      640: { slidesPerView: 5, spaceBetween: 16 },
      768: { slidesPerView: 6, spaceBetween: 16 },
      1024: { slidesPerView: 7, spaceBetween: 20 },
      1280: { slidesPerView: 8, spaceBetween: 24 }
    }
  };

  const customSwiperConfig = {
    ...swiperConfig,
    breakpoints: {
      320: { slidesPerView: 1, spaceBetween: 16 },
      640: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 24 },
      1280: { slidesPerView: 4, spaceBetween: 24 }
    }
  };

  const renderRowContent = () => {
    if (isLoading) {
      return renderSkeleton();
    }

    switch (group.type) {
      case "Row":
        return renderHomepageRow();
      case 'Artist':
        return renderArtistRow();
      default:
        return renderCustomGroupRow();
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex space-x-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <MusicItemSkeleton key={index} isArtist={group.type === 'Artist'} />
        ))}
      </div>
    </div>
  );

  const renderHomepageRow = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {group.name === "Homepage Row" ? "Recommended For You" : group.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Curated based on your listening history</p>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Button>
      </div>
      <div className="relative">
        <Swiper {...swiperConfig}>
          {group.items.slice(0, 12).map((item, index) => (
            <SwiperSlide key={`${item.content?.contentId}-${index}`} className="!w-auto">
              <MusicItem isLoading={item.content?.contentId == isMusicLoading} item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );

  const renderArtistRow = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Popular Artists</h2>
          <p className="text-sm text-muted-foreground mt-1">Discover amazing talent</p>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Button>
      </div>
      <div className="relative">
        <Swiper {...artistSwiperConfig}>
          {group.items.slice(0, 12).map((item, index) => (
            <SwiperSlide key={`${item.content?.contentId}-${index}`} className="!w-auto">
              <MusicItem isLoading={item.content?.contentId == isMusicLoading} item={item} isArtist={true} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );

  const renderCustomGroupRow = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{group.name}</h2>
          {group.groupName && (
            <p className="text-sm text-muted-foreground mt-1">Collection: {group.groupName}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Button>
      </div>
      <div className="relative">
        <Swiper {...customSwiperConfig}>
          {group.items.map((item, index) => (
            <SwiperSlide key={`${item.content?.contentId}-${index}`} className="!w-auto">
              <CustomMusicItem isMusicLoading={isMusicLoading == item.content?.contentId} item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );

  return (
    <div className={`promotion-group-row ${className} mb-8`}>
      {renderRowContent()}
    </div>
  );
};

export const CompactPromotionList: React.FC<{ groups: PromotionGroup[], isMusicLoading: string | null }> = ({ groups, isMusicLoading }) => {
  return (
    <div className="space-y-8">
      {groups.map((group, index) => (
        <PromotionGroupRow 
          isMusicLoading={isMusicLoading} 
          key={`${group.type}-${group.groupName || index}`} 
          group={group} 
        />
      ))}
    </div>
  );
};