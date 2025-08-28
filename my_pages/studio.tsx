"use client"

import { FolderCollection } from "@/app/components/folderCollection"
import { ContentFolderProps } from "@/app/components/ui/folder"
import { getFolders } from "@/app/lib/dataSource/contentDataSource"
import { RootState, useAppSelector } from "@/app/lib/local/redux/store"
import { Folder, MusicFolderType, VideoFolderType } from "@/app/lib/types"
import { useEffect, useState } from "react"

const Studio = ()=>{
    const {user} = useAppSelector((state : RootState)=> state.auth) || {}
    const [folders, setFolders] = useState<ContentFolderProps[]>([]) 

    const onGetFolders = async ()=>{
       const data =  await getFolders(user)
       const userFolders = data.map(x=> ({id : x.folderId,name : x.folderName,type : x.type, data : x} as ContentFolderProps))
       setFolders(userFolders)
    }

    useEffect(()=>{
        onGetFolders()
    },[user])


    
    return(
        <div className="flex flex-col">
            <FolderCollection x={folders}/>
        </div>
    )
}

export default Studio;