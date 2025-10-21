// app/profile/components/LibrarySection.tsx
'use client';

import { useCallback, useEffect, useState } from "react";
import { PurchasedContent, LikedContent, MusicFolderItem, VideoFolderItem, ContentType } from "../lib/types";
import { RootState, useAppSelector } from "../lib/local/redux/store";
import { getUserPurchasedItems } from "../lib/dataSource/contentDataSource";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ShoppingCart, 
  Heart, 
  Download, 
  Music, 
  Video, 
  Album,
  PlayCircle,
  Calendar,
  Eye,
  Loader2
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { firestoreTimestampToDate } from "../lib/config/timestamp";

interface LibrarySectionProps {
  purchasedContent: PurchasedContent[];
  likedContent: LikedContent[];
}

export default function LibrarySection({ purchasedContent, likedContent }: LibrarySectionProps) {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [purchasedMusic, setPurchasedMusic] = useState<MusicFolderItem[]>([]);
  const [purchasedVideo, setPurchasedVideo] = useState<VideoFolderItem[]>([]);
  const [likedMusic, setLikedMusic] = useState<MusicFolderItem[]>([]);
  const [likedVideo, setLikedVideo] = useState<VideoFolderItem[]>([]);
  const [lastDoc, setLastDoc] = useState<MusicFolderItem | VideoFolderItem | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [shouldLoad, setShouldLoad] = useState<boolean>(true)
  const { inView, ref } = useInView();

  const onGetItems = useCallback(async (loadMore = false) => {
    if (!user) return;
    
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const _items = await getUserPurchasedItems(user, lastDoc)      
      const {lastDoc : last} = _items
      const items = _items.items.filter(x=> x!= undefined )

      if (items.length === 0) {
        setHasMore(false);
        return;
      }

      if(items.length < 30){
        setHasMore(false)
      }
      
      

      const music: MusicFolderItem[] = items.filter(x => 
        x.type === "Album" || x.type === "Playlist" || x.type === "Default"
      ) as MusicFolderItem[];
      
      const videos: VideoFolderItem[] = items.filter(x => 
        x.type === "Movie" || x.type === "Series" || x.type === "Music-Video" || x.type === "Podcast"
      ) as VideoFolderItem[];
    

      if (loadMore) {
        setPurchasedMusic(prev => [...prev, ...music]);
        setPurchasedVideo(prev => [...prev, ...videos]);
      } else {
        setPurchasedMusic(music);
        setPurchasedVideo(videos);
      }

      if (items.length > 0) {
        setLastDoc(last);
      }
    } catch (error) {
      console.error('Error fetching purchased items:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc, user]);



  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      onGetItems(true);
    }
  }, [inView, hasMore, loadingMore, onGetItems]);

  

  useEffect(() => {
    onGetItems();
  }, []);

  

  const ContentCardSkeleton = () => (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="h-40 w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </CardContent>
    </Card>
  );

  const totalPurchased = purchasedMusic.length + purchasedVideo.length;
  const totalLiked = likedMusic.length + likedVideo.length;

  return (
    <div className="space-y-6">
      {/* Purchased Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchased Content
          </CardTitle>
          <CardDescription>
            {totalPurchased > 0 
              ? `You own ${totalPurchased} items` 
              : 'Movies, music, and other content you own'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ContentCardSkeleton key={i} />
              ))}
            </div>
          ) : totalPurchased === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No purchases yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start building your library by purchasing content you love
                </p>
              </div>
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Content
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {purchasedMusic.map((item) => (
                  <ContentCard key={item.folderId} item={item} type="music" />
                ))}
                {purchasedVideo.map((item) => (
                  <ContentCard key={item.folderId} item={item} type="video" />
                ))}
              </div>
              
              {hasMore && (
                <div ref={ref} className="flex justify-center mt-6">
                  {loadingMore ? (
                    <Button variant="outline" disabled>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading more...
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => onGetItems(true)}>
                      Load More
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      
      
    </div>
  );
}

function ContentCard({ 
  item, 
  type, 
  isLiked = false 
}: { 
  item: MusicFolderItem | VideoFolderItem; 
  type: 'music' | 'video';
  isLiked?: boolean;
}) {
  const isMusic = type === 'music';
  const musicItem = item as MusicFolderItem;
  const videoItem = item as VideoFolderItem;
  const router = useRouter()
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'Album':
        return <Album className="h-4 w-4" />;
      case 'Playlist':
        return <Music className="h-4 w-4" />;
      case 'Movie':
        return <Video className="h-4 w-4" />;
      case 'Series':
        return <PlayCircle className="h-4 w-4" />;
      case 'Music-Video':
        return <Video className="h-4 w-4" />;
      case 'Podcast':
        return <Eye className="h-4 w-4" />;
      default:
        return <Music className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'Album':
        return 'Album';
      case 'Playlist':
        return 'Playlist';
      case 'Movie':
        return 'Movie';
      case 'Series':
        return 'Series';
      case 'Music-Video':
        return 'Music Video';
      case 'Podcast':
        return 'Podcast';
      default:
        return 'Music';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleItemClick = useCallback(()=>{
    if(type == "music"){
        router.push(`/media/music/play/${item.content.contentId}`)
        return;
    }
    router.push(`/media/movies/play/${item.content.contentId}`)
  },[item,type])

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <div className="relative">
        <img
          src={item.content.thumbnail || item.folderPoster || '/default-thumbnail.jpg'}
          alt={isMusic ? musicItem.artistName : videoItem.name}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <Button 
            size="icon" 
            variant="secondary" 
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-90 group-hover:scale-100"
            onClick={handleItemClick}
          >
            <PlayCircle className="h-6 w-6" />
          </Button>
        </div>
        {isLiked && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-red-500 text-white">
            <Heart className="h-3 w-3 fill-current" />
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-1">
            {isMusic ? musicItem.content.title : videoItem.content.title}
          </h3>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getContentIcon(item.type)}
            <span>{getContentTypeLabel(item.type)}</span>
          </div>

          {isMusic && musicItem.artistName && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              by {musicItem.artistName}
            </p>
          )}

          {videoItem.actorName && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              Starring {videoItem.actorName}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            {item.dateCreated && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(firestoreTimestampToDate(item.dateCreated as any))}
              </div>
            )}
            
            {!isLiked && 'price' in item && item.price && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                MWK{item.price.price}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}