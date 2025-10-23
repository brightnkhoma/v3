"use client"
import { useEffect, useState, useRef, useContext, useCallback } from "react"
import { Play, Pause, Square, Volume2, VolumeX, Maximize, Settings, List, Minimize, 
         RotateCcw, RotateCw, Captions, PictureInPicture } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { TooltipTrigger } from "@radix-ui/react-tooltip"
import { AppContext } from "@/app/appContext"

export const InVideoBottomBar = ({setShowPlaylist,showPlaylist} : {setShowPlaylist : (x:boolean)=> void,showPlaylist : boolean}) => {
  const {videoManager} = useContext(AppContext)!
  const {currentTime,progress,duration,onToglePlayPause,onChangeVolume,onSeek} = videoManager
  const isPlaying = !videoManager.videoRef.current?.paused
  const isMuted = videoManager.videoRef.current?.muted
  const [ui,setUi] = useState<number>(3)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPlaybackSpeed, setShowPlaybackSpeed] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  
  const updateUi = useCallback(()=>{
    setUi(prev=>prev == 3 ? 2 : 3)
  },[ui])

  useEffect(()=>{
    videoManager.updateui = updateUi
  },[videoManager])
  
  const handleFullscreen = () => {
    const container = document.querySelector('.video-container')
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
      } else {
        document.exitFullscreen()
      }
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
      setShowSettings(false)
      setShowPlaybackSpeed(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const playbackSpeeds = [
    { value: 0.25, label: '0.25x' },
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: 'Normal' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' },
  ]

  const controls: VideoControlButtonProps[] = [
    {
      icon: isPlaying ? <Pause className="size-4 sm:size-5 text-gray-50" /> : <Play className="size-4 sm:size-5 text-gray-50" />,
      name: isPlaying ? "Pause" : "Play",
      onClick: onToglePlayPause
    },
    {
      icon: <Square className="size-4 sm:size- text-gray-50 " />,
      name: "Stop",
      onClick: () => {
        if (videoManager.videoRef.current) {
          videoManager.videoRef.current.pause()
          videoManager.videoRef.current.currentTime = 0
        }
      }
    },
    {
      icon: isMuted ? <VolumeX className="size-4 sm:size- text-gray-50" /> : <Volume2 className="size-4 sm:size- text-gray-50" />,
      name: isMuted ? "Unmute" : "Mute",
      onClick: () => videoManager.onToggleMute(),
      onMouseEnter: () => setShowVolumeSlider(true),
      onMouseLeave: () => {
        setTimeout(()=>{
          setShowVolumeSlider(false)
        },5000)
      },
    },
  ]

  const rightControls: VideoControlButtonProps[] = [
    {
      icon: <RotateCcw className="size-4 sm:size- text-gray-50" />,
      name: "Rewind 10s",
      onClick: () => {
        if (videoManager.videoRef.current) {
          videoManager.videoRef.current.currentTime -= 10
        }
      }
    },
    {
      icon: <RotateCw className="size-4 sm:size- text-gray-50" />,
      name: "Forward 10s",
      onClick: () => {
        if (videoManager.videoRef.current) {
          videoManager.videoRef.current.currentTime += 10
        }
      }
    },
    {
      icon: <List className="size-4 sm:size- text-gray-50" />,
      name: showPlaylist ? "Hide Playlist" : "Show Playlist",
      onClick: () => setShowPlaylist(!showPlaylist)
    },
    {
      icon: <Settings className="size-4 sm:size- text-gray-50" />,
      name: "Settings",
      onClick: () => {
        setShowSettings(!showSettings)
        setShowPlaybackSpeed(false)
      }
    },
    {
      icon: isFullscreen ? <Minimize className="size-4 sm:size- text-gray-50" /> : <Maximize className="size-4 sm:size- text-gray-50" />,
      name: isFullscreen ? "Exit Fullscreen" : "Fullscreen",
      onClick: handleFullscreen
    },
  ]

  if(!videoManager.currentPlayingVideo){
    return null
  }

  return (
    <div className="flex flex-col w-full absolute left-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pb-2 sm:pb-3 transition-all duration-300">
      <ProgressBar seek={onSeek} duration={duration} progress={progress} isPlaying={isPlaying} />
      
      <div className="flex flex-row items-center justify-between px-2 sm:px-4 w-full">
        <div className="flex flex-row items-center gap-1 sm:gap-2">
          {controls.map((item, index) => (
            <VideoControlButton 
              {...item}
              key={index}
            />
          ))}
          
          <div className="relative group">
            <VolumeSlider 
              isMuted={isMuted ? true : false} 
              show={showVolumeSlider}
              volume={videoManager.videoRef.current?.volume || 0}
              onChangeVolume={onChangeVolume}
            />
          </div>
          
          <TimeDisplay currentTime={currentTime} duration={duration} />
        </div>
        
        <div className="flex flex-row items-center gap-1 sm:gap-2">
          {rightControls.map((item, index) => (
            <VideoControlButton 
              {...item}
              key={index}
            />
          ))}
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div 
          ref={settingsRef}
          className="absolute bottom-12 right-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 w-48 sm:w-56 shadow-xl z-50"
        >
          <h3 className="text-foreground text-sm font-semibold mb-3">Settings</h3>
          <div className="space-y-3">
            {/* Playback Speed */}
            <div className="relative">
              <button 
                className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted transition-colors"
                onClick={() => setShowPlaybackSpeed(!showPlaybackSpeed)}
              >
                <span className="text-foreground text-xs">Playback Speed</span>
                <span className="text-foreground/70 text-xs">
                  {playbackSpeeds.find(speed => speed.value === (videoManager.videoRef.current?.playbackRate || 1))?.label}
                </span>
              </button>
              
              {showPlaybackSpeed && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
                  {playbackSpeeds.map((speed) => (
                    <button
                      key={speed.value}
                      className={`w-full text-left p-2 rounded text-xs transition-colors ${
                        (videoManager.videoRef.current?.playbackRate || 1) === speed.value 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-foreground hover:bg-muted'
                      }`}
                      onClick={() => {
                        if (videoManager.videoRef.current) {
                          videoManager.videoRef.current.playbackRate = speed.value
                        }
                        setShowPlaybackSpeed(false)
                      }}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality */}
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors">
              <span className="text-foreground text-xs">Quality</span>
              <select 
                className="bg-transparent text-foreground text-xs border-none focus:outline-none"
                onChange={(e) => {
                }}
              >
                <option>Auto</option>
                <option>1080p</option>
                <option>720p</option>
                <option>480p</option>
              </select>
            </div>

            {/* Captions */}
            <button className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted transition-colors">
              <span className="text-foreground text-xs">Captions</span>
              <Captions className="size-4 text-foreground/70" />
            </button>

            {/* Picture in Picture */}
            <button 
              className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => videoManager.videoRef.current?.requestPictureInPicture()}
            >
              <span className="text-foreground text-xs">Picture in Picture</span>
              <PictureInPicture className="size-4 text-foreground/70" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface VideoControlButtonProps {
  name: string
  onClick: () => void
  icon: React.ReactNode
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const VideoControlButton: React.FC<VideoControlButtonProps> = ({ 
  icon, 
  name, 
  onClick, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-md hover:bg-foreground/20 transition-all duration-200 active:scale-95"
            aria-label={name}
          >
            <div className="text-foreground/90 hover:text-foreground">
              {icon}
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-foreground text-background text-xs font-medium px-2 py-1 border-none"
        >
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface ProgressBarProps {
  isPlaying: boolean,
  progress : number,
  duration : number,
  seek : (position : number) => void
}

const ProgressBar: React.FC<ProgressBarProps> = ({ isPlaying, progress, duration, seek }) => {
  const [isSeeking, setIsSeeking] = useState<boolean>(false)
  const [hoverProgress, setHoverProgress] = useState<number | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect()
      const clickPosition = e.clientX - rect.left
      const newProgress = (clickPosition / rect.width) * duration
      seek(newProgress)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect()
      const hoverPosition = e.clientX - rect.left
      const newHoverProgress = (hoverPosition / rect.width) * 100
      setHoverProgress(Math.max(0, Math.min(100, newHoverProgress)))
    }
  }

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full px-2 sm:px-4 mb-1 sm:mb-2">
      <div className="flex items-center gap-2 text-xs text-foreground/80">
        <span className="min-w-[40px] text-right text-gray-50">{formatTime((progress / 100) * duration)}</span>
        <div 
          ref={progressRef}
          className="flex-1 h-6  flex items-center cursor-pointer group relative"
          onClick={handleProgressClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverProgress(null)}
        >
          <div className="w-full h-1.5 bg-foreground/30 rounded-full overflow-hidden">
            <div 
              className="h-full dark:bg-primary bg-amber-300  rounded-full relative transition-all duration-100"
              style={{ width: `${progress}%` }}
            > 
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg" />
            </div>
          </div>
          
          {/* Hover preview */}
          {hoverProgress !== null && (
            <div 
              className="absolute top-0 h-full bg-foreground/20 rounded-full pointer-events-none"
              style={{ width: `${hoverProgress}%` }}
            />
          )}
          
          {/* Time tooltip on hover */}
          {hoverProgress !== null && (
            <div className="absolute bottom-full mb-2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
              {formatTime((hoverProgress / 100) * duration)}
            </div>
          )}
        </div>
        <span className="min-w-[40px] text-gray-50">{formatTime(duration)}</span>
      </div>
    </div>
  )
}

interface VolumeSliderProps {
  isMuted: boolean
  show: boolean
  volume: number
  onChangeVolume: (volume: number) => void
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({ isMuted, show, volume, onChangeVolume }) => {
  const sliderRef = useRef<HTMLDivElement>(null)
  
  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect()
      const clickPosition = e.clientX - rect.left
      let newVolume = (clickPosition / rect.width) * 100
      newVolume = Math.max(0, Math.min(100, newVolume))
      onChangeVolume(newVolume)
    }
  }
  
  return (
    <div 
      className={`flex items-center ml-2 transition-all duration-300 ${
        show ? 'opacity-100 w-20' : 'opacity-0 w-0'
      }`}
    >
      <div 
        ref={sliderRef}
        className="w-full h-1.5 bg-foreground/30 rounded-full overflow-hidden cursor-pointer group"
        onClick={handleVolumeChange}
      >
        <div 
          className="h-full bg-primary rounded-full transition-all duration-200 relative"
          style={{ width: `${isMuted ? 0 : volume}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  )
}

interface TimeDisplayProps {
  currentTime: number
  duration: number
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ currentTime, duration }) => {
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="text-xs text-gray-50 mx-2 min-w-[85px] text-center hidden sm:block">
      {formatTime(currentTime)} / {formatTime(duration)}
    </div>
  )
}