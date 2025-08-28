"use client"
import { AlbumPlayer } from "@/app/components/albumPlayer"
import { MusicList } from "@/app/components/musicItem"
import { getFileContent, getFolderItem, getMusicAlbum } from "@/app/lib/dataSource/contentDataSource"
import { showToast } from "@/app/lib/dataSource/toast"
import { setAudioFile} from "@/app/lib/local/redux/reduxSclice"
import { RootState, useAppDispatch, useAppSelector } from "@/app/lib/local/redux/store"
import { AccountType, ContentFile, MusicFolderItem, User,Comment } from "@/app/lib/types"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useContext, useEffect, useState } from "react"
import { AppContext } from "@/app/appContext"
import { CommentsSection } from "@/app/components/comments"
import { Comments } from "@/app/components/commentSnippet"





const MusicPlay = ()=>{
    const x = useParams()
    const {audioManager} = useContext(AppContext)!
    const [musicAlbum, setMusicAlbum] = useState<MusicFolderItem[]>([...(audioManager.album || [])])
    const {user} = useAppSelector((state : RootState)=> state.auth)
    const dispatch = useAppDispatch()
    const [isAlbumLoading, setIsAlbulmLoading] = useState<boolean>(false)
    const router = useRouter()

    const onNavigateToComments = ()=>{
         router.push("#xcomments")
    }


    const setItem =async (item : MusicFolderItem)=>{
       await audioManager.setItem(item,setMusicAlbum)
    }

    


    


    const onGetMusicFolderItem = async()=>{
        if(x){
            const id = x.id 
            const musicItem = await getFolderItem(id as string)
            if(musicItem && musicItem.content.contentId != audioManager.item?.content.contentId){
                await setItem(musicItem)
                setMusicAlbum(audioManager.album)
            }
        }
    }

   

    const onSetAudioFileFromlbum = useCallback(async (index : number)=>{
        {
            const myFile = await getFileContent(musicAlbum[index],user)
            if(myFile){


                await audioManager.play(myFile)
                dispatch(setAudioFile(myFile))
                setItem(musicAlbum[index])
            }else{
                showToast("Failed to load media.")
            }
        
        }
    },[audioManager.item,musicAlbum])

    useEffect(()=>{
        onGetMusicFolderItem()
    },[])


  

  
    if(!audioManager.item) return null;

    return(
        <div className="size-full flex flex-col gap-8">
            <AlbumPlayer onNavigateToComments={onNavigateToComments} item = {audioManager.item}/>
            <MusicList user={user} currentPlayingIndex={musicAlbum.findIndex(x=> x.content.contentId == audioManager.item!.content.contentId)}  isLoading = {isAlbumLoading} onPlay={onSetAudioFileFromlbum} items={musicAlbum} />
            <div id="xcomments"></div>
            <Comments item={audioManager.item}/>
        </div>
    )
}

export default MusicPlay;