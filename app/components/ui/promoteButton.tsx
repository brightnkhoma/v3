'use client'

import { usePathname, useRouter } from "next/navigation"
import { Megaphone } from "lucide-react"

export const PromoteButton = () => {
    const router = useRouter()
    const pathName = usePathname()
    
    if (!pathName.includes("studio/musicFolder")) return null;

    const handleClick = () => {
        router.push(`/media/studio/promote`)
    }

    return (
        <button
            onClick={handleClick}
            className="
                group relative
                flex items-center gap-2
                px-4 py-2
                bg-gradient-to-r from-purple-600 to-blue-600
                hover:from-purple-700 hover:to-blue-700
                text-white
                rounded-lg
                font-semibold
                transition-all duration-200
                shadow-lg hover:shadow-xl
                transform hover:scale-105
                active:scale-95
                border border-purple-500/30
                overflow-hidden
            "
        >
            {/* Animated background shine effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
            
            {/* Icon with animation */}
            <Megaphone className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            
            {/* Text */}
            <span className="relative z-10">Promote Music</span>
            
            {/* Optional badge for new feature */}
            <span className="
                absolute -top-2 -right-2
                bg-red-500 text-white
                text-xs px-1.5 py-0.5
                rounded-full
                animate-pulse
            ">
                New
            </span>
        </button>
    )
}

// Alternative minimalist version
export const PromoteButtonMinimal = () => {
    const router = useRouter()
    const pathName = usePathname()
    
    if (!pathName.includes("studio/musicFolder")) return null;

    const handleClick = () => {
        router.push(`/media/studio/promote`)
    }

    return (
        <button
            onClick={handleClick}
            className="
                group
                flex items-center gap-2
                px-3 py-2
                text-gray-700 hover:text-purple-600
                dark:text-gray-300 dark:hover:text-purple-400
                rounded-md
                font-medium
                transition-all duration-200
                hover:bg-purple-50 dark:hover:bg-purple-900/20
                border border-transparent hover:border-purple-200 dark:hover:border-purple-800
            "
            title="Promote your music"
        >
            <Megaphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Promote</span>
        </button>
    )
}

// Icon-only version for compact layouts
export const PromoteButtonIcon = () => {
    const router = useRouter()
    const pathName = usePathname()
    
    if (!pathName.includes("studio/musicFolder")) return null;

    const handleClick = () => {
        router.push(`/media/studio/promote`)
    }

    return (
        <button
            onClick={handleClick}
            className="
                group relative
                p-2
                text-gray-600 hover:text-purple-600
                dark:text-gray-400 dark:hover:text-purple-400
                rounded-full
                transition-all duration-200
                hover:bg-purple-50 dark:hover:bg-purple-900/20
                tooltip
            "
            title="Promote Music"
        >
            <Megaphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
            
            {/* Tooltip */}
            <div className="
                absolute bottom-full left-1/2 transform -translate-x-1/2
                mb-2 px-2 py-1
                bg-gray-900 text-white text-xs
                rounded-md
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                whitespace-nowrap
                pointer-events-none
            ">
                Promote Music
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
        </button>
    )
}

// Version with notification dot
export const PromoteButtonWithNotification = ({ hasNewFeatures = true }: { hasNewFeatures?: boolean }) => {
    const router = useRouter()
    const pathName = usePathname()
    
    if (!pathName.includes("studio/musicFolder")) return null;

    const handleClick = () => {
        router.push(`/media/studio/promote`)
    }

    return (
        <button
            onClick={handleClick}
            className="
                group relative
                flex items-center gap-2
                px-4 py-2
                bg-white dark:bg-gray-800
                text-gray-700 dark:text-gray-200
                hover:text-purple-600 dark:hover:text-purple-400
                rounded-lg
                font-medium
                transition-all duration-200
                shadow-sm hover:shadow-md
                border border-gray-200 dark:border-gray-700
                hover:border-purple-300 dark:hover:border-purple-600
            "
        >
            <div className="relative">
                <Megaphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {hasNewFeatures && (
                    <div className="
                        absolute -top-1 -right-1
                        w-2 h-2
                        bg-red-500
                        rounded-full
                        animate-pulse
                    " />
                )}
            </div>
            
            <span>Promote Music</span>
            
            {hasNewFeatures && (
                <span className="
                    bg-gradient-to-r from-purple-500 to-pink-500
                    text-white text-xs
                    px-2 py-0.5
                    rounded-full
                ">
                    New
                </span>
            )}
        </button>
    )
}

export default PromoteButton