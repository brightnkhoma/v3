"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { VideoFolderItem } from '../lib/types';
import { firestoreTimestampToDate } from '../lib/config/timestamp';
import { useAppDispatch } from '../lib/local/redux/store';
import { setMeta } from '../lib/local/redux/reduxSclice';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, MoreVertical, Eye, Calendar, Clock, User } from 'lucide-react';

interface VideoComponentProps {
  video: VideoFolderItem;
  className?: string;
  inFolder?: boolean;
  index?: number;
}

const VideoComponent: React.FC<VideoComponentProps> = ({ 
  video, 
  className = '', 
  inFolder = false,
  index = 0 
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleClick = () => {
    if (!inFolder) {
      dispatch(setMeta(video));
    } else {
      if(video.type == "Series"){
        const {owner} = video 

        router.push(`/media/movies/collection/${owner.userId}/${ video.folderId}`);
        return;
      }
      router.push(`/media/movies/play/${video.content.contentId || video.folderId}`);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views?: number): string => {
    if (!views) return '0 views';
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const getPriceBadge = () => {
    if (!video.price) return null;
    const price = video.total || video.price.price;
    return (
      <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-lg px-2 py-1 text-xs font-semibold">
        MK {price}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className={`group cursor-pointer ${className}`}
      onClick={handleClick}
      onDoubleClick={() => router.push(`/media/movies/play/${video.content.contentId}`)}
    >
      <div className="relative aspect-video mb-4 overflow-hidden  bg-gradient-to-br from-muted/50 to-muted/30 shadow-sm hover:shadow-xl transition-all duration-300">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          src={video.folderPoster || video.content.thumbnail || '/images/tv.jpg'}
          alt={video.name}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="bg-primary/90 text-primary-foreground rounded-full p-3 shadow-2xl transform group-hover:scale-110 transition-transform duration-200">
            <Play className="w-5 h-5 fill-current" />
          </div>
        </motion.div>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {getPriceBadge()}
          {video.total  ? (
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-foreground px-2 py-1 text-xs">
              Premium
            </Badge>
          ) : ""}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-between text-white text-xs">
            {video.content.duration && (
              <div className="flex items-center gap-1 bg-black/60 rounded-full px-2 py-1 backdrop-blur-sm">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(video.content.duration)}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 bg-black/60 rounded-full px-2 py-1 backdrop-blur-sm">
              <Eye className="w-3 h-3" />
              <span>{formatViews(video.content.listens)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex-shrink-0 relative"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center overflow-hidden border-2 border-background shadow-sm group-hover:border-primary/30 transition-colors duration-200">
            {video.owner?.avatar ? (
              <img
                src={video.owner.avatar}
                alt={video.owner.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm"></div>
        </motion.div>

        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200">
            {video.name || video.folderName}
          </h3>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {video.owner?.name}
              <svg className="w-3 h-3 text-primary fill-current" viewBox="0 0 24 24">
                <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-11.71 4.72l-4-4 1.41-1.41 2.59 2.58 5.59-5.59 1.41 1.41-7 7z"/>
              </svg>
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViews(video.content.listens )}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatTimeAgo(new Date((video.content.releaseDate || new Date()) as any))}
            </span>
          </div>

          {video.content.title && (
            <p className="text-xs text-muted-foreground line-clamp-1 bg-muted/30 px-2 py-1 rounded-full">
              {video.content.title}
            </p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-full hover:bg-muted self-start flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* {video.content && (
        <div className="mt-2 w-full bg-muted rounded-full h-1">
          <div 
            className="bg-primary rounded-full h-1 transition-all duration-300"
            style={{ width: `${Math.min(100, (50/ video.content.duration) * 100)}%` }}
          />
        </div>
      )}  */}
    </motion.div>
  );
};

export default VideoComponent;