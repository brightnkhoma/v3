"use client"
import { AlbumPlayer } from "@/app/components/albumPlayer"
import { MusicList } from "@/app/components/musicItem"
import { getFileContent, getFolderItem, getMusicAlbum, getVideoItem } from "@/app/lib/dataSource/contentDataSource"
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
    const musicAlbum = audioManager.album
    const {user} = useAppSelector((state : RootState)=> state.auth)
    const currentPlayingMusic =audioManager.item
    const [isAlbumLoading] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const router = useRouter()
      const [ui,setUi] = useState<number>(3)
      const {id : v} = useParams()
  const updateUi = useCallback(()=>{
        setUi(prev=>prev == 3 ? 2 : 3)
      },[ui])

    const onNavigateToComments = ()=>{
         router.push("#xcomments")
    }
    
      const getAudio = async () => {
        if (v) {
          const _item : any= await getVideoItem(v as string, user);
          if (_item) {
            await audioManager.setItem(_item);
          }
        }
        setLoading(false)
      };


    

    


    


    const onGetMusicFolderItem = async()=>{
        if(x){
            const id = x.id 
            const musicItem = await getFolderItem(id as string)
            if(musicItem && musicItem.content.contentId && musicItem.content.contentId != audioManager.item?.content.contentId){
                await audioManager.setItem(musicItem)
            }
        }
    }

   

    const onSetAudioFileFromlbum = async (index : number)=>{
        {
            const myFile = await getFileContent(musicAlbum[index],user)
            if(myFile){
                await audioManager.setItem(musicAlbum[index])
            }else{
                showToast("Failed to load media.")
            }
        
        }
    }

    useEffect(()=>{
        const get = async()=>{
            audioManager._updateUi_ = updateUi
            await onGetMusicFolderItem()

        }
        get()
    },[x])

    useEffect(()=>{
        getAudio()
    },[v])


  

  
    if(!audioManager.item) return null;

    return(
        <div className="size-full flex flex-col gap-8">
            <AlbumPlayer onNavigateToComments={onNavigateToComments} item = {audioManager.item}/>
            <MusicList user={user} currentPlayingIndex={currentPlayingMusic?.content.contentId}  isLoading = {isAlbumLoading} onPlay={onSetAudioFileFromlbum} items={musicAlbum} />
            <div id="xcomments"></div>
            <Comments item={audioManager.item}/>
        </div>
    )
}

export default MusicPlay;