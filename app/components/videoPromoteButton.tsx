"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Video, PlaySquare, TrendingUp, Zap } from "lucide-react"
import { useContext } from "react"
import { AppContext } from "../appContext"
import { RootState, useAppSelector } from "../lib/local/redux/store"

export const VideoPromotionButton = () => {
    const pathName = usePathname()
    const router = useRouter()
    
    if (!pathName.includes("studio/movieFolder")) return null;

    const handleClick = () => {
        router.push(`/media/studio/promote-video`)
    }

    return (
        <button
            onClick={handleClick}
            className="
                group relative
                flex items-center gap-3
                px-5 py-3
                bg-gradient-to-r from-orange-500 to-red-600
                hover:from-orange-600 hover:to-red-700
                text-white
                rounded-xl
                font-bold
                transition-all duration-300
                shadow-lg hover:shadow-2xl
                transform hover:scale-105
                active:scale-95
                border-2 border-orange-400/30
                overflow-hidden
            "
        >
            {/* Animated background effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
            
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 rounded-xl bg-orange-400/20 group-hover:bg-orange-400/30 transition-all duration-300 animate-pulse" />
            
            {/* Main icon */}
            <div className="relative z-10 flex items-center justify-center">
                <Video className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <PlaySquare className="w-3 h-3 absolute -bottom-1 -right-1 text-white bg-red-500 rounded-full p-0.5" />
            </div>
            
            {/* Text with icon */}
            <span className="relative z-10 flex items-center gap-2">
                Promote Video
                <TrendingUp className="w-4 h-4 group-hover:animate-bounce" />
            </span>
            
            {/* Badge for video-specific promotion */}
            <span className="
                absolute -top-1 -right-1
                bg-gradient-to-r from-yellow-400 to-orange-500
                text-black text-xs font-bold px-2 py-1
                rounded-full
                animate-pulse
                shadow-lg
            ">
                <Zap className="w-3 h-3 inline mr-1" />
                Boost
            </span>
            
            {/* Hover effect indicator */}
            <div className="
                absolute bottom-0 left-1/2 transform -translate-x-1/2
                w-0 group-hover:w-4/5 h-0.5
                bg-white
                transition-all duration-300
                rounded-full
            " />
        </button>
    )
}

// Minimalist version for compact layouts
export const VideoPromotionButtonMinimal = () => {
    const pathName = usePathname()
    const router = useRouter()
    
    if (!pathName.includes("studio/movieFolder")) return null;

    const handleClick = () => {
        router.push(`/media/studio/promote-video`)
    }

    return (
        <button
            onClick={handleClick}
            className="
                group relative
                flex items-center gap-2
                px-4 py-2
                text-gray-700 hover:text-orange-600
                dark:text-gray-300 dark:hover:text-orange-400
                rounded-lg
                font-semibold
                transition-all duration-200
                hover:bg-orange-50 dark:hover:bg-orange-900/20
                border border-transparent hover:border-orange-200 dark:hover:border-orange-800
                shadow-sm hover:shadow-md
            "
            title="Promote your videos"
        >
            <div className="relative">
                <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            </div>
            <span>Promote Video</span>
        </button>
    )
}

// Icon-only version for toolbar
export const VideoPromotionButtonIcon = () => {
    const pathName = usePathname()
    const router = useRouter()
    
    if (!pathName.includes("studio/movieFolder")) return null;

    const handleClick = () => {
        router.push(`/media/studio/promote-video`)
    }

    return (
        <button
            onClick={handleClick}
            className="
                group relative
                p-3
                bg-gradient-to-br from-orange-500 to-red-600
                hover:from-orange-600 hover:to-red-700
                text-white
                rounded-2xl
                transition-all duration-300
                shadow-lg hover:shadow-xl
                transform hover:scale-110
                active:scale-95
                tooltip
            "
            title="Promote Video - Boost your views!"
        >
            {/* Hover ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-orange-300/50 group-hover:border-orange-200/70 transition-all duration-300" />
            
            <Video className="w-6 h-6 group-hover:scale-110 transition-transform" />
            
            {/* Animated tooltip */}
            <div className="
                absolute bottom-full left-1/2 transform -translate-x-1/2
                mb-3 px-3 py-2
                bg-gray-900 text-white text-sm font-medium
                rounded-lg
                opacity-0 group-hover:opacity-100
                transition-all duration-200
                whitespace-nowrap
                pointer-events-none
                shadow-lg
                z-50
            ">
                Promote Video
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
            
            {/* Pulse effect */}
            <div className="absolute inset-0 rounded-2xl bg-orange-400/20 animate-pulse group-hover:animate-none" />
        </button>
    )
}

// Version with stats preview
export const VideoPromotionButtonWithStats = ({ videoCount = 0 }: { videoCount?: number }) => {
    const pathName = usePathname()
    const router = useRouter()
    
    if (!pathName.includes("studio/movieFolder")) return null;

    const handleClick = () => {
        router.push(`/media/studio/promote-video`)
    }

    return (
        <button
            onClick={handleClick}
            className="
                group relative
                flex items-center gap-3
                px-4 py-3
                bg-white dark:bg-gray-800
                hover:bg-orange-50 dark:hover:bg-orange-900/10
                text-gray-800 dark:text-gray-200
                rounded-xl
                font-semibold
                transition-all duration-300
                shadow-md hover:shadow-lg
                border-2 border-orange-200 dark:border-orange-800
                hover:border-orange-300 dark:hover:border-orange-600
                hover:scale-105
            "
        >
            {/* Icon container */}
            <div className="relative p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                <Video className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            </div>
            
            {/* Text and stats */}
            <div className="text-left">
                <div className="flex items-center gap-2">
                    <span>Promote Video</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    {videoCount} videos ready to boost
                </div>
            </div>
            
            {/* CTA arrow */}
            <Zap className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform ml-auto" />
        </button>
    )
}

// Default export
export default VideoPromotionButton