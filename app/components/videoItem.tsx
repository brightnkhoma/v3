import Image from "next/image"
import { MusicFolderItem } from "../lib/types"
import { useAppDispatch } from "../lib/local/redux/store"
import { setMeta } from "../lib/local/redux/reduxSclice"
import { Play, MoreHorizontal, ListMusic, Grid3x3, X } from "lucide-react"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"

interface MusicItemProps {
  item: MusicFolderItem
  meta: MusicFolderItem | null
  viewMode?: ViewMode
  className?: string,
  onClick : (item : MusicFolderItem) => Promise<void>
}

export const MusicItem: React.FC<MusicItemProps> = ({ 
  item, 
  meta, 
  viewMode = "grid", 
  className ,
  onClick
}) => {
  const { content, folderPoster } = item
  const dispatch = useAppDispatch()
  
  const isActive = meta?.content.contentId === item.content.contentId
  const thumbnailSrc = (content.thumbnail && content.thumbnail.length > 5) 
    ? content.thumbnail 
    : (folderPoster || "/images/default.png")

  return (
    <div 
      onClick={() => dispatch(setMeta(item))}
      onDoubleClick={async ()=> await onClick(item)}
      className={cn(
        "max-h-[12rem] h-max group transition-all cursor-pointer",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50",
        isActive ? "bg-blue-100 dark:bg-blue-900" : "bg-white dark:bg-gray-700",
        {
          // Grid View Styles
          "flex flex-col gap-1 p-2 rounded-lg w-[120px] min-w-[120px] sm:w-[140px] sm:min-w-[140px]": viewMode === "grid",
          // List View Styles
          "flex flex-row items-center gap-3 p-2 rounded-lg w-full": viewMode === "list",
        },
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={`Select ${content.title}`}
    >
      {/* Thumbnail Container */}
      <div className={cn(
        "relative overflow-hidden shadow-sm",
        {
          "aspect-square w-full rounded-md": viewMode === "grid",
          "aspect-square h-12 w-12 rounded-sm": viewMode === "list",
        }
      )}>
        <Image
          fill
          alt={`Album art for ${content.title}`}
          src={thumbnailSrc}
          className="object-cover transition-transform group-hover:scale-105"
          sizes={viewMode === "grid" 
            ? "(max-width: 768px) 100px, (max-width: 1200px) 140px, 140px" 
            : "48px"}
          priority={false}
        />
        
        {/* Play button overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          "transition-all duration-200",
          "bg-black bg-opacity-20",
          {
            "opacity-0 group-hover:opacity-100": viewMode === "grid",
            "opacity-0": viewMode === "list",
          },
          isActive ? "opacity-100" : ""
        )}>
          <Play className={cn(
            "text-white fill-white",
            {
              "h-6 w-6": viewMode === "grid",
              "h-4 w-4": viewMode === "list",
            }
          )} />
        </div>
      </div>
      
      {/* Text Content */}
      <div className={cn(
        "flex flex-col min-w-0",
        {
          "px-1": viewMode === "grid",
          "flex-1": viewMode === "list",
        }
      )}>
        <h3 className={cn(
          "font-medium truncate dark:text-white",
          {
            "text-xs": viewMode === "grid",
            "text-sm": viewMode === "list",
          }
        )}>
          {content.title}
        </h3>
        <p className={cn(
          "text-gray-500 dark:text-gray-400 truncate",
          {
            "text-[0.7rem]": viewMode === "grid",
            "text-xs": viewMode === "list",
          }
        )}>
          {[item.artistName,...content.artists]?.join(", ") || "Unknown Artist"}
        </p>
        {viewMode === "list" && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {content.duration ? formatDuration(content.duration) : "0:00"}
          </p>
        )}
      </div>
      
      {/* Context menu button */}
      <button 
        className={cn(
          "rounded-full transition-opacity",
          "hover:bg-gray-200 dark:hover:bg-gray-600",
          {
            "absolute top-1 right-1 p-0.5 opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-gray-600/80 backdrop-blur-sm": viewMode === "grid",
            "p-1 ml-auto": viewMode === "list",
          },
          isActive ? "opacity-100" : ""
        )}
        onClick={(e) => {
          e.stopPropagation()
          // Handle context menu click
        }}
        aria-label="More options"
      >
        <MoreHorizontal className={cn(
          {
            "h-3 w-3": viewMode === "grid",
            "h-4 w-4": viewMode === "list",
          }
        )} />
      </button>
    </div>
  )
}

// Helper function to format duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}