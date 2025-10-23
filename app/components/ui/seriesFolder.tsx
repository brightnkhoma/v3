import { setMeta, setMeta2 } from '@/app/lib/local/redux/reduxSclice'
import { RootState, useAppDispatch, useAppSelector } from '@/app/lib/local/redux/store'
import { Series } from '@/app/lib/types'
import { FolderClosed, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export interface SeriesFolderProps {
  series: Series
}

export const SeriesFolder: React.FC<SeriesFolderProps> = ({ 
  series 
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { meta2 } = useAppSelector((state: RootState) => state.auth)

  const isSelected = useMemo(() => 
    series.id === meta2?.id, 
    [series.id, meta2?.id]
  )

  const handleNavigate = useCallback(() => {
    router.push(`/media/studio/series/${series.id}`)
    dispatch(setMeta2(series))
  }, [router, dispatch, series])

  const handleClick = useCallback(() => {
    dispatch(setMeta2(series))
    dispatch(setMeta(null))
  }, [dispatch, series])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${series.name} folder`}
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
          <Video 
            size={16}
            className="text-muted-foreground"
          />
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
        title={series.name}
      >
        {series.name}
      </span>
    </div>
  )
}