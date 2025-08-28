'use client'
import { useState } from "react"
import { CreateBar } from "./ui/createBar"
import { Logo } from "./ui/logo"
import { MenuBar } from "./ui/menuBar"
import { NotificationBar } from "./ui/notificationBar"
import { ProfileBar } from "./ui/profileBar"
import { SearchBar, SearchField2, SearchTriggerButton } from "./ui/searchBar"
import { SideBar } from "./ui/sideBar"


export const NavigationBar = ()=>{
    const [show, setShow] = useState<boolean>(false)
    const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false)

    const onCloseSideBar = ()=>{
        setIsSideBarOpen(false)
    }
    const onOpenSideBar = ()=>{
        setIsSideBarOpen(true)
    }
    return(
        <div
        className="w-full flex h-max flex-row items-center gap-4 sticky top-0 bg-white dark:bg-black dark:text-white z-50 p-4"
        >
            <SideBar isOpen = {isSideBarOpen} onClose={onCloseSideBar}/>
            <MenuBar onOpen={onOpenSideBar}/>
            <Logo/>
            <SearchBar/>
            <SearchField2 setShow={setShow} show={show}/>
            <SearchTriggerButton setShow={setShow} show={show}/>
            <CreateBar/>
            <NotificationBar/>
            <ProfileBar/>
        </div>
    )
}