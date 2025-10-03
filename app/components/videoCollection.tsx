"use client"
import { useEffect, useState } from "react"
import { VideoStack } from "./videoStack"
import { VideoFolderCollection } from "../lib/types"
import { getVideoCollection } from "../lib/dataSource/contentDataSource"
import { useParams, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, User, FolderOpen, Video } from "lucide-react"

export const VideoCollection = ()=>{
    const {id} = useParams()
    const [videoCollection, setVideoCollection] = useState<VideoFolderCollection[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const onClick = (path : string)=>{
        router.push(`/media/movies/collection/${id}/${path}`)
    }

    const onGetVideoCollection = async()=>{
        try {
            setLoading(true)
            setError(null)
            if(id) {
                const items = await getVideoCollection(id as string)
                setVideoCollection(items)
            }
        } catch (err) {
            setError("Failed to load video collection")
            console.error("Error fetching video collection:", err)
        } finally {
            setLoading(false)
        }
    }

    const goBack = () => {
        router.back()
    }

    useEffect(()=>{
        onGetVideoCollection()
    },[id])


    const owner = videoCollection[0]?.item.owner

    const totalVideos = videoCollection.reduce((sum, item) => sum + (item.count || 0), 0)

    if (loading) {
        return (
            <div className="min-h-screen w-full p-6">
                <div className="mb-8">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="flex items-center gap-4 mb-6">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="space-y-3">
                            <Skeleton className="h-44 w-full rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <Video className="h-8 w-8 text-destructive" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Unable to load collection</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <div className="flex gap-3 justify-center pt-4">
                        <Button onClick={goBack} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                        <Button onClick={onGetVideoCollection}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return(
        <div className="min-h-screen w-full p-6">
            <div className="mb-8 space-y-6">
                <div className="flex items-center justify-between">
                    <Button 
                        variant="ghost" 
                        onClick={goBack}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        onClick={onGetVideoCollection}
                        className="flex items-center gap-2"
                        size="sm"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {owner && (
                    <div className="bg-gradient-to-r from-card to-card/80 border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                                <AvatarImage src={owner.avatar} alt={owner.name} />
                                <AvatarFallback className="text-lg bg-primary/10">
                                    <User className="h-8 w-8" />
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold text-foreground truncate">
                                    {owner.name}'s Collection
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Video collection curated by {owner.name}
                                </p>
                                
                                <div className="flex items-center gap-6 mt-4">
                                    <div className="flex items-center gap-2">
                                        <FolderOpen className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium">
                                            {videoCollection.length} {videoCollection.length === 1 ? 'Folder' : 'Folders'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Video className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium">
                                            {totalVideos} {totalVideos === 1 ? 'Video' : 'Videos'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {videoCollection.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {videoCollection.map((item, index) => (
                        <VideoStack 
                            onClick={onClick} 
                            item={item} 
                            key={`${item.item.folderId}-${index}`}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <FolderOpen className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No folders found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        This collection doesn't contain any video folders yet.
                    </p>
                    <Button onClick={onGetVideoCollection} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Check Again
                    </Button>
                </div>
            )}
        </div>
    )
}