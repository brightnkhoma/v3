import { setMeta } from '@/app/lib/local/redux/reduxSclice'
import { RootState, useAppDispatch, useAppSelector } from '@/app/lib/local/redux/store'
import { MusicFolderItem, MusicFolderType, VideoFolderItem, VideoFolderType } from '@/app/lib/types'
import { FolderClosed, Music, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export interface ContentFolderProps {
  name: string
  id: string
  type: MusicFolderType | VideoFolderType
  data: MusicFolderItem | VideoFolderItem
}

export const ContentFolder: React.FC<ContentFolderProps> = ({ 
  name, 
  id, 
  type, 
  data 
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { meta } = useAppSelector((state: RootState) => state.auth)
  
  const MUSIC_TYPES: MusicFolderType[] = ['Album', 'Playlist']
  const VIDEO_TYPES: VideoFolderType[] = ['Movie', 'Music-Video', 'Podcast', 'Series']

  const folderIcon = useMemo(() => {
    const iconProps = {
      size: 16,
      className: 'text-muted-foreground'
    }
    
    return VIDEO_TYPES.includes(data.type as VideoFolderType) ? 
      <Video {...iconProps} /> : 
      <Music {...iconProps} />
  }, [data.type])

  const isSelected = useMemo(() => 
    data.folderId === meta?.folderId, 
    [data.folderId, meta?.folderId]
  )

  const handleNavigate = useCallback(() => {
    if (MUSIC_TYPES.includes(type as MusicFolderType)) {
      router.push(`/media/studio/musicFolder/${id}?${new URLSearchParams({ userId: data.owner.userId })}`)
    } else if (VIDEO_TYPES.includes(type as VideoFolderType)) {
      router.push(`/media/studio/movieFolder/${id}?${new URLSearchParams({ userId: data.owner.userId })}`)
    }
    dispatch(setMeta(data))
  }, [router, dispatch, type, id, data])

  const handleClick = useCallback(() => {
    dispatch(setMeta(data))
  }, [dispatch, data])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${name} folder`}
      onDoubleClick={handleNavigate}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleNavigate()
        }
      }}
      className={`
        flex items-center gap-3 p-3 cursor-pointer 
        transition-all duration-200 ease-in-out
        border border-transparent rounded-lg
        hover:bg-slate-100 dark:hover:bg-slate-800
        active:scale-95 active:bg-slate-200 dark:active:bg-slate-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${isSelected 
          ? 'bg-blue-100 dark:bg-blue-950 border-blue-200 dark:border-blue-800 shadow-sm' 
          : 'bg-white dark:bg-gray-900/20'
        }
      `}
    >
      <div className="relative flex-shrink-0">
        <FolderClosed 
          size={24}
          className={`
            transition-colors duration-200
            ${isSelected 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-amber-600 dark:text-amber-500'
            }
          `}
          fill={isSelected ? 'currentColor' : 'rgba(165,140,39,0.92)'}
        />
        
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
          {folderIcon}
        </div>
      </div>

      <span 
        className={`
          font-medium text-sm truncate flex-1
          transition-colors duration-200
          ${isSelected 
            ? 'text-blue-900 dark:text-blue-100' 
            : 'text-gray-900 dark:text-gray-100'
          }
        `}
        title={name}
      >
        {name}
      </span>
    </div>
  )
}