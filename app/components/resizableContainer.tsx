
"use client"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { DragZone, DragZoneProps } from "./dragZone"

interface ResizableContainerProps extends DragZoneProps{
    children : React.ReactNode,
    sider : React.ReactNode
}
export const ResizableContainer : React.FC<ResizableContainerProps> = ({children,sider,file,fileName,fileType,getRootProps,isDragActive,preview,setFile,setFileName,setPreview,setStatus,status})=>{
    return(
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={80}>
                <DragZone children={children} file={file} fileName={fileName} fileType={fileType} getRootProps={getRootProps} isDragActive = {isDragActive} preview={preview} setFile={setFile} setFileName={setFileName} setPreview={setPreview} setStatus={setStatus} status={status}  />

               
            </ResizablePanel>
            <ResizableHandle/>
            <ResizablePanel>
                {sider}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}