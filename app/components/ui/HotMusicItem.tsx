import { MusicRowItemProps, MusicRowProps } from "@/app/lib/types"
import { ContentBox } from "./contentBox"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/app/lib/local/redux/store"
import { setAudioFile } from "@/app/lib/local/redux/reduxSclice"
import { AppContext } from "@/app/appContext"
import { useContext, useEffect, useState } from "react"
import { getLikeCount } from "@/app/lib/dataSource/contentDataSource"

export const HotMusicItem : React.FC<{x : MusicRowItemProps}> = ({x})=>{
    const id = x.content.contentId
    const thumNail = x.content.thumbnail || x.folderPoster
    const title = x.content.title
    const listens = x.content.listens || 0
    const albumName = x.folderName
    const artist =  x.content.artists[0] || x.artistName || x.owner.name
    const [likes, setLikes] = useState<string>("...")

     const onGetLikeCount = async()=>{
         const count = await getLikeCount(x)
         setLikes((count | 0).toString())
    
       }

       useEffect(()=>{
        onGetLikeCount()
       },[])


    const {audioManager} = useContext(AppContext)!
    const dispatch = useAppDispatch()
    const router = useRouter()
    
    return(
        <div onClick={async ()=>{
            // dispatch(setAudioFile(null))
            await audioManager.setItem(x)            
            router.push(`/media/music/play/${id}`)}} className="flex flex-col relative">
            <ContentBox x={{id,imageUri : thumNail,likes,listens,albumName,artist}}/>
            <span className="truncate max-w-[8rem]">{title}</span>
            <span className="truncate max-w-[8rem] absolute top-4 left-4 bg-green-600 text-white px-4 rounded-md shadow-2xl shadow-amber-300"> {x.price ? ("MK " + x.price.price) : "free"}</span>

        </div>
    )
}