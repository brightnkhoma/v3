"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { VideoFolderItem } from '../lib/types';
import { firestoreTimestampToDate } from '../lib/config/timestamp';
import { useAppDispatch } from '../lib/local/redux/store';
import { setMeta } from '../lib/local/redux/reduxSclice';
import { Badge } from '@/components/ui/badge';

interface VideoComponentProps {
  video: VideoFolderItem;
  className?: string;
  inFolder : boolean
}

const VideoComponent: React.FC<VideoComponentProps> = ({ video, className = '' ,inFolder = false}) => {
  const router = useRouter();
  const dispatch = useAppDispatch()

  const handleClick = () => {
    if(!inFolder){
      dispatch(setMeta(video))
    }else{

      router.push(`/media/movies/play/${video.content.contentId}`);
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
    if (!views) return '';
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
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div 
      className={`cursor-pointer  group ${className}`}
      onClick={handleClick}
      onDoubleClick={()=> router.push(`/media/movies/play/${video.content.contentId}`)}
    >
      <div className="relative aspect-video mb-3 overflow-hidden rounded-xl bg-gray-200">
       {
              video.price && <span className='absolute top-2 left-2'><Badge>MK {video.price.price}</Badge></span>
            }
        <img
          src={video.folderPoster || video.content.thumbnail || '/images/f.jpg'}
          alt={video.name}
          className="w-full h-full object-cover group-hover:brightness-105 transition-all duration-200"
        />
        
        {video.content.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.content.duration)}
          </div>
        )}
        
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-200" />
      </div>

      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            <img
              src={video.owner?.avatar || `/images/images.jpg`}
              alt={video.owner?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium dark:text-gray-200  text-gray-900 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
            {video.name}
          </h3>
          
          <p className="text-xs dark:text-gray-200 text-gray-600 mb-0.5">
            {video.owner?.name}
          </p>
          
          <div className="text-xs dark:text-gray-200  flex items-center">
            <span>{formatViews(video.content.views)}</span>
            <span className='font-semibold'>{video.content.title}</span>
          </div>
           
        </div>
      </div>

      <button 
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>
    </div>
  );
};

export default VideoComponent;