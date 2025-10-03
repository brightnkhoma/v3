"use client"
import { usePathname } from "next/navigation"
import { useCallback, useState } from "react"
import { DropzoneRootProps, useDropzone } from "react-dropzone"
import { Content, ContentFile, ContentType, LicenseType, Movie, Music, MusicFolderItem, MusicFolderType, VideoFolderItem } from "../lib/types"
import { RootState, useAppSelector } from "../lib/local/redux/store"
import { onGenerateFile, onUpdateFolderItem, uploadFile } from "../lib/dataSource/contentDataSource"
import { showToast } from "../lib/dataSource/toast"
import { Loader2, UploadCloud, CheckCircle, X, File, Image, Music as MusicIcon, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { UploadTask } from "firebase/storage"
import { v4 } from "uuid"

export interface DragZoneProps {
    children: React.ReactNode,
    getRootProps: <T extends DropzoneRootProps>(props?: T) => T,
    isDragActive : boolean,
    file : File,
    setFile : (file : File | undefined) => void,
    fileName : string,
    setFileName : (name : string | null) => void,
    status : UploadStatus,
    setStatus : (status : UploadStatus) => void,
    fileType : 'image' | 'video' | 'audio' | 'other',
    preview : string | ArrayBuffer | null,
    setPreview : (preview : string | ArrayBuffer | null) => void
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export const DragZone: React.FC<DragZoneProps> = ({ children,getRootProps,isDragActive,file,setFile,fileName, setFileName,setStatus,status,fileType,preview,setPreview  }) => {
    const { user, meta } = useAppSelector((state: RootState) => state.auth)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [task, setTask] = useState<UploadTask>()
    


    const getFileIcon = () => {
        switch (fileType) {
            case 'image': return <Image className="h-12 w-12 text-black dark:text-white transition-colors duration-300" />
            case 'video': return <Film className="h-12 w-12 text-black dark:text-white transition-colors duration-300" />
            case 'audio': return <MusicIcon className="h-12 w-12 text-black dark:text-white transition-colors duration-300" />
            default: return <File className="h-12 w-12 text-black dark:text-white transition-colors duration-300" />
        }
    }

    const handleGenerateContentFiled = async (cFile: File, uri: string, type: ContentType.MOVIE | ContentType.MUSIC_TRACK) => {
        const x = await onGenerateFile(uri, cFile, user.userId, type)
        return x
    }

    const handleFinishUpload = async (uri: string, type: ContentType.MOVIE | ContentType.MUSIC_TRACK) => {
        if (!meta) return;
        try {
            const contentFile = await handleGenerateContentFiled(file!, uri, type)
            const _type = meta.type == "Movie"? ContentType.VIDEO : meta.type == "Series" ? ContentType.SERIES : ContentType.MOVIE
            const content1: Movie = {
                contentId: "",
                ownerId: user.userId,
                title: contentFile.name,
                description: "",
                releaseDate: new Date(),
                genres: [],
                type: _type,
                license: {
                    licenseId: "",
                    type: LicenseType.STREAM_ONLY,
                    terms: "",
                    allowsStreaming: false,
                    allowsDownload: false,
                    allowsPurchase: false
                },
                pricing: {
                    isPublic: false,
                    price: 0,
                    basePrice: 0,
                    currency: "MK"
                },
                thumbnail: meta.folderPoster,
                director: "",
                cast: [],
                duration: Number(contentFile.duration),
                rating: "",
                genre: "Soundtrack",
                views: 0
            }

            const content2: Music = {
                contentId: "",
                ownerId: user.userId,
                title: contentFile.name,
                description: "",
                releaseDate: new Date(),
                genres: [],
                type: ContentType.MUSIC_TRACK,
                license: {
                    licenseId: "",
                    type: LicenseType.STREAM_ONLY,
                    terms: "",
                    allowsStreaming: false,
                    allowsDownload: false,
                    allowsPurchase: false
                },
                pricing: {
                    isPublic: false,
                    price: 0,
                    basePrice: 0,
                    currency: "MK"
                },
                thumbnail: meta.folderPoster,
                artists: [],
                album: "",
                duration: Number(contentFile.duration),
                genre: "Soundtrack"
            }

            if ((meta.type == "Album" || meta.type == "Playlist")) {
                const item: MusicFolderItem = { ...meta,owner : user, isPoster: false, content: content2 }
                await onUpdateFolderItem(user, item, () => {
                    showToast("File created successfully!")
                    setStatus('success')
                }, () => {
                    showToast("File not created.")
                    setStatus('error')
                }, contentFile)
            } else if (meta.type == "Movie" || meta.type == "Series") {
                const item: VideoFolderItem = { ...meta,owner:user, isPoster: false, content: content1 }
                await onUpdateFolderItem(user, item, () => {
                    showToast("File created successfully!")
                    setStatus('success')
                }, () => {
                    showToast("File not created.")
                    setStatus('error')
                }, contentFile)
            }
        } catch (error) {
            console.error("Error creating content:", error)
            showToast("Failed to create content.")
            setStatus('error')
        }
    }

    const startUpload = async () => {
        if (!file) return

        setStatus('uploading')
        setUploadProgress(0)

        try {
            await uploadFile(
                file,
                (progress) => setUploadProgress(Math.round(progress)),
                (isPaused) => console.log('Upload paused:', isPaused),
                (isRunning) => console.log('Upload running:', isRunning),
                (isCanceled) => {
                    console.log('Upload canceled:', isCanceled)
                    setStatus('idle')
                },
                (task) => setTask(task),
                (downloadUri) => {
                    if (downloadUri) {
                        const type = (meta?.type == "Album" || meta?.type == "Playlist") 
                            ? ContentType.MUSIC_TRACK 
                            : ContentType.MOVIE
                        handleFinishUpload(downloadUri, type)
                    }
                },
                v4(),
                file.type.includes('image') ? 'image' : file.type.includes('video') ? 'video' : 'file',
                (meta?.type == "Album" || meta?.type == "Playlist") ? ContentType.MUSIC_TRACK : ContentType.MOVIE
            )
        } catch (error) {
            console.error('Upload failed:', error)
            showToast("Upload failed. Please try again.")
            setStatus('error')
        }
    }

    

    const resetUpload = () => {
        setPreview(null)
        setFileName(null)
        setFile(undefined)
        setStatus('idle')
        setUploadProgress(0)
    }

    const cancelUpload = () => {
        if (task) {
            task.cancel()
        }
        resetUpload()
    }

    return (
        <div
            {...getRootProps()}
            className={`relative flex flex-col min-h-screen w-full ${isDragActive ? 'bg-gray-100 dark:bg-gray-900' : ''} transition-colors duration-300`}
        >
            {preview ? (
                <div className="flex flex-col items-center p-6 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 mx-auto my-8 w-full max-w-3xl transition-colors duration-300">
                    <div className="relative w-full">
                        {/* File Preview */}
                        <div className="mb-6">
                            {fileType === 'image' ? (
                                <div className="flex justify-center">
                                    <img
                                        src={preview as string}
                                        alt="Preview"
                                        className="max-h-80 max-w-full object-contain rounded-md"
                                    />
                                </div>
                            ) : fileType === 'video' ? (
                                <div className="bg-black rounded-md flex items-center justify-center">
                                    <video 
                                        src={preview as string} 
                                        controls 
                                        className="max-h-80 max-w-full rounded-md"
                                    />
                                </div>
                            ) : fileType === 'audio' ? (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md w-full transition-colors duration-300">
                                    <div className="flex items-center gap-4 mb-4">
                                        {getFileIcon()}
                                        <div>
                                            <h3 className="font-medium text-black dark:text-white transition-colors duration-300">{fileName}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{file?.type}</p>
                                        </div>
                                    </div>
                                    <audio 
                                        src={preview as string} 
                                        controls 
                                        className="w-full"
                                    />
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md w-full max-h-64 overflow-auto transition-colors duration-300">
                                    <div className="flex items-center gap-4 mb-4">
                                        {getFileIcon()}
                                        <div>
                                            <h3 className="font-medium text-black dark:text-white transition-colors duration-300">{fileName}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{file?.type}</p>
                                        </div>
                                    </div>
                                    <pre className="text-sm whitespace-pre-wrap text-black dark:text-white transition-colors duration-300">{preview as any}</pre>
                                </div>
                            )}
                        </div>

                        {/* Upload Progress */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-black dark:text-white transition-colors duration-300">
                                    {status === 'uploading' ? 'Uploading...' : 
                                     status === 'success' ? 'Upload complete!' : 
                                     status === 'error' ? 'Upload failed' : 'Ready to upload'}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{uploadProgress}%</span>
                            </div>
                            
                            <Progress 
                                value={uploadProgress} 
                                className={`h-2 transition-colors duration-300 ${
                                    status === 'error' ? 'bg-red-500' : 
                                    status === 'success' ? 'bg-green-500' : 'bg-white dark:bg-black'
                                }`}
                            />

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-2">
                                {status === 'uploading' ? (
                                    <Button
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            cancelUpload()
                                        }}
                                        disabled={status !== 'uploading'}
                                        className="border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-300"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                ) : status === 'idle' ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                resetUpload()
                                            }}
                                            className="border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-300"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                startUpload()
                                            }}
                                            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300"
                                        >
                                            <UploadCloud className="h-4 w-4 mr-2" />
                                            Upload
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            resetUpload()
                                        }}
                                        className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300"
                                    >
                                        Done
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {children}
                    {isDragActive && (
                        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
                            <div className="bg-white dark:bg-black p-8 rounded-lg border border-gray-200 dark:border-gray-800 text-center max-w-md transition-colors duration-300">
                                <UploadCloud className="h-16 w-16 mx-auto mb-4 text-black dark:text-white transition-colors duration-300" />
                                <h3 className="text-xl font-medium mb-2 text-black dark:text-white transition-colors duration-300">Drop to upload</h3>
                                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Supports images, videos, and audio files</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 transition-colors duration-300">File will be uploaded immediately</p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}