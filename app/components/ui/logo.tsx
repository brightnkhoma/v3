import Image from 'next/image'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  variant?: 'default' | 'minimal' | 'bold',
  onClick : ()=> void
}

export const Logo = ({ 
  size = 'md', 
  showText = true, 
  className, 
  variant = 'default' 
}: LogoProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  }

  const getLogoColors = () => {
    switch (variant) {
      case 'bold':
        return {
          iconBg: "bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700",
          iconBgHover: "group-hover:from-purple-700 group-hover:to-pink-700 dark:group-hover:from-purple-600 dark:group-hover:to-pink-600",
          iconColor: "text-white",
          iconHover: "group-hover:text-white group-hover:scale-110",
          textGradient: "bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500",
          textHover: "group-hover:from-purple-700 group-hover:to-pink-700 dark:group-hover:from-purple-600 dark:group-hover:to-pink-600",
          subtitle: "text-purple-600 dark:text-purple-400"
        }
      case 'minimal':
        return {
          iconBg: "bg-background border-2 border-primary",
          iconBgHover: "group-hover:bg-primary/10",
          iconColor: "text-primary",
          iconHover: "group-hover:text-primary group-hover:scale-110",
          textGradient: "text-foreground",
          textHover: "group-hover:text-primary",
          subtitle: "text-muted-foreground"
        }
      default:
        return {
          iconBg: "bg-gradient-to-br from-primary to-primary/80 dark:from-primary dark:to-primary/90",
          iconBgHover: "group-hover:from-primary/90 group-hover:to-primary dark:group-hover:from-primary/80 dark:group-hover:to-primary",
          iconColor: "text-primary-foreground",
          iconHover: "group-hover:text-primary-foreground group-hover:scale-110",
          textGradient: "bg-gradient-to-r from-foreground to-foreground/90 dark:from-foreground dark:to-foreground/80",
          textHover: "group-hover:from-foreground group-hover:to-foreground/70 dark:group-hover:from-foreground dark:group-hover:to-foreground/90",
          subtitle: "text-muted-foreground"
        }
    }
  }

  const colors = getLogoColors()

  return (
    <div className={cn(
      "flex items-center gap-3 cursor-pointer group transition-all duration-300 hover:scale-105",
      className
    )}>
      {/* Logo Icon */}
      <div className={cn(
        "relative flex items-center justify-center rounded-2xl shadow-lg transition-all duration-300",
        "border border-border/50 group-hover:shadow-xl",
        colors.iconBg,
        colors.iconBgHover,
        sizeClasses[size]
      )}>
        {/* Animated play icon */}
        <div className="relative">
          <Play 
            fill="currentColor" 
            className={cn(
              "transition-all duration-300",
              colors.iconColor,
              colors.iconHover
            )} 
            size={iconSizes[size]}
          />
          
          {/* Pulsing animation effect */}
          {variant === 'bold' && (
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping group-hover:animate-none" />
          )}
        </div>

        {/* Shine effect */}
        <div className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          variant === 'minimal' && "from-foreground/5"
        )} />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold tracking-tight transition-all duration-300",
            variant === 'minimal' 
              ? colors.textGradient
              : "bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 dark:from-foreground dark:to-foreground/90",
            colors.textHover,
            textSizes[size]
          )}>
            Zathuplay
          </span>
          <span className={cn(
            "font-medium tracking-wide transition-colors duration-300",
            colors.subtitle,
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-xs',
            size === 'lg' && 'text-sm'
          )}>
            Music & Video Platform
          </span>
        </div>
      )}
    </div>
  )
}

// Alternative minimalist version
export const LogoIcon = ({ 
  size = 'md', 
  className,
  variant = 'default' 
}: Omit<LogoProps, 'showText'>) => {
  const colors = variant === 'bold' 
    ? {
        bg: "bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700",
        bgHover: "hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600",
        color: "text-white",
        hover: "hover:text-white hover:scale-110"
      }
    : {
        bg: "bg-primary dark:bg-primary/90",
        bgHover: "hover:bg-primary/90 dark:hover:bg-primary",
        color: "text-primary-foreground",
        hover: "hover:text-primary-foreground hover:scale-110"
      }

  return (
    <div className={cn(
      "flex items-center justify-center rounded-2xl shadow-lg transition-all duration-300 cursor-pointer group",
      "border border-border/50 hover:shadow-xl",
      colors.bg,
      colors.bgHover,
      size === 'sm' && 'h-8 w-8',
      size === 'md' && 'h-12 w-12',
      size === 'lg' && 'h-16 w-16',
      className
    )}>
      <Play 
        fill="currentColor" 
        className={cn(
          "transition-all duration-300",
          colors.color,
          colors.hover,
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-4 w-4',
          size === 'lg' && 'h-5 w-5'
        )} 
      />
    </div>
  )
}

// Logo with image version
export const LogoWithImage = ({ 
  size = 'md', 
  className,
  variant = 'default' 
}: LogoProps) => {
  const colors = variant === 'bold' 
    ? {
        container: "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900",
        containerHover: "group-hover:from-purple-200 group-hover:to-pink-200 dark:group-hover:from-purple-800 dark:group-hover:to-pink-800",
        text: "bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400",
        textHover: "group-hover:from-purple-700 group-hover:to-pink-700 dark:group-hover:from-purple-300 dark:group-hover:to-pink-300",
        subtitle: "text-purple-600 dark:text-purple-400"
      }
    : {
        container: "bg-background dark:bg-card",
        containerHover: "group-hover:bg-accent dark:group-hover:bg-accent/50",
        text: "text-foreground",
        textHover: "group-hover:text-foreground/80",
        subtitle: "text-muted-foreground"
      }

  return (
    <div className={cn(
      "flex items-center gap-3 cursor-pointer group transition-all duration-300 hover:scale-105",
      className
    )}>
      {/* Image Container */}
      <div className={cn(
        "relative flex items-center justify-center rounded-2xl shadow-lg overflow-hidden transition-all duration-300",
        "border border-border",
        colors.container,
        colors.containerHover,
        size === 'sm' && 'h-8 w-8',
        size === 'md' && 'h-12 w-12',
        size === 'lg' && 'h-16 w-16'
      )}>
        <Image 
          src={'/images/icon.png'} 
          alt='Zathuplay Logo'
          fill
          className="object-cover p-1 group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 32px, 48px, 64px"
          onError={(e) => {
            // Fallback to icon if image fails to load
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
        
        {/* Fallback icon if image fails */}
        <div className="absolute inset-0 hidden items-center justify-center group-hover:bg-black/5 transition-colors duration-300">
          <Play 
            fill="currentColor" 
            className={cn(
              "text-primary",
              size === 'sm' && 'h-3 w-3',
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-5 w-5'
            )} 
          />
        </div>
      </div>

      {/* Logo Text */}
      <div className="flex flex-col">
        <span className={cn(
          "font-bold tracking-tight transition-all duration-300",
          variant === 'bold' ? "bg-clip-text text-transparent" : "",
          colors.text,
          colors.textHover,
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-xl',
          size === 'lg' && 'text-2xl'
        )}>
          Zathuplay
        </span>
        <span className={cn(
          "font-medium tracking-wide transition-colors duration-300",
          colors.subtitle,
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-xs',
          size === 'lg' && 'text-sm'
        )}>
          Music & Video Platform
        </span>
      </div>
    </div>
  )
}

// Compact version for mobile/navbars
export const CompactLogo = ({ 
  className,
  variant = 'default' 
}: { 
  className?: string 
  variant?: 'default' | 'bold'
}) => {
  const colors = variant === 'bold' 
    ? {
        bg: "bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700",
        bgHover: "group-hover:from-purple-700 group-hover:to-pink-700 dark:group-hover:from-purple-600 dark:group-hover:to-pink-600",
        icon: "text-white",
        text: "text-purple-600 dark:text-purple-400"
      }
    : {
        bg: "bg-primary dark:bg-primary/90",
        bgHover: "group-hover:bg-primary/90 dark:group-hover:bg-primary",
        icon: "text-primary-foreground",
        text: "text-foreground"
      }

  return (
    <div className={cn(
      "flex items-center gap-2 cursor-pointer group transition-all duration-300",
      className
    )}>
      <div className={cn(
        "relative flex items-center justify-center rounded-xl h-8 w-8 shadow-lg transition-all duration-300",
        "border border-border/50 group-hover:shadow-xl",
        colors.bg,
        colors.bgHover
      )}>
        <Play 
          fill="currentColor" 
          className={cn(
            "h-3 w-3 transition-all duration-300 group-hover:scale-110",
            colors.icon
          )} 
        />
      </div>
      <span className={cn(
        "font-bold text-sm transition-colors duration-300 group-hover:opacity-80",
        colors.text
      )}>
        Zathuplay
      </span>
    </div>
  )
}

export const LogoText = ({ 
  size = 'md',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) => {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={cn(
      "flex flex-col cursor-pointer group transition-all duration-300",
      className
    )}>
      <span className={cn(
        "font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent",
        "dark:from-foreground dark:to-foreground/90 group-hover:from-primary group-hover:to-primary/80",
        "transition-all duration-300 tracking-tight",
        textSizes[size]
      )}>
        Zathuplay
      </span>
      <span className={cn(
        "text-muted-foreground font-medium tracking-wide transition-colors duration-300",
        "group-hover:text-primary/80 text-xs"
      )}>
        Music & Video
      </span>
    </div>
  )
}