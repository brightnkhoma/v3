"use client"

import { FolderCollection } from "@/app/components/folderCollection"
import { ContentFolderProps } from "@/app/components/ui/folder"
import { SeriesFolder } from "@/app/components/ui/seriesFolder"
import { getFolders, getUserSeries, listenToFolderChanges } from "@/app/lib/dataSource/contentDataSource"
import { RootState, useAppSelector } from "@/app/lib/local/redux/store"
import { Folder, MusicFolderItem, MusicFolderType, Series, VideoFolderItem, VideoFolderType } from "@/app/lib/types"
import { DocumentChangeType } from "firebase/firestore"
import { useCallback, useEffect, useState } from "react"

const Studio = ()=>{
    const {user} = useAppSelector((state : RootState)=> state.auth) || {}
    const [folders, setFolders] = useState<ContentFolderProps[]>([]) 
    const [series, setSeries ] = useState<Series[]>([])

    const onGetFolders = async ()=>{
       const data =  await getFolders(user)
       const userFolders = data.map(x=> ({id : x.folderId,name : x.folderName,type : x.type, data : x} as ContentFolderProps))
       setFolders(userFolders)
    }

    const onGetSeries = useCallback(async()=>{
        const items = await getUserSeries(user)
        setSeries(items)
    },[user])

    const onListenToFolderChanges = async()=>{
        await listenToFolderChanges(user,onResult)
    }

    const onResult = (type : DocumentChangeType,x : VideoFolderItem | MusicFolderItem)=>{
        const item : ContentFolderProps = {id : x.folderId,name : x.folderName,type : x.type, data : x} as ContentFolderProps


        switch(type){
            case "added": setFolders(prev=>([...(prev.filter(y=> y.id != x.folderId)),item]));break;
            case "removed": setFolders(prev=>(prev.filter(y=> y.id != x.folderId)));break;
            case "modified":setFolders(prev => (prev.map(y=> y.id == x.folderId ? item : y)))
        }
    }


    useEffect(()=>{
        onGetFolders()
        onGetSeries()
        onListenToFolderChanges()
    },[user])


    
    return(
        <div className="flex flex-col gap-4">
            <FolderCollection x={folders}/>
            {
                <div className="w-full gap-4 flex flex-col ">
                    {series.map((item,index)=>(
                    <SeriesFolder series={item} key={index} />
                ))}
                </div>
            }
        </div>
    )
}

export default Studio;