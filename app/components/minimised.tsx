import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Play, Pause, Maximize2, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { MusicFolderItem } from '../lib/types';

interface Artist {
  name: string;
  id: string;
}

interface MusicContent {
  title: string;
  id: string;
}

interface Music {
  content: MusicContent;
  artistName: string;
  featuredArtists?: Artist[];
}

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
}

interface AudioManager {
  loading: boolean;
}

interface DraggableMinimizedPlayerProps {
  isMinimized: boolean;
  toggleMinimize: () => void;
  state: AudioState;
  audioManager: AudioManager;
  currentPlayinMusic?: MusicFolderItem;
  togglePlayPause: () => void;
}

const DraggableMinimizedPlayer: React.FC<DraggableMinimizedPlayerProps> = ({
  isMinimized,
  toggleMinimize,
  state,
  audioManager,
  currentPlayinMusic,
  togglePlayPause
}) => {
  const { theme, resolvedTheme } = useTheme();
  const [isFloatingHovered, setIsFloatingHovered] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0 
  });
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateWindowSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
      
      
      const playerSize = 64; 
      setPosition({ 
        x: width - playerSize - 20, 
        y: height - playerSize - 20 
      });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  const handleDragStart = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setIsDragging(true);
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    });
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    let newX = clientX - dragStart.x;
    let newY = clientY - dragStart.y;
    
    const playerSize = playerRef.current?.getBoundingClientRect().width || 64;
    newX = Math.max(10, Math.min(windowSize.width - playerSize - 10, newX));
    newY = Math.max(10, Math.min(windowSize.height - playerSize - 10, newY));
    
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag as EventListener);
      window.addEventListener('touchmove', handleDrag as EventListener);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleDrag as EventListener);
        window.removeEventListener('touchmove', handleDrag as EventListener);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, handleDrag]);

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getArtistNames = (): string => {
    if (!currentPlayinMusic) return 'Unknown Artist';
    
    const artists = [currentPlayinMusic.artistName];
    if (currentPlayinMusic.featuredArtists) {
      artists.push(...currentPlayinMusic.featuredArtists.map(a => a));
    }
    
    return artists.join(', ');
  };

  if (!isMinimized) return null;

  return (
    <motion.div
      ref={playerRef}
      className="fixed z-50 cursor-move touch-none"
      style={{ 
        left: position.x, 
        top: position.y,
        filter: resolvedTheme === 'dark' 
          ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.1))' 
          : 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.1))'
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="relative"
        onHoverStart={() => setIsFloatingHovered(true)}
        onHoverEnd={() => setIsFloatingHovered(false)}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onDoubleClick={()=>{
                if(!isDragging){
                    toggleMinimize()
                }
              }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              className={`p-4 rounded-full flex items-center justify-center relative overflow-hidden ${
                resolvedTheme === 'dark' 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                  : 'bg-gradient-to-br from-primary to-primary/80'
              }`}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: resolvedTheme === 'dark' 
                  ? "0 0 25px rgba(255, 255, 255, 0.1)" 
                  : "0 0 25px rgba(99, 102, 241, 0.6)" 
              }}
              whileTap={{ scale: 0.95 }}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {state.isPlaying ? (
                audioManager.loading ? <Loader2 size={14} className="animate-spin"/> : <Pause size={24} fill="white" />
              ) : (audioManager.loading ? <Loader2 size={14} className="animate-spin"/> : 
                <Play size={24} fill="white" className="ml-0.5" />
              )}
              
              <AnimatePresence>
                {state.isPlaying && (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center gap-1 px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[1, 2, 3, 2, 1].map((height, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-white rounded-full"
                        initial={{ height: '4px' }}
                        animate={{ 
                          height: `${height * 8}px`,
                          transition: {
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 0.5,
                            delay: i * 0.1
                          }
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {state.isPlaying ? 'Pause' : 'Play'}
          </TooltipContent>
        </Tooltip>

        <AnimatePresence>
          {isFloatingHovered && (
            <motion.div
              className="absolute right-full top-0 mr-3 rounded-lg shadow-xl p-3 w-64 border"
              style={{
                backgroundColor: resolvedTheme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderColor: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <div className="flex items-center gap-3">
                <Image 
                  className="rounded-md border"
                  height={48} 
                  width={48} 
                  alt="Album cover" 
                  src={currentPlayinMusic?.content.thumbnail || currentPlayinMusic?.folderPoster || "/images/default.png"} 
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {currentPlayinMusic?.content.title || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {getArtistNames()}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                  >
                    {state.isPlaying ? (
                      audioManager.loading ? <Loader2 size={14} className="animate-spin"/> : 
                      <Pause size={16} />
                    ) : (
                      audioManager.loading ? <Loader2 size={14} className="animate-spin"/> : 
                      <Play size={16} className="ml-0.5" />
                    )}
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onDoubleClick={()=>{
                if(!isDragging){
                    toggleMinimize()
                }
              }}
                  >
                    <Maximize2 size={16} />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {formatTime(state.currentTime)} / {formatTime(state.duration)}
                </div>
              </div>
              <div className="mt-2 relative">
                <Progress 
                  value={state.progress} 
                  className="h-1"
                  style={{
                    backgroundColor: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default DraggableMinimizedPlayer;