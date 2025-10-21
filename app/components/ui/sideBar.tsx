"use client"
import { useRouter, usePathname } from 'next/navigation'
import { useMemo, useState, useEffect, memo } from 'react'
import { LogoWithImage } from './logo'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Home, Music, Tv, Ticket, Download, Library, User, Settings, ChevronRight, Menu, Moon, Sun } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItemProps {
  name: string
  icon: React.ReactNode
  onClick: () => void
  path: string
  description?: string
  badge?: string
}

interface MenuGroupProps {
  name: string
  menuItems: MenuItemProps[]
  icon?: React.ReactNode
}

export const SideBar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeItem, setActiveItem] = useState(pathname)

  useEffect(() => {
    setMounted(true)
    if (pathname !== activeItem) {
      setActiveItem(pathname)
    }
  }, [pathname, activeItem])

  const mainItems: MenuGroupProps[] = useMemo(() => [
    {
      name: 'Discover',
      menuItems: [
        {
          name: 'Home',
          icon: <Home className="w-5 h-5" />,
          onClick: () => router.push("/"),
          path: '/',
          description: 'Discover new content'
        },
        {
          name: 'Series',
          icon: <Tv className="w-5 h-5" />,
          onClick: () => router.push("/series"),
          path: '/series',
          description: 'TV shows & series'
        },
        {
          name: 'Music',
          icon: <Music className="w-5 h-5" />,
          onClick: () => router.push("/media/music"),
          path: '/media/music',
          description: 'Songs, albums & artists'
        },
        {
          name: 'Tickets',
          icon: <Ticket className="w-5 h-5" />,
          onClick: () => router.push("/tickets"),
          path: '/tickets',
          description: 'Show & Sports tickets',
          badge: 'New'
        }
      ],
      icon: <User className="w-4 h-4" />
    },
    {
      name: 'Your Space',
      menuItems: [
        {
          name: 'Downloads',
          icon: <Download className="w-5 h-5" />,
          onClick: () => router.push("/downloads"),
          path: '/downloads',
          description: 'Offline content'
        }
      ],
      icon: <User className="w-4 h-4" />
    },
    {
      name: 'Creator Studio',
      menuItems: [
        {
          name: 'Your Content',
          icon: <Library className="w-5 h-5" />,
          onClick: () => router.push("/media/studio"),
          path: '/media/studio',
          description: 'Manage your uploads'
        }
      ],
      icon: <Settings className="w-4 h-4" />
    }
  ], [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleItemClick = (item: MenuItemProps) => {
    item.onClick()
    setActiveItem(item.path)
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-200"
        />
      )}

      <div
        className={cn(
          "fixed lg:relative z-50 flex h-full w-80 flex-col border-r bg-background/95 backdrop-blur-xl",
          "shadow-2xl lg:shadow-none lg:bg-background/100",
          "top-0 left-0 lg:z-30 lg:h-screen lg:flex-shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-[320px]",
          "transition-transform duration-200 ease-out"
        )}
        style={{ position: 'fixed' }}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
          <div onClick={onClose} className="flex items-center gap-3">
            <LogoWithImage size="sm" showText={true} onClick={() => {}} />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-9 w-9 rounded-lg lg:hidden hover:bg-accent"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-4 scrollbar-thin">
          <div className="flex flex-col gap-6 px-4">
            {mainItems.map((group, index) => (
              <MenuGroup 
                key={index} 
                menuItems={group.menuItems} 
                name={group.name}
                icon={group.icon}
                activeItem={activeItem}
                onItemClick={handleItemClick}
              />
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border/50 bg-gradient-to-t from-background/50 to-transparent">
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-between gap-3 h-11 rounded-xl hover:bg-accent/50 transition-all duration-200"
              onClick={toggleTheme}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  theme === 'dark' ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-500"
                )}>
                  {mounted ? (
                    theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </div>
                <span className="font-medium text-sm">
                  {mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Theme'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Button>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
              <div className="text-center flex-1">
                <div className="text-lg font-bold text-primary">128</div>
                <div className="text-xs text-muted-foreground">Songs</div>
              </div>
              <div className="w-px h-6 bg-border/50" />
              <div className="text-center flex-1">
                <div className="text-lg font-bold text-primary">24</div>
                <div className="text-xs text-muted-foreground">Videos</div>
              </div>
              <div className="w-px h-6 bg-border/50" />
              <div className="text-center flex-1">
                <div className="text-lg font-bold text-primary">8</div>
                <div className="text-xs text-muted-foreground">Playlists</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const MenuItem: React.FC<MenuItemProps & { isActive: boolean; onClick: () => void }> = memo(({ icon, name, description, badge, isActive, onClick }) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 h-12 rounded-xl transition-all duration-200 group",
        "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
        isActive ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" : "border-transparent"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "p-2 rounded-lg transition-colors duration-200",
        isActive ? "bg-primary text-primary-foreground" : "bg-accent/50 text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground"
      )}>
        {icon}
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium text-sm truncate",
            isActive ? "text-primary" : "text-foreground"
          )}>
            {name}
          </span>
          {badge && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground font-medium">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground truncate">
            {description}
          </p>
        )}
      </div>

      {isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </Button>
  )
})

const MenuGroup: React.FC<MenuGroupProps & { activeItem?: string; onItemClick?: (item: MenuItemProps) => void }> = memo(({ 
  menuItems, 
  name, 
  icon,
  activeItem,
  onItemClick 
}) => {
  return (
    <div className="flex flex-col space-y-2">
      {name && (
        <div className="flex items-center gap-2 px-2 py-1">
          {icon && (
            <div className="p-1 rounded text-muted-foreground">
              {icon}
            </div>
          )}
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {name}
          </h3>
        </div>
      )}
      
      <div className="flex flex-col gap-1">
        {menuItems.map((item, index) => (
          <MenuItem 
            key={index} 
            {...item}
            isActive={activeItem === item.path}
            onClick={() => onItemClick?.(item)}
          />
        ))}
      </div>
    </div>
  )
})

export const MiniSideBar: React.FC<{ onOpen: () => void }> = memo(({ onOpen }) => {
  const router = useRouter()
  const pathname = usePathname()

  const quickItems = [
    { icon: <Home className="w-5 h-5" />, path: '/', label: 'Home' },
    { icon: <Music className="w-5 h-5" />, path: '/media/music', label: 'Music' },
    { icon: <Tv className="w-5 h-5" />, path: '/series', label: 'Series' },
    { icon: <Download className="w-5 h-5" />, path: '/downloads', label: 'Downloads' },
  ]

  return (
    <div className="hidden lg:flex flex-col w-20 h-screen border-r bg-background/95 backdrop-blur-xl p-3 space-y-4 flex-shrink-0">
      <div className="flex justify-center py-4">
        <LogoWithImage size="sm" showText={false} onClick={onOpen} />
      </div>

      <div className="flex-1 space-y-2">
        {quickItems.map((item, index) => (
          <Button
            key={index}
            variant={pathname === item.path ? "default" : "ghost"}
            size="icon"
            className={cn(
              "w-12 h-12 rounded-xl transition-all duration-200",
              pathname === item.path && "shadow-md"
            )}
            onClick={() => router.push(item.path)}
          >
            {item.icon}
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-xl"
        onClick={onOpen}
      >
        <Menu className="w-5 h-5" />
      </Button>
    </div>
  )
})