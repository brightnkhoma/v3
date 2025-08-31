import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, MoreHorizontal, Heart, Share, Headphones } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { MusicFolderItem, PromotionGroup } from '../lib/types';
import { useRouter } from 'next/navigation';
import { AppContext } from '../appContext';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Scrollbar, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import 'swiper/css/free-mode';
import { getLikeCount } from '../lib/dataSource/contentDataSource';
import { useAppDispatch } from '../lib/local/redux/store';

interface PromotionGroupRowProps {
  group: PromotionGroup;
  className?: string;
}

interface MusicItemProps {
  item: MusicFolderItem;
  isArtist?: boolean;
}

const MusicItem: React.FC<MusicItemProps> = ({ item, isArtist = false }) => {
  const x = item;
  const id = x.content.contentId;
  const thumNail = x.content.thumbnail || x.folderPoster;
  const title = x.content.title;
  const listens = x.content.listens || 0;
  const albumName = x.folderName;
  const artist = x.content.artists?.[0] || x.artistName || x.owner?.name || 'Unknown Artist';
  const [likes, setLikes] = useState<string>("...");
  const price = x.content.pricing?.price || x.price?.price || 0;
  const isPaid = x.isPaid;

  const onGetLikeCount = async () => {
    try {
      const count = await getLikeCount(x);
      setLikes((count || 0).toString());
    } catch (error) {
      setLikes("0");
    }
  };

  useEffect(() => {
    onGetLikeCount();
  }, []);

  const { audioManager } = useContext(AppContext)!;
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleItemClick = async () => {
    if (isArtist) {
      router.push(`/media/music/album/${item.owner.userId}`)
     return
    }
    
    try {
      await audioManager.setItem(x);
      router.push(`/media/music/play/${id}`);
    } catch (error) {
      console.error('Error setting audio item:', error);
    }
  };

  if (isArtist) {
    return (
      <div onClick={handleItemClick} className="flex flex-col items-center space-y-2 min-w-[80px]">
        <div className="relative w-20 h-20 rounded-full overflow-hidden group">
          <Image
            src={thumNail || '/images/default-artist.png'}
            alt={artist}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
            <Button
              size="icon"
              className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 bg-green-500 hover:bg-green-600 text-white"
            >
              <Play className="h-4 w-4 fill-current" />
            </Button>
          </div>
        </div>
        <div className="text-center">
          <h3 className="font-medium text-sm text-foreground truncate max-w-[80px]">
            {artist}
          </h3>
          <p className="text-xs text-muted-foreground">Artist</p>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className="group bg-background hover:bg-accent transition-colors w-[160px] sm:w-[180px] cursor-pointer"
      onClick={handleItemClick}
    >
      <CardContent className="p-3">
        <div className="relative aspect-square mb-3 rounded-md overflow-hidden">
          <Image
            src={thumNail || '/images/default-cover.png'}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
            <Button
              size="icon"
              className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 bg-green-500 hover:bg-green-600 text-white"
            >
              <Play className="h-4 w-4 fill-current" />
            </Button>
          </div>
        </div>
        
        <h3 className="font-semibold text-sm truncate text-foreground mb-1">
          {title}
        </h3>
        
        <p className="text-xs text-muted-foreground truncate mb-2">
          {artist}
        </p>

        {/* Price display */}
        {price > 0 && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-green-600">
              MK{price.toFixed(2)}
            </span>
            {isPaid && (
              <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                Purchased
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Headphones className="h-3 w-3" />
            <span>{listens.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Heart className="h-3 w-3 fill-current text-red-400" />
            <span>{likes}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomMusicItem: React.FC<{ item: MusicFolderItem }> = ({ item }) => {
  const x = item;
  const id = x.content.contentId;
  const thumNail = x.content.thumbnail || x.folderPoster;
  const title = x.content.title;
  const listens = x.content.listens || 0;
  const albumName = x.folderName;
  const artist = x.content.artists?.[0] || x.artistName || x.owner?.name || 'Unknown Artist';
  const [likes, setLikes] = useState<string>("...");
  const price = x.content.pricing?.price || x.price?.price || 0;
  const isPaid = x.isPaid;

  const onGetLikeCount = async () => {
    try {
      const count = await getLikeCount(x);
      setLikes((count || 0).toString());
    } catch (error) {
      setLikes("0");
    }
  };

  useEffect(() => {
    onGetLikeCount();
  }, []);

  const { audioManager } = useContext(AppContext)!;
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleItemClick = async () => {
    try {
      await audioManager.setItem(x);
      router.push(`/media/music/play/${id}`);
    } catch (error) {
      console.error('Error setting audio item:', error);
    }
  };

  return (
    <Card 
      className="bg-background hover:bg-accent transition-colors w-[300px] sm:w-[320px] cursor-pointer"
      onClick={handleItemClick}
    >
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <div className="relative w-16 h-16 rounded-md overflow-hidden group flex-shrink-0">
            <Image
              src={thumNail || '/images/default-cover.png'}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {artist}
            </p>

            {/* Price display */}
            {price > 0 && (
              <div className="flex items-center justify-between my-1">
                <span className="text-sm font-medium text-green-600">
                  MK{price.toFixed(2)}
                </span>
                {isPaid && (
                  <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                    Purchased
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <div className="flex items-center space-x-1">
                <Headphones className="h-3 w-3" />
                <span>{listens.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3 fill-current text-red-400" />
                <span>{likes}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Play className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Heart className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Add to playlist</DropdownMenuItem>
                  <DropdownMenuItem>Share</DropdownMenuItem>
                  <DropdownMenuItem>View artist</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PromotionGroupRow: React.FC<PromotionGroupRowProps> = ({ 
  group, 
  className = '' 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const swiperConfig = {
    slidesPerView: 'auto' as const,
    spaceBetween: 16,
    freeMode: true,
    navigation: true,
    scrollbar: { 
      hide: true,
      draggable: true 
    },
    modules: [Navigation, Scrollbar, FreeMode],
    className: "promotion-swiper",
    breakpoints: {
      320: {
        slidesPerView: 2,
        spaceBetween: 12
      },
      640: {
        slidesPerView: 3,
        spaceBetween: 16
      },
      768: {
        slidesPerView: 4,
        spaceBetween: 16
      },
      1024: {
        slidesPerView: 5,
        spaceBetween: 20
      },
      1280: {
        slidesPerView: 6,
        spaceBetween: 24
      }
    }
  };

  const artistSwiperConfig = {
    ...swiperConfig,
    breakpoints: {
      320: {
        slidesPerView: 3,
        spaceBetween: 12
      },
      480: {
        slidesPerView: 4,
        spaceBetween: 16
      },
      640: {
        slidesPerView: 5,
        spaceBetween: 16
      },
      768: {
        slidesPerView: 6,
        spaceBetween: 16
      },
      1024: {
        slidesPerView: 7,
        spaceBetween: 20
      },
      1280: {
        slidesPerView: 8,
        spaceBetween: 24
      }
    }
  };

  const customSwiperConfig = {
    ...swiperConfig,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 12
      },
      640: {
        slidesPerView: 2,
        spaceBetween: 16
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 20
      },
      1280: {
        slidesPerView: 4,
        spaceBetween: 24
      }
    }
  };

  const renderRowContent = () => {
    switch (group.type) {
      case 'ROW_ITEM':
        return renderHomepageRow();
      case 'ARTIST_ROW':
        return renderArtistRow();
      case 'CUSTOM_GROUP':
        return renderCustomGroupRow();
      default:
        return renderDefaultRow();
    }
  };

  const renderHomepageRow = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{group.name == "Homepage Row" ? "Recommended" : group.name}</h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          View all
        </Button>
      </div>
      <Swiper {...swiperConfig}>
        {group.items.slice(0, 12).map((item, index) => (
          <SwiperSlide key={`${item.content.contentId}-${index}`} className="!w-auto">
            <MusicItem item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  const renderArtistRow = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{group.name}</h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          View all
        </Button>
      </div>
      <Swiper {...artistSwiperConfig}>
        {group.items.slice(0, 12).map((item, index) => (
          <SwiperSlide key={`${item.content.contentId}-${index}`} className="!w-auto">
            <MusicItem item={item} isArtist={true} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  const renderCustomGroupRow = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{group.name}</h2>
          {group.groupName && (
            <p className="text-sm text-muted-foreground">Group: {group.groupName}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          View all
        </Button>
      </div>
      <Swiper {...customSwiperConfig}>
        {group.items.map((item, index) => (
          <SwiperSlide key={`${item.content.contentId}-${index}`} className="!w-auto">
            <CustomMusicItem item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  const renderDefaultRow = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{group.name}</h2>
      <Swiper {...swiperConfig}>
        {group.items.slice(0, 8).map((item, index) => (
          <SwiperSlide key={`${item.content.contentId}-${index}`} className="!w-auto">
            <MusicItem item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  return (
    <div className={`promotion-group-row ${className} ${isDark ? 'dark-theme' : 'light-theme'}`}>
      {renderRowContent()}
    </div>
  );
};

export const CompactPromotionList: React.FC<{ groups: PromotionGroup[] }> = ({ groups }) => {
  return (
    <div className="space-y-6">
      {groups.map((group, index) => (
        <PromotionGroupRow key={`${group.type}-${group.groupName || index}`} group={group} />
      ))}
    </div>
  );
};