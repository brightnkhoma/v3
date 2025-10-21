"use client"
import {PlusCircle} from "lucide-react"
import {  NewDropDownMenu } from "./ui/newButton"
import { SortButton, SortMenuButton } from "./ui/sortButton"
import { CutButton } from "./ui/cutButton"
import { CopyButton } from "./ui/copyButton"
import { RenameButton } from "./ui/renameButton"
import { ShareButton } from "./ui/shareButton"
import { DeleteButtton } from "./ui/deleteButton"
import { ViewButton } from "./ui/viewButton"
import { DetailsButton } from "./ui/detailsButton"
import { RefObject, useCallback, useState } from "react"
import { AccountType, Library, MusicFolderItem, MusicFolderType, User, VideoFolderItem, VideoFolderType } from "../lib/types"
import { createDefaultFolder } from "../lib/dataSource/contentDataSource"
import { setFolder } from "../lib/local/redux/reduxSclice"
import { RootState, useAppDispatch, useAppSelector } from "../lib/local/redux/store"
import { usePathname } from "next/navigation"
import { DropzoneInputProps, useDropzone } from "react-dropzone"
import { PasteButton } from "./ui/pasteButton"
import { PromoteButton } from "./ui/promoteButton"
import { VideoPromotionButton } from "./videoPromoteButton"
import { PromotedMusicButton } from "./ui/promotedMusicButton"

export interface PathNameProps {
    name : string
}
interface StudioTopBarProps{
    getInputProps: <T extends DropzoneInputProps>(props?: T) => T,
    audioInputRef: React.RefObject<HTMLInputElement>,
    videoInputRef: React.RefObject<HTMLInputElement>
}
export const StudioTopBar : React.FC<StudioTopBarProps>= ({audioInputRef,videoInputRef})=>{
    const pathName = usePathname()
    const {user} = useAppSelector((state : RootState) => state.auth)
    const dispatch = useAppDispatch()
  
    const onCreateDefaultFolder = (type : MusicFolderType | VideoFolderType)=>{
        const folder = createDefaultFolder(user,type)
        dispatch(setFolder(folder))
    }
    return(
       <div className="flex flex-col w-full">
         <div className="flex flex-row items-center sticky top-0 gap-4 max-w-screen overflow-auto">
            <NewDropDownMenu audioInputRef={audioInputRef} videoInputRef={videoInputRef} pathName={pathName || ""} onCreateDefaultFolder={onCreateDefaultFolder}/>
            <div className="h-5 bg-gray-500 w-[1px]"></div>
            <PasteButton name={pathName || ""}/>
            <CutButton name={pathName || ""}/>
            <CopyButton  name={pathName || ""}/>
            <RenameButton/>
            <ShareButton/>
            <DeleteButtton/>
            <SortMenuButton/>
            <ViewButton/>
            <PromoteButton/>
            <VideoPromotionButton/>
            <PromotedMusicButton/>
            <div className="flex-1"></div>
            <DetailsButton/>
        </div>
        <hr className="mt-2"/>
       </div>
    )
}