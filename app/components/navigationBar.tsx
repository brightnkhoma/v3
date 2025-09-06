'use client'
import { useState, useEffect, useRef, useContext } from "react"
import { CreateBar } from "./ui/createBar"
import { Logo } from "./ui/logo"
import { MenuBar } from "./ui/menuBar"
import { NotificationBar } from "./ui/notificationBar"
import { ProfileBar } from "./ui/profileBar"
import { SearchBar, SearchField2, SearchTriggerButton } from "./ui/searchBar"
import { SideBar } from "./ui/sideBar"
import { MusicFolderItem } from "../lib/types"
import { search } from "../lib/dataSource/contentDataSource"
import { AppContext } from "../appContext"
import { useRouter } from "next/navigation"

export const NavigationBar = ()=>{
    const [show, setShow] = useState<boolean>(false)
    const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false)
    const [text, setText] = useState<string>("")
    const [items, setItems] = useState<MusicFolderItem[]>([])
    const [suggestions, setSuggestions] = useState<MusicFolderItem[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
    const [loadingSuggestionId, setLoadingSuggestionId] = useState<string | null>(null)
    const {audioManager} = useContext(AppContext)!
    const router = useRouter()

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
        <div className="w-full flex h-max flex-row items-center gap-2 sm:gap-4 lg:gap-4 sticky top-0 bg-white dark:bg-black dark:text-white z-50 p-4">
            <SideBar isOpen={isSideBarOpen} onClose={onCloseSideBar}/>
            <MenuBar onOpen={onOpenSideBar}/>
            <Logo/>
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
            <SearchTriggerButton setShow={setShow} show={show}/>
            <CreateBar/>
            <NotificationBar/>
            <ProfileBar/>
        </div>
    )
}