"use client"
import { useContext, useEffect, useState } from "react"
import { MusicFolderItem } from "../lib/types"
import { MusicItem } from "./videoItem"
import { RootState, useAppDispatch, useAppSelector } from "../lib/local/redux/store"
import { getFolderItem, getItemById, onGetFolderItems } from "../lib/dataSource/contentDataSource"
import { AppContext } from "../appContext"
import { useParams, useSearchParams } from "next/navigation"
import { setMeta } from "../lib/local/redux/reduxSclice"
// import SelectionBox from "./selectioBox"
export const MusicFolder = ()=>{
    const [items, setItems] = useState<MusicFolderItem[]>([])
    const {audioManager} = useContext(AppContext)!
    const {id} = useParams()
    const userId = useSearchParams().get("userId") 
    const dispatch = useAppDispatch()
    // const [isDragging, setIsDragging] = useState(false);
//     const [start, setStart] = useState({ x: 0, y: 0 });
//     const [rect, setRect] = useState({ x: 0, y: 0, w: 0, h: 0 });

//     const handleMouseDown = (e: React.MouseEvent) => {
//         const { clientX, clientY } = e;
//         setStart({ x: clientX, y: clientY });
//         setRect({ x: clientX, y: clientY, w: 0, h: 0 });
//         setIsDragging(true);
//     };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!isDragging) return;
//     const { clientX, clientY } = e;

//     const newX = Math.min(clientX, start.x);
//     const newY = Math.min(clientY, start.y);
//     const newW = Math.abs(clientX - start.x);
//     const newH = Math.abs(clientY - start.y);

//     setRect({ x: newX, y: newY, w: newW, h: newH });
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//   };


    const {user,meta,folderMusicViewMode} = useAppSelector((state : RootState) => state.auth)

    const onGetFiles = async()=>{
       
        if(id && userId){
          
            
        const item = await getItemById(userId,id as string)
        if(item){
            const data = await onGetFolderItems(user,item)
            setItems(data as MusicFolderItem[])
            // dispatch(setMeta(item))
            

        }
    }
    }

    const onPlayItem = async(item : MusicFolderItem)=>{
        await audioManager.setItem(item)
    }

    useEffect(()=>{
        onGetFiles()
    },[user,meta])
    return(
        <div className={`flex flex-col flex-1 min-h-screen w-full relative`}>
           <div 
                  className={`size-full min-h-screen flex ${folderMusicViewMode == "grid" ? "flex-row flex-wrap gap-4" : "flex-col"} gap-2 `}>
             {
                items.map((value, index)=>(
                    <MusicItem onClick={onPlayItem} viewMode={folderMusicViewMode} meta={meta as MusicFolderItem} item={value} key={index}/>
                ))
            }
           </div>
            {items.length == 0 &&<span className="text-xs mx-auto font-light text-gray-500">This folder is empty</span>}
            {/* <SelectionBox isDragging = {isDragging} rect={rect}/> */}
        </div>
    )
}