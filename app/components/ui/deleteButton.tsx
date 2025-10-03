"use client"
import {Trash2Icon} from "lucide-react"
import { AppContext } from "@/app/appContext"
import { useContext } from "react"
import { RootState, useAppDispatch, useAppSelector } from "@/app/lib/local/redux/store"
import { deleteMoreFolderItem } from "@/app/lib/dataSource/contentDataSource"
import { showToast } from "@/app/lib/dataSource/toast"
import { setMeta } from "@/app/lib/local/redux/reduxSclice"
export const DeleteButtton = ()=>{
    const {global} = useContext(AppContext)!
    const {user} = useAppSelector((state : RootState)=> state.auth)
    const {setDeletingFolder,deletingFolder,selectedMusicFolderItems,setSelectedMusicFolderItems} = global
    const dispatch = useAppDispatch()

    
    const onDeleteItem = async()=>{
            if(deletingFolder) return;
            setDeletingFolder(selectedMusicFolderItems.map(x=> x.content.contentId))

            await deleteMoreFolderItem(selectedMusicFolderItems,user,()=>{
                setSelectedMusicFolderItems([])
                showToast("Items Deleted",{variant : "solid"})
            },()=>{
                showToast("Items Failed to Delete",{variant : "solid"})
            })
            setDeletingFolder(null)
            dispatch(setMeta(null))

    }

    return(
        <div>
           {
            global.deletingFolder ?  <Trash2Icon size={18} className="text-red-950 dark:text-red-400 animate-caret-blink"/> :  <Trash2Icon onClick={onDeleteItem} size={18} className="text-red-950 active:opacity-80 active:scale-50 cursor-pointer dark:text-red-400"/>
           }

        </div>
    )
}