"use client";
import { VideoFolderItem, User } from "../lib/types";
import { RootState, useAppSelector } from "../lib/local/redux/store";
import { useContext, useEffect, useRef, useState } from "react";
import { InVideoBottomBar } from "./ui/inVideoBottomBar";
import { Playlist } from "./playList";
import { AppContext } from "../appContext";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

interface VideoPlayerProps {
  video?: VideoFolderItem;
  autoPlay?: boolean;
  className?: string;
}

export const VideoPlayer = ({ className = "" }: VideoPlayerProps) => {
  const { videoManager } = useContext(AppContext)!;
  const videoRef = videoManager.videoRef;
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getVideoContainerStyle = () => {
    if (videoManager.videoRef.current) {
      const video = videoManager.videoRef.current;
      const isPortrait = video.videoHeight > video.videoWidth;
      
      if (isPortrait) {
        return "max-w-[400px] lg:max-w-[500px] mx-auto h-full";
      }
      
      if (isFullscreen) {
        return "w-screen h-screen";
      }
      
      return "w-full h-full";
    }
    return "w-full h-full";
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    setIsHovering(true);
    
    // Hide controls after 3 seconds of inactivity
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (!isHovering && isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when video is focused or in fullscreen
      if (!containerRef.current?.contains(document.activeElement) && !document.fullscreenElement) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;
        case "f":
          e.preventDefault();
          handleFullscreen();
          break;
        case "m":
          e.preventDefault();
          videoManager.onToggleMute();
          setIsMuted(!isMuted);
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime -= 10;
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime += 10;
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
          }
          break;
        case "k":
          e.preventDefault();
          handlePlayPause();
          break;
        case "l":
          e.preventDefault();
          setShowPlaylist(!showPlaylist);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, isMuted, showPlaylist]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Show controls when entering/exiting fullscreen
      setShowControls(true);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);
    const handleLoadStart = () => setShowControls(true);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  const handleVideoClick = () => {
    handlePlayPause();
    // Show controls briefly when clicking video
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <div 
      ref={containerRef}
      className={`
        relative bg-black rounded-lg overflow-hidden transition-all duration-300
        ${className} ${getVideoContainerStyle()} video-container
        ${isFullscreen ? 'rounded-none' : 'shadow-xl'}
      `}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="application"
      aria-label="Video player"
    >
      {/* Video Element */}
      <div className="w-full h-full flex justify-center items-center">
        <video
          className="w-full h-full object-contain"
          controls={false}
          ref={videoRef}
          onClick={handleVideoClick}
          playsInline
          preload="metadata"
          onTimeUpdate={videoManager.listenToVideoPlay}
          onEnded={videoManager.next}
          aria-label={videoManager.currentPlayingVideo?.content.title || "Video content"}
        />
      </div>

      {/* Loading Spinner */}
      {videoManager.currentPlayingVideo && videoRef.current?.readyState !== 4 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Center Play/Pause Button */}
      {!isPlaying && (
        <button
          onClick={handlePlayPause}
          className={`
            absolute inset-0 flex items-center justify-center transition-all duration-300
            ${showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
          `}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          <div className="bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all duration-200 hover:scale-110">
            <Play className="size-12 sm:size-16 text-white" />
          </div>
        </button>
      )}

      {/* Top Controls Bar */}
      <div 
        className={`
          absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent 
          p-4 transition-all duration-300
          ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        `}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-white font-semibold text-sm sm:text-base truncate max-w-[70%]">
            {videoManager.currentPlayingVideo?.content.title}
          </h2>
          <button
            onClick={handleFullscreen}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="size-4 sm:size-5" />
            ) : (
              <Maximize className="size-4 sm:size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 transition-all duration-300
          ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <InVideoBottomBar 
          setShowPlaylist={setShowPlaylist} 
          showPlaylist={showPlaylist} 
        />
      </div>

      {/* Quick Actions Bar (shown when controls are hidden) */}
      {!showControls && isPlaying && (
        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => {
              if (videoRef.current) videoRef.current.currentTime -= 10;
              setShowControls(true);
            }}
            className="bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all duration-200"
            aria-label="Rewind 10 seconds"
          >
            <span className="text-white font-bold text-sm">-10s</span>
          </button>
          <button
            onClick={() => {
              if (videoRef.current) videoRef.current.currentTime += 10;
              setShowControls(true);
            }}
            className="bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all duration-200"
            aria-label="Forward 10 seconds"
          >
            <span className="text-white font-bold text-sm">+10s</span>
          </button>
        </div>
      )}

      {/* Playlist */}
      <Playlist 
        isOpen={showPlaylist} 
        onClose={() => setShowPlaylist(false)} 
        onSelectVideo={() => {
          setShowPlaylist(false);
          setShowControls(true);
        }} 
      />

      {/* Error State */}
      {videoRef.current?.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white p-4">
            <div className="text-red-400 text-lg mb-2">⚠️</div>
            <p className="text-sm">Failed to load video</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};