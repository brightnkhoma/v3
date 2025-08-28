import { setMeta } from '@/app/lib/local/redux/reduxSclice'
import { RootState, useAppDispatch, useAppSelector } from '@/app/lib/local/redux/store'
import { MusicFolderItem, MusicFolderType, VideoFolderItem, VideoFolderType } from '@/app/lib/types'
import {Folder,FolderClosed} from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface ContentFolderProps{
    name : string,
    id : string,
    type : MusicFolderType | VideoFolderItem,
    data : MusicFolderItem | VideoFolderItem
}
export const ContentFolder : React.FC<ContentFolderProps> = ({name,id,type,data})=>{
    const router = useRouter()
    const dispatch = useAppDispatch()
    const {meta} = useAppSelector((state : RootState)=> state.auth)
    const x : MusicFolderType [] = ["Album","Playlist"]
    const y : VideoFolderType [] = ["Movie",'Movie','Music-Video','Podcast','Series']

    const onNavigate = ()=>{
        if(x.includes(type as MusicFolderType)){
            router.push(`/media/studio/musicFolder/${id}`)
        }else if(y.includes(type as VideoFolderType)){
            router.push(`/media/studio/movieFolder/${id}`)
        }
        dispatch(setMeta(data))
    }
    return(
        <div onDoubleClick={onNavigate} onClick={()=>dispatch(setMeta(data))} className={`flex flex-row gap-4 cursor-pointer hover:bg-slate-400/10 active:bg-black/0 ${data.folderId == meta?.folderId && "bg-blue-100 dark:bg-blue-950"}`}>
            <FolderClosed fill='rgba(165,140,39,0.92)'  className='text-white dark:text-black'/>
            <span className=''>{name}</span>
        </div>
    )
}