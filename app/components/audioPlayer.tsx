"use client"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Share2, ListMusic, Repeat, Shuffle, Heart, MoreHorizontal, Minimize2, Maximize2, Loader2, Loader } from "lucide-react"
import { RootState, useAppDispatch, useAppSelector } from "../lib/local/redux/store"
import { useRef, useState, useEffect, useCallback, useReducer, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence, progress } from "framer-motion"
import { ContentFile, MusicFolderItem } from "../lib/types"
import { useContext } from "react"
import { AppContext } from "../appContext"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { throttle } from "lodash"
import { getFileContent } from "../lib/dataSource/contentDataSource"
import { showToast } from "../lib/dataSource/toast"
import { setAudioFile } from "../lib/local/redux/reduxSclice"
import { useRouter } from "next/navigation"
import DraggableMinimizedPlayer from "./minimised"

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
  const {albumCopy,audioRef,currentTime,duration,init,next,item : currentPlayinMusic,isPlaying,progress,prev,togglePlayOrder,togglePlayPause} = audioManager
  const [isFloatingHovered, setIsFloatingHovered] = useState<boolean>(false)
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const playOrder = audioManager.playOrder
  const {user,audioFile} = useAppSelector((state : RootState)=> state.auth)
  const dispatch = useAppDispatch()
  const router = useRouter()
    const [ui,setUi] = useState<number>(3)
  const updateUi = useCallback(()=>{
        setUi(prev=>prev == 3 ? 2 : 3)
      },[ui])


  const [isHovering, setIsHovering] = useState<boolean>(false)
  const state = {
    isPlaying ,
    currentTime ,
    progress ,
    duration 

  }
    const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);


  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

 



    const formatTime = useCallback((time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

 

  const toggleMinimize = ()=>{
    setIsMinimized(prev=> !prev)
  }



    const handleProgressChange = useCallback((value: number[]) => {
    const newProgress = value[0];
    const newTime = (newProgress / 100) * state.duration;
    audioManager.currentTime = newTime
    audioManager.progress = newProgress
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  }, [state.duration, audioRef]);

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

  },[])

    useEffect(()=>{
    if(!audioManager.updateUi){
      audioManager.updateUi = updateUi
    }
  },[])
  
  



  


    return (
        <>
           
            
            {/* Minimized Floating Player */}
            {audioManager.updateUi &&<div>
                <AnimatePresence>
                {isMinimized && (<DraggableMinimizedPlayer audioManager={audioManager} isMinimized = {isMinimized} state={state} toggleMinimize={toggleMinimize} togglePlayPause={togglePlayPause} currentPlayinMusic={currentPlayinMusic!}/>
                )}
            </AnimatePresence>

            {/* Main Player */}
            <AnimatePresence>
                {!isMinimized && (
                    <motion.div 
                        className="flex flex-col bg-background text-foreground p-5 w-full rounded-2xl shadow-lg border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <div className="flex flex-col md:flex-row gap-6 mb-4">
                            {/* Album Art and Info */}
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    className="relative overflow-hidden rounded-lg shadow-lg w-16 h-16 md:w-20 md:h-20"
                                    whileHover={{ rotate: 1, scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Image 
                                        className="border hover:border-primary transition-all duration-300" 
                                        fill
                                        alt="Album cover" 
                                        src={"/images/default.png"} 
                                        sizes=""
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <Play size={20} className="text-white" />
                                    </div>
                                </motion.div>
                                
                                <div className="flex flex-col">
                                    <motion.span 
                                        className="font-bold text-lg line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                                        whileHover={{ x: -3 }}
                                        transition={{ duration: 0.3 }}
                                        onClick={()=>{
                                            router.push(`/media/music/play/${currentPlayinMusic?.content.contentId}`)
                                        }}
                                    >
                                        {currentPlayinMusic?.content.title  || 'Unknown'}
                                    </motion.span>
                                    <motion.span 
                                        className="text-sm text-muted-foreground line-clamp-1 hover:text-foreground transition-colors cursor-pointer"
                                        whileHover={{ x: 3 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {currentPlayinMusic?.artistName  || 'Unknown Artist'}
                                    </motion.span>
                                </div>
                            </div>
                            
                            {/* Player Controls */}
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="flex items-center justify-center gap-6">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={togglePlayOrder}
                                                className={`rounded-full ${playOrder !== 'sequential' ? 'text-primary' : 'text-muted-foreground'}`}
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
                                    
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button onClick={prev} variant="ghost" size="sm">
                                                <SkipBack size={20} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Previous</TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={togglePlayPause}
                                                className="rounded-full p-4"
                                                size="lg"
                                            >
                                                {!audioRef.current?.paused ? (
                                                    audioManager.loading ? <Loader size={14} className="animate-spin"/> : 
                                                   <div>
                                                   <Pause size={16} />
                                                   </div>
                                                ) : (
                                                    audioManager.loading ? <Loader size={14} className="animate-spin"/> : 
                                                   <div>
                                               <Play size={16} className="ml-0.5" />
                                                   </div>
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>{!audioRef.current?.paused ? 'Pause' : 'Play'}</TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button onClick={next} variant="ghost" size="sm">
                                                <SkipForward size={20} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Next</TooltipContent>
                                    </Tooltip>
                                    
                                    <AudioOptions 
                                        volume={volume} 
                                        isMuted={isMuted} 
                                        toggleMute={toggleMute} 
                                        handleVolumeChange={handleVolumeChange}
                                    />
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="flex items-center gap-4 w-full">
                                    <span className="text-xs text-muted-foreground w-12 text-right font-mono">
                                        {formatTime(state.currentTime)}
                                    </span>
                                    
                                    <Slider
                                        value={[state.progress]}
                                        onValueChange={handleProgressChange}
                                        max={100}
                                        step={0.1}
                                        className="w-full cursor-pointer"
                                    />
                                    
                                    <span className="text-xs text-muted-foreground w-12 font-mono">
                                        {formatTime(state.duration)}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Minimize Button */}
                            <div className="flex items-center justify-end">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={toggleMinimize}
                                        >
                                            <Minimize2 size={18} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Minimize player</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        
                        {/* Bottom Controls */}
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <Heart size={16} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Add to favorites</TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <Share2 size={16} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Share</TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm">
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
                                    >
                                        <MoreHorizontal size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>More options</TooltipContent>
                            </Tooltip>
                        </div>
                        
                        {/* Options Dropdown */}
                        <AnimatePresence>
                            {showOptions && (
                                <motion.div 
                                    className="absolute right-5 bottom-16 bg-background rounded-lg shadow-lg p-2 w-56 z-10 border"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Button variant="ghost" className="w-full justify-start">
                                        Add to playlist
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start">
                                        View album
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start">
                                        Download
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start">
                                        Sleep timer
                                    </Button>
                                    <div className="border-t my-1"></div>
                                    <Button variant="ghost" className="w-full justify-start">
                                        Settings
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
            }
        </>
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
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
            </Tooltip>
            
            <AnimatePresence>
                {showVolumeSlider && (
                    <motion.div 
                        className="absolute -top-12 right-0 bg-background p-3 rounded-lg shadow-lg border"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                        <Slider
                            value={[volume]}
                            onValueChange={handleVolumeChange}
                            max={1}
                            step={0.01}
                            className="w-24"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}