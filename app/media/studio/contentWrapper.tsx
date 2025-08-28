"use client"
import { StudioTopBar } from "@/app/components/studioTopBar"
import { useAppSelector, RootState, useAppDispatch } from "@/app/lib/local/redux/store"
import { usePathname } from "next/navigation"
import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Container } from "./container"

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export const ContentWrapper = ({children}: {children: React.ReactNode}) => {
    const pathName = usePathname()
    const {user} = useAppSelector((state: RootState) => state.auth)
    const dispatch = useAppDispatch()
    const name = pathName?.split("/")
    const x: string = name?.slice(0, name?.length - 1).join("/") || ""
    const paths = ["/media/studio/musicFolder", "/media/studio/videoFolder", "/media/studio"]
    const isUploadAllowed = paths.includes(x)
    const [isDragActive, setIsDragActive] = useState(false)
    const [file, setFile] = useState<File>()
    const [fileName, setFileName] = useState<string | null>(null)
    const [status, setStatus] = useState<UploadStatus>('idle')
    const [fileType, setFileType] = useState<'image' | 'video' | 'audio' | 'other'>('other')
    const [preview, setPreview] = useState<string | ArrayBuffer | null>(null)
    
    // Create refs for manual file input triggers
    const audioInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)

    const handleManualFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'video') => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files)
            onDrop(filesArray)
        }
    }

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setIsDragActive(false)
        if (acceptedFiles.length === 0) return

        const file = acceptedFiles[0]
        setFile(file)
        setFileName(file.name)
        setStatus('idle')

        // Determine file type
        if (file.type.startsWith('image/')) {
            setFileType('image')
            const reader = new FileReader()
            reader.onload = () => setPreview(reader.result)
            reader.readAsDataURL(file)
        } else if (file.type.startsWith('video/')) {
            setFileType('video')
            const reader = new FileReader()
            reader.onload = () => setPreview(reader.result)
            reader.readAsDataURL(file)
        } else if (file.type.startsWith('audio/')) {
            setFileType('audio')
            const reader = new FileReader()
            reader.onload = () => setPreview(reader.result)
            reader.readAsDataURL(file)
        } else {
            setFileType('other')
            const reader = new FileReader()
            reader.onload = () => setPreview(reader.result)
            reader.readAsText(file.slice(0, 10000))
        }
    }, [])

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
        accept: {
            'video/*': ['.mp4', '.mov', '.avi'],
            'audio/*': ['.mp3', '.wav'],
        },
        maxFiles: 1,
        disabled: !isUploadAllowed
    })

    return (
        <div className="flex flex-col gap-4">
            {/* Hidden inputs for manual triggering */}
            <input
                type="file"
                ref={audioInputRef}
                style={{ display: 'none' }}
                accept="audio/*"
                onChange={(e) => handleManualFileChange(e, 'audio')}
            />
            <input
                type="file"
                ref={videoInputRef}
                style={{ display: 'none' }}
                accept="video/*"
                onChange={(e) => handleManualFileChange(e, 'video')}
            />
            
            <StudioTopBar 
                getInputProps={getInputProps} 
                audioInputRef={audioInputRef as any} 
                videoInputRef={videoInputRef as any}
            />
            
            <Container 
                children={children} 
                file={file!} 
                fileName={fileName!} 
                fileType={fileType} 
                getRootProps={getRootProps} 
                isDragActive={isDragActive} 
                preview={preview} 
                setFile={setFile} 
                setFileName={setFileName} 
                setPreview={setPreview} 
                setStatus={setStatus} 
                status={status}  
            />
        </div>
    )
}