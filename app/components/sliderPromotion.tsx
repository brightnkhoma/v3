import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, ChevronLeft, ChevronRight, Heart, Share, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MusicFolderItem, PromotionGroup } from '../lib/types';
import { AppContext } from '../appContext';
import { useRouter } from 'next/navigation';

interface SliderPromotionProps {
  group: PromotionGroup;
  autoSlideInterval?: number;
  className?: string;
}

export const SliderPromotion: React.FC<SliderPromotionProps> = ({
  group,
  autoSlideInterval = 7000,
  className = ''
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const { audioManager } = useContext(AppContext)!;
  const router = useRouter();

  const items = group.items.slice(0, 5);

  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [isPlaying, items.length, autoSlideInterval]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goToSlide = (index: number) => {
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

  const handleItemClick = async (x: MusicFolderItem) => {
    const id = x.content.contentId;

    try {
      await audioManager.setItem(x);
      router.push(`/media/music/play/${id}`);
    } catch (error) {
      console.error('Error setting audio item:', error);
    }
  };

  if (items.length === 0) {
    return (
      <div className={cn("w-full h-80 bg-muted rounded-lg flex items-center justify-center", className)}>
        <p className="text-muted-foreground">No items to display</p>
      </div>
    );
  }

  const currentItem = items[currentSlide];
  const featuredArtists = currentItem.featuredArtists || [];
  const artistName =
    currentItem.artistName ||
    currentItem.content.artists?.[0] ||
    currentItem.owner?.name ||
    'Unknown Artist';

  return (
    <div className={cn("relative w-full h-80 md:h-96 rounded-lg overflow-hidden group cursor-pointer", className)}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentItem.content.thumbnail || currentItem.folderPoster || '/images/default-cover.png'}
          alt={currentItem.content.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-end p-6 text-white">
        <Badge variant="secondary" className="mb-2 w-fit">
          {group.name}
        </Badge>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 line-clamp-2">
          {currentItem.content.title}
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-4">
          {artistName}
          {featuredArtists.length > 0 && ` ft. ${featuredArtists.join(', ')}`}
        </p>

        {currentItem.content.description && (
          <p className="text-sm md:text-base text-gray-300 mb-6 line-clamp-2 max-w-2xl">
            {currentItem.content.description}
          </p>
        )}

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => handleItemClick(currentItem)}
            className="bg-green-500 z-50 hover:bg-green-600 text-white px-6 py-2 rounded-full"
          >
            <Play className="h-5 w-5 mr-2 fill-current" />
            Play Now
          </Button>

          <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 border-white/20">
            <Heart className="h-5 w-5" />
          </Button>

          <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 border-white/20">
            <Share className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 border-white/20">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background">
              <DropdownMenuItem>Add to playlist</DropdownMenuItem>
              <DropdownMenuItem>View artist</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 
                     bg-black/30 hover:bg-black/50 text-white rounded-full h-10 w-10
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 
                     bg-black/30 hover:bg-black/50 text-white rounded-full h-10 w-10
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Play/Pause Button */}
      {items.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-30 bg-black/30 hover:bg-black/50 
                   text-white rounded-full h-8 w-8"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </Button>
      )}

      {/* Progress Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/80"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Touch handling for mobile only */}
      <div
        className="absolute inset-0 z-10 md:pointer-events-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

// Multiple Sliders Container Component
export const SliderPromotionContainer: React.FC<{ groups: PromotionGroup[] }> = ({ groups }) => {
  const sliderGroups = groups.filter(group => group.type === 'Slider');

  if (sliderGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
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
