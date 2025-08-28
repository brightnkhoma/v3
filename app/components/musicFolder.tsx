"use client"
import { useContext, useEffect, useState } from "react"
import { MusicFolderItem } from "../lib/types"
import { MusicItem } from "./videoItem"
import { RootState, useAppSelector } from "../lib/local/redux/store"
import { onGetFolderItems } from "../lib/dataSource/contentDataSource"
import { AppContext } from "../appContext"
export const MusicFolder = ()=>{
    const [items, setItems] = useState<MusicFolderItem[]>([])
    const {audioManager} = useContext(AppContext)!


    const {user,meta,folderMusicViewMode} = useAppSelector((state : RootState) => state.auth)

    const onGetFiles = async()=>{
        if(meta){

        const data = await onGetFolderItems(user,meta)
        setItems(data as MusicFolderItem[])
    }
    }

    const onPlayItem = async(item : MusicFolderItem)=>{
        await audioManager.setItem(item)
    }

    useEffect(()=>{
        onGetFiles()
    },[user,meta])
    return(
        <div className={`flex flex-col flex-1 min-h-screen w-full`}>
           <div className={`size-full min-h-screen flex ${folderMusicViewMode == "grid" ? "flex-row flex-wrap gap-4" : "flex-col"} gap-2 `}>
             {
                items.map((value, index)=>(
                    <MusicItem onClick={onPlayItem} viewMode={folderMusicViewMode} meta={meta as MusicFolderItem} item={value} key={index}/>
                ))
            }
           </div>
            <span className="text-xs mx-auto font-light text-gray-500">This folder is empty</span>
        </div>
    )
}