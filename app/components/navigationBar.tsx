'use client'
import { useState, useEffect, useRef, useContext } from "react"
import { CreateBar } from "./ui/createBar"
import { Logo, LogoWithImage, CompactLogo, LogoIcon, LogoText } from "./ui/logo"
import { MenuBar } from "./ui/menuBar"
import { NotificationBar } from "./ui/notificationBar"
import { ProfileBar } from "./ui/profileBar"
import { SearchBar, SearchField2, SearchTriggerButton } from "./ui/searchBar"
import { SideBar } from "./ui/sideBar"
import { MusicFolderItem } from "../lib/types"
import { search } from "../lib/dataSource/contentDataSource"
import { AppContext } from "../appContext"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export const NavigationBar = ()=>{
    const [show, setShow] = useState<boolean>(false)
    const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false)
    const [text, setText] = useState<string>("")
    const [items, setItems] = useState<MusicFolderItem[]>([])
    const [suggestions, setSuggestions] = useState<MusicFolderItem[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
    const [loadingSuggestionId, setLoadingSuggestionId] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState<boolean>(false)
    const {audioManager} = useContext(AppContext)!
    const router = useRouter()

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)
        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    const onSearch = async (searchText?: string)=>{
        const searchTerm = searchText || text.toLocaleLowerCase().trim()
        if (!searchTerm) return
        
        setIsLoading(true)
        try {
            const results = await search(searchTerm)
            setItems(results)
            setShowSuggestions(false)
        } catch (error) {
            console.error("Search error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const onInputChange = async (value: string) => {
        setText(value)
        
        if (value.length > 2) {
            setIsLoading(true)
            try {
                const results = await search(value.toLocaleLowerCase().trim())
                setSuggestions(results.slice(0, 20)) 
                setShowSuggestions(true)
            } catch (error) {
                console.error("Suggestions error:", error)
            } finally {
                setIsLoading(false)
            }
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }

    const onSuggestionClick = async (item: MusicFolderItem) => {
        setLoadingSuggestionId(item.content.contentId)
        try {
            await audioManager.setItem(item).then(()=>{
                router.push(`/media/music/play/${item.content.contentId}`)
                setShow(false)
            })
        } catch (error) {
            console.error("Error loading suggestion:", error)
        } finally {
            setLoadingSuggestionId(null)
            setShowSuggestions(false)
        }
    }

    const onCloseSideBar = ()=>{
        setIsSideBarOpen(false)
    }
    
    const onOpenSideBar = ()=>{
        setIsSideBarOpen(true)
    }

    return(
        <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:gap-4 sticky top-0 bg-background border-b border-border z-50 p-2 sm:p-4">
            <SideBar isOpen={isSideBarOpen} onClose={onCloseSideBar}/>
            
            <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="flex flex-row items-center gap-2 sm:gap-3 flex-shrink-0">
                    <MenuBar onOpen={onOpenSideBar}/>
                    
                    {isMobile ? (
                        <LogoText size="sm" className="flex-shrink-0" />
                    ) : (
                        <LogoWithImage onClick={onCloseSideBar} size="md" className="flex-shrink-0" />
                    )}
                </div>

                <div className="flex flex-row items-center gap-1 sm:gap-2 lg:gap-3">
                     <div className="flex-shrink-0">
                        <CreateBar/>
                    </div>

                    <div className="flex-shrink-0">
                        <NotificationBar/>
                    </div>

                    <div className="flex-shrink-0">
                        <ProfileBar compact = {isMobile}/>
                    </div>

                    {isMobile && (
                        <div className="flex-shrink-0">
                            <SearchTriggerButton setShow={setShow} show={show}/>
                        </div>
                    )}
                </div>
            </div>

            <div className={cn(
                "w-full",
                isMobile ? "hidden" : "block"
            )}>
                <SearchBar 
                    onSuggestionClick={onSuggestionClick}
                    text={text}
                    onInputChange={onInputChange}
                    onSearch={onSearch}
                    suggestions={suggestions}
                    showSuggestions={showSuggestions}
                    setShowSuggestions={setShowSuggestions}
                    isLoading={isLoading}
                    loadingSuggestionId={loadingSuggestionId}
                />
            </div>

            {isMobile && (
                <div className={cn(
                    "fixed inset-0 bg-background/95 backdrop-blur-sm z-50 transition-all duration-300 flex flex-col",
                    show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}>
                    <div className="flex flex-row items-center justify-between p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <LogoText size="sm" />
                        </div>
                        <button 
                            onClick={() => setShow(false)}
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="flex-1 p-4">
                        <SearchField2 
                            onSuggestionClick={onSuggestionClick}
                            setShow={setShow} 
                            show={show}
                            text={text}
                            onInputChange={onInputChange}
                            onSearch={onSearch}
                            suggestions={suggestions}
                            showSuggestions={showSuggestions}
                            setShowSuggestions={setShowSuggestions}
                            isLoading={isLoading}
                            loadingSuggestionId={loadingSuggestionId}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

