"use client"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Share2, ListMusic, Repeat, Shuffle, Heart, MoreHorizontal, Minimize2, Maximize2, Loader2, Loader } from "lucide-react"
import { RootState, useAppDispatch, useAppSelector } from "../lib/local/redux/store"
import { useRef, useState, useEffect, useCallback, useReducer, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ContentFile, MusicFolderItem } from "../lib/types"
import { useContext } from "react"
import { AppContext } from "../appContext"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { setAudioFile } from "../lib/local/redux/reduxSclice"
import { useRouter } from "next/navigation"
import DraggableMinimizedPlayer from "./minimised"
import { cn } from "@/lib/utils"

function audioReducer(state: any, action: any) {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload }
    case 'UPDATE_PROGRESS':
      return { 
        ...state, 
        currentTime: action.payload.currentTime,
        progress: action.payload.progress,
        duration: action.payload.duration
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_FILE':
      return { ...state, file: action.payload }
    default:
      return state
  }
}

const initialState = {
  isPlaying: false,
  currentTime: 0,
  progress: 0,
  duration: 0,
  loading: false,
  file: null
}

export const AudioPlayer = () => {
  const [isMinimized, setIsMinimized] = useState<boolean>(true)
  const {audioManager} = useContext(AppContext)!
  const {albumCopy,audioRef,currentTime,duration,init,next,item : currentPlayinMusic,isPlaying,progress,prev,togglePlayOrder,togglePlayPause,onChangeVolume,togleMute} = audioManager
  const [isFloatingHovered, setIsFloatingHovered] = useState<boolean>(false)
  const volume = audioRef.current?.volume || 0.1
  const isMuted = audioRef.current?.muted ? true : false
  const [showOptions, setShowOptions] = useState(false);
  const playOrder = audioManager.playOrder
  const {user,audioFile} = useAppSelector((state : RootState)=> state.auth)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [ui,setUi] = useState<number>(3)
  const [isLiked, setIsLiked] = useState(false)
  
  const updateUi = useCallback(()=>{
    setUi(prev=>prev == 3 ? 2 : 3)
  },[ui])

  const [isHovering, setIsHovering] = useState<boolean>(false)
  const state = {
    isPlaying,
    currentTime,
    progress,
    duration
  }

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    onChangeVolume(newVolume * 100)
  }, [onChangeVolume]);

  const toggleMute = useCallback(() => {
    togleMute()
  }, [togleMute]);

  const formatTime = useCallback((time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  const toggleMinimize = () => {
    setIsMinimized(prev => !prev)
  }

  const handleProgressChange = useCallback((value: number[]) => {
    const newProgress = value[0];
    const newTime = (newProgress / 100) * state.duration;
    audioManager.currentTime = newTime
    audioManager.progress = newProgress
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  }, [state.duration, audioRef, audioManager]);

  const updateFile = (myFile : ContentFile)=>{
    dispatch(setAudioFile(myFile))
  }

  useEffect(()=>{
    if(!audioManager.dispatch){
        audioManager.dispatch = updateFile
    }
    const onInit = async()=>{
        audioManager.user = user
        await init(audioFile!)
    }
    onInit()
  },[audioManager, audioFile, user, init])

  useEffect(()=>{
    if(!audioManager.updateUi){
      audioManager.updateUi = updateUi
    }
  },[audioManager, updateUi])

  const toggleLike = () => {
    setIsLiked(!isLiked)
  }

  const getAlbumArt = () => {
    return currentPlayinMusic?.content?.thumbnail || 
           currentPlayinMusic?.folderPoster || 
           "/images/default.png"
  }

  return (
    <TooltipProvider>
      <div className="relative">
        {audioManager.updateUi && (
          <div>
            <AnimatePresence>
              {isMinimized && (
                <DraggableMinimizedPlayer 
                  audioManager={audioManager} 
                  isMinimized={isMinimized} 
                  state={state} 
                  toggleMinimize={toggleMinimize} 
                  togglePlayPause={togglePlayPause} 
                  currentPlayinMusic={currentPlayinMusic!}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div 
                  className="flex flex-col bg-background/95 backdrop-blur-xl text-foreground p-6 w-full rounded-2xl shadow-2xl border border-border/50"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <div className="flex flex-col lg:flex-row gap-6 mb-6">
                    <div className="flex items-center gap-4 flex-1">
                      <motion.div 
                        className="relative overflow-hidden rounded-xl shadow-2xl flex-shrink-0"
                        whileHover={{ rotate: 1, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-20 h-20 lg:w-24 lg:h-24 relative">
                          <Image 
                            fill
                            alt="Album cover" 
                            src={getAlbumArt()}
                            className="object-cover"
                            sizes="96px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Play size={20} className="text-white" />
                          </div>
                        </div>
                      </motion.div>
                      
                      <div className="flex flex-col min-w-0 flex-1">
                        <motion.h3 
                          className="font-bold text-lg lg:text-xl line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                          whileHover={{ x: -2 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => router.push(`/media/music/play/${currentPlayinMusic?.content.contentId}`)}
                        >
                          {currentPlayinMusic?.content.title || 'Unknown Track'}
                        </motion.h3>
                        <motion.p 
                          className="text-sm text-muted-foreground line-clamp-1 hover:text-foreground transition-colors cursor-pointer"
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          {currentPlayinMusic?.artistName || currentPlayinMusic?.content.artists?.[0] || 'Unknown Artist'}
                        </motion.p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {currentPlayinMusic?.content.album || 'Single'}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {currentPlayinMusic?.content.genre || 'Music'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 flex-1">
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-xs text-muted-foreground w-12 text-right font-mono tabular-nums">
                          {formatTime(state.currentTime)}
                        </span>
                        
                        <Slider
                          value={[state.progress]}
                          onValueChange={handleProgressChange}
                          max={100}
                          step={0.1}
                          className="flex-1 cursor-pointer group"
                        />
                        
                        <span className="text-xs text-muted-foreground w-12 font-mono tabular-nums">
                          {formatTime(state.duration)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={togglePlayOrder}
                                className={cn(
                                  "rounded-full transition-all duration-200",
                                  playOrder !== 'sequential' 
                                    ? "text-primary bg-primary/10" 
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {playOrder === 'shuffle' ? (
                                  <Shuffle size={18} />
                                ) : playOrder === 'repeat' ? (
                                  <Repeat size={18} />
                                ) : (
                                  <ListMusic size={18} />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {playOrder === 'shuffle' ? 'Shuffle' : playOrder === 'repeat' ? 'Repeat' : 'Sequential'}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                onClick={prev} 
                                variant="ghost" 
                                size="sm"
                                className="rounded-full hover:scale-110 transition-transform"
                              >
                                <SkipBack size={20} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Previous</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={togglePlayPause}
                                className={cn(
                                  "rounded-full p-4 hover:scale-105 transition-all duration-200",
                                  "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                                )}
                                size="lg"
                                disabled={audioManager.loading}
                              >
                                {audioManager.loading ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : !audioRef.current?.paused ? (
                                  <Pause size={18} />
                                ) : (
                                  <Play size={18} className="ml-0.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {audioManager.loading ? 'Loading' : !audioRef.current?.paused ? 'Pause' : 'Play'}
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                onClick={next} 
                                variant="ghost" 
                                size="sm"
                                className="rounded-full hover:scale-110 transition-transform"
                              >
                                <SkipForward size={20} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Next</TooltipContent>
                          </Tooltip>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <AudioOptions 
                            volume={volume} 
                            isMuted={isMuted} 
                            toggleMute={toggleMute} 
                            handleVolumeChange={handleVolumeChange}
                          />
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleMinimize}
                                className="rounded-full hover:scale-110 transition-transform"
                              >
                                <Minimize2 size={18} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Minimize player</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={toggleLike}
                            className={cn(
                              "rounded-full transition-all duration-200",
                              isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Heart size={16} className={isLiked ? "fill-current" : ""} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isLiked ? 'Remove from favorites' : 'Add to favorites'}</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-full">
                            <Share2 size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-full">
                            <ListMusic size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add to playlist</TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowOptions(!showOptions)}
                          className="rounded-full"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>More options</TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <AnimatePresence>
                    {showOptions && (
                      <motion.div 
                        className="absolute right-6 bottom-16 bg-background/95 backdrop-blur-xl rounded-xl shadow-2xl p-2 w-56 z-50 border border-border/50"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg">
                          <ListMusic size={16} />
                          Add to playlist
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg">
                          <Share2 size={16} />
                          View album
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg">
                          <Download size={16} />
                          Download
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg">
                          <Clock size={16} />
                          Sleep timer
                        </Button>
                        <div className="border-t border-border/30 my-1"></div>
                        <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg">
                          <Settings size={16} />
                          Settings
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

interface AudioOptionsProps {
  volume: number
  isMuted: boolean
  toggleMute: () => void
  handleVolumeChange: (value: number[]) => void
}

const AudioOptions = ({ volume, isMuted, toggleMute, handleVolumeChange }: AudioOptionsProps) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  
  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
            className="rounded-full hover:scale-110 transition-transform"
          >
            {isMuted ? (
              <VolumeX size={18} className="text-muted-foreground" />
            ) : volume === 0 ? (
              <VolumeX size={18} />
            ) : volume < 0.5 ? (
              <Volume2 size={18} />
            ) : (
              <Volume2 size={18} className="text-primary" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
      </Tooltip>
      
      <AnimatePresence>
        {showVolumeSlider && (
          <motion.div 
            className="absolute -top-24 right-0 bg-background/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-border/50"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <div className="flex items-center gap-2 mb-2">
              <Volume2 size={14} className="text-muted-foreground" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.01}
                className="w-24"
                orientation="vertical"
              />
              <span className="text-xs text-muted-foreground w-8 text-center">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const Download = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const Clock = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Settings = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)