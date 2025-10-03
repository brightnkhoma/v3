"use client"
import { useParams } from "next/navigation"
import { RootState, useAppSelector } from "../lib/local/redux/store"
import { VideoFolderItem } from "../lib/types"
import VideoComponent from "./video"
import { useEffect, useState } from "react"
import { getVideoFolderItems, getVideoFolderItemsbyId } from "../lib/dataSource/contentDataSource"


export const VideoFolderItemComponent = ()=>{
    const {user} = useAppSelector((state : RootState)=> state.auth)
    const [videos, setVideos] = useState<VideoFolderItem[]>([])
    const {id} = useParams()


    const onGetFolderVideos =async ()=>{
        const _videos = await getVideoFolderItemsbyId(id as string,user)
        setVideos(_videos)

    }
    useEffect(()=>{
        onGetFolderVideos()
    },[])
    return(
        <div className="flex flex-row flex-wrap items-center gap-4">
            {
                videos.map((video, index)=>(
                    <VideoComponent className="w-[20rem]" video={video} key={index} inFolder={false} />
                ))

            }
        </div>
    )
}