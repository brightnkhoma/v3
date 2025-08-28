"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { useCallback, useContext, useEffect, useState } from "react"
import { Play, Pause, Share2, MessageCircleMoreIcon, DownloadIcon, Heart, Loader, MoreHorizontal, Loader2 } from "lucide-react"
import { ContentFile, MusicFolderItem } from "../lib/types"
import { firestoreTimestampToDate } from "../lib/config/timestamp"
import { AppContext } from "../appContext"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { RootState, useAppSelector } from "../lib/local/redux/store"
import { getLikeCount, getUserLike, likeMusic, onGetPaidContent, purchase } from "../lib/dataSource/contentDataSource"
import { v4 } from "uuid"
import { useRouter } from "next/navigation"
import { showToast } from "../lib/dataSource/toast"

type MusicInfoProps = {
  isPlaying: boolean
  onPlayClick: () => void
  isLiked: boolean
  onLikeClick: () => void
  likeCount: number
  folderName: string
  musicName: string
  dateCreated: Date
  artist: string
  duration: number
  currentTime: number
  loading : boolean,
  isPaid : boolean | undefined,
  price : number,
  onPurchaseContent : ()=> Promise<void>,
  onLoading : boolean,
  image : string,
  commentsCount : number,
  onNavigateToComments : ()=> void,
  handleShare : ()=> void
}

type PlayOptionsProps = {
  isPlaying: boolean
  onPlayClick: () => void
  isLiked: boolean
  onLikeClick: () => void
  likeCount: number
  shareCount: number
  commentCount: number,
  loading : boolean,
  isPaid : boolean | undefined,
  price : number,
  onLoading : boolean,
  onPurchaseContent : ()=> Promise<void>,
  onNavigateToComments : ()=> void,
  handleShare : ()=> void
}

interface AlbumPlayerProps {
  item: MusicFolderItem,
  onNavigateToComments : ()=> void
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

export const AlbumPlayer: React.FC<AlbumPlayerProps> = ({ item,onNavigateToComments }) => {
  const {user }  = useAppSelector((state : RootState) => state.auth)
  const { audioManager } = useContext(AppContext)!
  const isLiked = audioManager.isLiked
  const likeCount = audioManager.like
  const [ui,setUi] = useState<number>(3)
  const commentsCount = audioManager.commentsCount
  const updateUi = useCallback(()=>{
        setUi(prev=>prev == 3 ? 2 : 3)
      },[ui])

  const {progress,audioRef,currentTime} = audioManager
  const [count, setCount] = useState<number>(0)
  const [isPaid, setIsPaid] = useState<boolean>(false)


  const onCheckIfContentIsPaid = async ()=>{
    const price = item.content.pricing.price || item.price?.price || 0
    if(price == 0 || item.isPaid){
      setIsPaid(true)

    }
    if(!user || !user.userId || user.userId.length < 4) return;

    await onGetPaidContent(item,user,setIsPaid)
  }


 
  const duration = Number(item.content.duration)
  const router = useRouter()
  const [onLoading, setOnLoading] = useState<boolean>(false)

  useEffect(()=>{
      audioManager._updateUi = updateUi
  },[])

   const handleShare = async () => {
    if (navigator.share) {
      try {
        const uri = window.location.href.split("/") 
        const uri1 = uri.slice(0,uri.length-1).join("/") + "/" + item.content.contentId
        await navigator.share({
          title: "Check out this song 🎵 from" + item.artistName || item.owner.name || "",
          text: "Listen to this awesome track! \n" + item.content.title,
          url: uri1, 
        });
        console.log("Shared successfully!");
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Sharing not supported on this browser, please copy the link manually.");
    }
  };
  

  const onPurchaseContent = async()=>{
     
    if(!(user && user.userId && user.userId.length > 5 )) return router.push("/login");
    setOnLoading(true)
    await purchase(user,item,()=>{
      setOnLoading(false)
      if(typeof window != undefined){
        window.location.reload()
      }
    },()=>{
       window.location.reload()
      setOnLoading(false)
    })
  }
  

  const setProgress = (value: number) => {
    audioManager.progress = value
  }

  const handleProgressChange = (value: number[]) => {
    const newProgress = value[0]
    setProgress(newProgress)
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * duration
    }
  }

 

 

  


  useEffect(()=>{
    audioManager.onGetLikeCount()

  },[likeCount,item])




const handlePlay = async (): Promise<void> => {
  try {
    audioManager.togglePlayPause()
  } catch (error) {
    console.error("Error during playback:", error);
  }
}

useEffect(()=>{
  onCheckIfContentIsPaid()
},[item])




  if (!item) {
    return (
      <div className="w-full justify-center items-center min-h-screen h-full flex">
        <Loader className="animate-spin mx-auto my-auto" size={60} />
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-gradient-to-b from-primary/20 via-background to-background rounded-xl p-4 md:p-6 w-full  mx-auto shadow-2xl border border-border">
      <MusicInfo
      handleShare={handleShare}
      onNavigateToComments={onNavigateToComments}
      commentsCount={commentsCount}
        isPlaying={audioManager.audioRef.current?.paused ? false : true}
        onPlayClick={handlePlay}
        isLiked={isLiked}
        onLikeClick={async()=>await audioManager.handleLike(item)}
        likeCount={likeCount}
        dateCreated={firestoreTimestampToDate(item.content.releaseDate as any)}
        folderName={item.folderName}
        musicName={item.content.title}
        artist={item.artistName}
        duration={duration}
        currentTime={currentTime}
        loading = {false}
        isPaid={isPaid}
        price={item.content.pricing.price || item.price?.price || 0}
        onLoading = {onLoading}
        onPurchaseContent={onPurchaseContent}
        image={item.content.thumbnail || item.folderPoster}
      />

      <div className="mt-6 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <Slider
          value={[progress]}
          onValueChange={handleProgressChange}
          max={100}
          step={0.1}
          className="w-full cursor-pointer"
        />
      </div>
    </div>
  )
}

const MusicInfo = ({
  isPlaying,
  onPlayClick,
  isLiked,
  onLikeClick,
  likeCount,
  dateCreated,
  folderName,
  musicName,
  artist,
  loading,
  isPaid,
  price,
  onPurchaseContent,
  onLoading,
  image,
  commentsCount,
  onNavigateToComments,
  handleShare
}: MusicInfoProps) => {
  return (
    <div className="flex flex-col md:flex-row w-full gap-4 md:gap-6">
      <div className="relative aspect-square w-full max-w-[200px] md:w-48 md:h-48 rounded-lg overflow-hidden shadow-lg group mx-auto md:mx-0">
        <Image
          src={image || "/images/default.png"}
          alt="Album cover"
          fill
          className="object-cover"
          priority
        />
        <button
          onClick={onPlayClick}
          className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
           <Pause className="w-10 h-10 text-white" />)
          : (
             <Play className="w-10 h-10 text-white fill-white" />
          )}
        </button>
        {isPlaying && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-2 bg-primary rounded-full animate-equalizer"
                style={{
                  width: '3px',
                  animationDelay: `${i * 0.1}s`,
                  height: isPlaying ? `${Math.random() * 12 + 4}px` : '4px'
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-2">
          <h1 className="font-bold text-2xl md:text-3xl text-foreground line-clamp-2">{folderName}</h1>
          <h2 className="text-lg md:text-xl text-muted-foreground mt-1">{musicName}</h2>
          <span className="text-muted-foreground text-sm">Album • {dateCreated.getFullYear()}</span>
        </div>

        <Artist artist={artist} />

        <div className="mt-4 flex-1"></div>

        <PlayOptions
         handleShare={handleShare}
        onNavigateToComments={onNavigateToComments}
          isPlaying={isPlaying}
          onPlayClick={onPlayClick}
          isLiked={isLiked}
          onLikeClick={onLikeClick}
          likeCount={likeCount}
          shareCount={45}
          commentCount={commentsCount}
          loading = {loading}
          isPaid={isPaid}
          price={price}
          onLoading = {onLoading}
          onPurchaseContent={onPurchaseContent}
        />
      </div>
    </div>
  )
}

const Artist = ({ artist }: { artist: string }) => {
  return (
    <div className="flex gap-3 items-center group mt-4">
      <Avatar className="group-hover:ring-2 group-hover:ring-primary transition-all duration-200 h-10 w-10">
        <AvatarImage src={"/images/1.webp"} className="object-cover" />
        <AvatarFallback>BN</AvatarFallback>
      </Avatar>
      <div>
        <span className="text-sm text-muted-foreground">Artist</span>
        <h2 className="hover:underline text-foreground font-medium cursor-pointer">
          {artist}
        </h2>
      </div>
    </div>
  )
}

const PlayOptions = ({
  isPlaying,
  onPlayClick,
  isLiked,
  onLikeClick,
  likeCount,
  shareCount,
  commentCount,
  loading,
  isPaid,
  price,
  onPurchaseContent,
  onLoading,
  onNavigateToComments,
  handleShare
}: PlayOptionsProps) => {

   
  
  return (
    <div className="flex flex-wrap gap-2 py-3">
      <Button
        disabled = {loading}
        onClick={onPlayClick}
        className="rounded-full px-6 gap-2"
        size="sm"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
         <Play className="w-4 h-4" />
        )}
        <span>{isPlaying ? 'Pause' : 'Play All'}</span>
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-2"
            onClick={onLikeClick}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-destructive text-destructive' : ''}`} />
            <span>{likeCount}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isLiked ? 'Remove from favorites' : 'Add to favorites'}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={handleShare} variant="ghost" size="sm" className="rounded-full gap-2">
            <Share2 className="w-4 h-4" />
            <span>{shareCount}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share this track</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onNavigateToComments} variant="ghost" size="sm" className="rounded-full gap-2">
            <MessageCircleMoreIcon className="w-4 h-4" />
            <span>{commentCount}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>View comments</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="rounded-full">
            <DownloadIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="rounded-full">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>More options</TooltipContent>
      </Tooltip>
     {!isPaid && <Tooltip>
        <TooltipTrigger asChild>
          {onLoading ? <Loader className="animate-spin" size={18}/> : <Button onClick={onPurchaseContent} variant="ghost" size="sm" className="rounded-full">
           purchase mk{price}
          </Button>}
        </TooltipTrigger>
        <TooltipContent>Purchase content, if you already purchased this content reload the page.</TooltipContent>
      </Tooltip>}
    </div>
  )
}