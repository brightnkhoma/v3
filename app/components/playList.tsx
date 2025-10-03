"use client"
import { Video, X, Clock, Play } from "lucide-react"
import { useCallback, useContext, useEffect, useState } from "react"
import { AppContext } from "../appContext";


 const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
interface PlaylistProps {
  isOpen: boolean;
  onClose: () => void;
  videos?: Array<{
    id: string;
    title: string;
    duration: number;
    thumbnail?: string;
  }>;
  onSelectVideo: (id: string) => void;
  currentVideoId?: string;
}

export const Playlist = ({ isOpen, onClose}: PlaylistProps)=>{
        const [ui,setUi] = useState<number>(3)
      const updateUi = useCallback(()=>{
            setUi(prev=>prev == 3 ? 2 : 3)
          },[ui])
  const {videoManager} = useContext(AppContext)!
  const album = videoManager.album.map(v=>({id : v.content.contentId, title : v.content.title, duration : v.content.duration, thumbnail : v.content.thumbnail || v.folderPoster || "/images/f.jpg"}))
  const currentVideoId = videoManager.currentPlayingVideo?.content.contentId

  const playlistVideos = album
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = async(id : string)=>{
    const item = videoManager.album.find(v=> v.content.contentId == id)
    console.log(item);
    
    if(item){
      await videoManager.directPlay(item)
    }
  }
  useEffect(()=>{
    videoManager.updateui = updateUi
  },[])
  return (
    <div className={`absolute h-full top-0 right-0 w-80 bg-gray-900/95 backdrop-blur-sm transition-all duration-300 z-10 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}  ${!isOpen && "hidden"}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Playlist</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Close playlist"
        >
          <X size={20} className="text-gray-300" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {playlistVideos.map((video) => (
            <PlaylistElement
              key={video.id}
              title={video.title}
              duration={(video.duration)}
              thumbnail={video.thumbnail}
              isActive={currentVideoId === video.id}
              onClick={() => handleClick(video.id)}
            />
          ))}
        </div>
      </div>
      
      <div className="p-3 border-t border-gray-700 bg-gray-800/50">
        <div className="flex items-center text-xs text-gray-400">
          <Clock size={14} className="mr-1" />
          <span>Total: {formatTime(playlistVideos.reduce((acc, video) => acc + video.duration, 0))}</span>
          <span className="mx-2">•</span>
          <span>{playlistVideos.length} videos</span>
        </div>
      </div>
    </div>
  );
}

interface PlaylistElementProps {
  title: string;
  duration: number;
  thumbnail?: string;
  isActive?: boolean;
  onClick: () => void;
}

const PlaylistElement = ({ title, duration, thumbnail, isActive, onClick }: PlaylistElementProps)=>{
  return(
    <div 
      className={`flex flex-row items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
        isActive 
          ? 'bg-amber-600/20 border border-amber-500/30' 
          : 'hover:bg-gray-800/70 border border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        {thumbnail ? (
          <div className="w-16 h-10 bg-gray-700 rounded overflow-hidden">
            <img 
              src={thumbnail} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-10 bg-gray-700 rounded flex items-center justify-center">
            <Video size={16} className="text-gray-400" />
          </div>
        )}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
          <Play size={14} fill="white" className="text-white" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-amber-300' : 'text-gray-200'}`}>
          {title}
        </p>
        <div className="flex items-center mt-1">
          <Clock size={12} className="text-gray-400 mr-1" />
          <span className="text-xs text-gray-400">{formatTime(duration)}</span>
        </div>
      </div>
      
      {isActive && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}