"use client"
import { DragZoneProps } from "@/app/components/dragZone"
import { FileMetaBar } from "@/app/components/fileMetaBar"
import { ResizableContainer } from "@/app/components/resizableContainer"
import { RootState, useAppSelector } from "@/app/lib/local/redux/store"
import { Movie, User, VideoFolderItem } from "@/app/lib/types"


export const Container : React.FC<DragZoneProps>= ({children,file,fileName,fileType,getRootProps,isDragActive,preview,setFile,setFileName,setPreview,setStatus,status})=>{
    const {meta,showPreview,user} = useAppSelector((state : RootState)=> state.auth)
    return(
            <ResizableContainer  children = {children} file={file} fileName={fileName} fileType={fileType} getRootProps={getRootProps} isDragActive={isDragActive} preview={preview} setFile={setFile} setFileName={setFileName} setPreview={setPreview} setStatus={setStatus} status={status} sider = {(showPreview && meta ? <FileMetaBar user={user} data={meta}/> : <></>)}/>

    )
}