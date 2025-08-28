"use client"
import { Home, Video, Music, History, Download, FileVideo, FileVideo2, List, FileArchive, ThumbsUp, Menu, Sun, Moon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { Logo } from './logo'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const SideBar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const mainItems: MenuGroupProps[] = useMemo(() => {
    const mainMenuElements: MenuItemProps[] = [
      {
        name: 'Home',
        icon: <Home size={18} />,
        onClick: () => router.push("/")
      },
      {
        name: 'Music',
        icon: <Music size={18} />,
        onClick: () => router.push("/media/music")
      },
      {
        name: 'Movies',
        icon: <FileVideo size={18} />,
        onClick: () => router.push("/video")
      },
      {
        name: 'Series',
        icon: <FileVideo2 size={18} />,
        onClick: () => router.push("/series")
      }
    ]

    const yourItems: MenuItemProps[] = [
      {
        name: 'History',
        icon: <History size={18} />,
        onClick: () => router.push("/history")
      },
      {
        name: 'PlayList',
        icon: <List size={18} />,
        onClick: () => router.push("playlist")
      },
      {
        name: 'Your Contents',
        icon: <FileArchive size={18} />,
        onClick: () => router.push("/studio")
      },
      {
        name: 'Liked Videos',
        icon: <ThumbsUp size={18} />,
        onClick: () => router.push("/studio")
      },
      {
        name: 'Downloads',
        icon: <Download size={18} />,
        onClick: () => router.push("/studio")
      }
    ]

    const menuItemsGroups: MenuGroupProps[] = [
      {
        name: '',
        menuItems: mainMenuElements
      },
      {
        name: 'You',
        menuItems: yourItems
      }
    ]
    
    return menuItemsGroups
  }, [router])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className=" bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "tween", ease: "easeInOut" }}
        className="fixed z-50 flex h-screen w-64 flex-col border-r bg-background p-4 shadow-lg top-0"
      >
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
            >
              <Menu size={18} />
            </Button>
            <Logo />
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto">
          {mainItems.map((item, index) => (
            <MenuGroup menuItems={item.menuItems} name={item.name} key={index} />
          ))}
        </div>

        <div className="mt-auto pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={toggleTheme}
          >
            {mounted ? (
              theme === 'dark' ? (
                <>
                  <Sun size={18} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={18} />
                  <span>Dark Mode</span>
                </>
              )
            ) : (
              <div className="h-5 w-full" />
            )}
          </Button>
        </div>
      </motion.div>
    </>
  )
}

interface MenuItemProps {
  name: string
  icon: React.ReactNode
  onClick: () => void
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, name, onClick }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant="ghost"
        className="w-full justify-start gap-3"
        onClick={onClick}
      >
        <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        <span className="text-sm font-normal">{name}</span>
      </Button>
    </motion.div>
  )
}

interface MenuGroupProps {
  name: string
  menuItems: MenuItemProps[]
}

const MenuGroup: React.FC<MenuGroupProps> = ({ menuItems, name }) => {
  return (
    <div className="flex flex-col space-y-1 py-2">
      {name && (
        <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground">
          {name}
        </h3>
      )}
      <div className="flex flex-col gap-1">
        {menuItems.map((value, index) => (
          <MenuItem 
            key={index} 
            icon={value.icon} 
            name={value.name} 
            onClick={value.onClick}
          />
        ))}
      </div>
    </div>
  )
}