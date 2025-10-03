'use client'

import { getVideoFolderItemsbyId } from "@/app/lib/dataSource/contentDataSource";
import { User, VideoFolderItem, VideoFolderType } from "@/app/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Play, Calendar, Users, Clock, Folder, Video, Star, Share2, Download, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Image from "next/image";
import { firestoreTimestampToDate } from "@/app/lib/config/timestamp";

type ViewMode = "grid" | "list";

const Page = () => {
    const { v } = useParams();
    const { id } = useParams();
    const router = useRouter();

    const [videos, setVideos] = useState<VideoFolderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    const onGetFolderVideos = async () => {
        try {
            setLoading(true);
            setError(null);
            const _videos = await getVideoFolderItemsbyId(v as string, { userId: id as string } as User);
            setVideos(_videos);
        } catch (err) {
            setError("Failed to load videos");
            console.error("Error fetching videos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        onGetFolderVideos();
    }, [v, id]);

    const goBack = () => {
        router.back();
    };

    const playVideo = (videoId: string) => {
        router.push(`/media/movies/play/${videoId}`);
    };

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const formatDate = (date: Date): string => {
        return new Date(firestoreTimestampToDate(date as any)).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const folderInfo = videos[0];
    const owner = folderInfo?.owner;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-6 w-32 mb-6" />
                    
                    <div className="flex flex-col lg:flex-row gap-8 mb-8">
                        <Skeleton className="h-80 w-full lg:w-96 rounded-xl" />
                        
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="flex gap-4 mt-4">
                                <Skeleton className="h-10 w-32 rounded-full" />
                                <Skeleton className="h-10 w-32 rounded-full" />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="text-center">
                                        <Skeleton className="h-6 w-16 mx-auto mb-2" />
                                        <Skeleton className="h-4 w-20 mx-auto" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-10 w-24" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <Skeleton className="h-48 w-full" />
                                <CardContent className="p-4">
                                    <Skeleton className="h-5 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <Video className="h-8 w-8 text-destructive" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Unable to load videos</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <div className="flex gap-3 justify-center pt-4">
                        <Button onClick={goBack} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                        <Button onClick={onGetFolderVideos}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!folderInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Folder className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Folder not found</h2>
                    <p className="text-muted-foreground">The video folder you're looking for doesn't exist or is unavailable.</p>
                    <Button onClick={goBack} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="bg-gradient-to-r from-primary/5 via-background to-background border-b">
                <div className="max-w-7xl mx-auto p-6">
                    <Button 
                        variant="ghost" 
                        onClick={goBack}
                        className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Collection
                    </Button>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="relative group flex justify-center lg:justify-start">
                            <div className="relative h-80 w-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/10">
                                <Image
                                    src={folderInfo.folderPoster || "/images/5.jpg"}
                                    alt={folderInfo.folderName}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                
                                <Badge className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm text-foreground border-0 shadow-sm">
                                    {folderInfo.type}
                                </Badge>
                            </div>
                        </div>

                        {/* Folder Details */}
                        <div className="flex-1 space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                                    {folderInfo.folderName}
                                </h1>
                                
                                {folderInfo.content?.description && (
                                    <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                                        {folderInfo.content.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button 
                                    size="lg" 
                                    className="bg-primary hover:bg-primary/90 px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                                    onClick={() => videos.length > 0 && playVideo(videos[0].content.contentId)}
                                >
                                    <Play className="h-5 w-5 mr-2 fill-current" />
                                    Play First Video
                                </Button>
                                
                                <Button variant="outline" size="lg" className="border-2">
                                    <Share2 className="h-5 w-5 mr-2" />
                                    Share
                                </Button>
                                
                                {folderInfo.isPaid && folderInfo.price && (
                                    <Button variant="secondary" size="lg" className="bg-gradient-to-r from-secondary to-secondary/80">
                                        <Download className="h-5 w-5 mr-2" />
                                        Purchase - ${folderInfo.price.price}
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                                <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border">
                                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3">
                                        <Video className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">{videos.length}</p>
                                    <p className="text-sm text-muted-foreground">Videos</p>
                                </div>

                                {folderInfo.content?.duration && (
                                    <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border">
                                        <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-full mx-auto mb-3">
                                            <Clock className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <p className="text-2xl font-bold text-foreground">
                                            {formatDuration(folderInfo.content.duration)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Duration</p>
                                    </div>
                                )}

                                {folderInfo.content?.rating && (
                                    <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border">
                                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/10 rounded-full mx-auto mb-3">
                                            <Star className="h-6 w-6 text-yellow-500" />
                                        </div>
                                        <p className="text-2xl font-bold text-foreground">{folderInfo.content.rating}</p>
                                        <p className="text-sm text-muted-foreground">Rating</p>
                                    </div>
                                )}

                                {folderInfo.dateCreated && (
                                    <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border">
                                        <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full mx-auto mb-3">
                                            <Calendar className="h-6 w-6 text-green-500" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">
                                            {formatDate(folderInfo.dateCreated)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Created</p>
                                    </div>
                                )}
                            </div>

                            {owner && (
                                <div className="flex items-center gap-4 pt-4 border-t">
                                    <Avatar className="h-14 w-14 ring-2 ring-primary/20 shadow-lg">
                                        <AvatarImage src={owner.avatar} alt={owner.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                            {owner.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-foreground text-lg">{owner.name}</p>
                                        <p className="text-sm text-muted-foreground">Content Owner</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Videos Section */}
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-foreground">
                            Videos ({videos.length})
                        </h2>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Folder className="h-4 w-4" />
                            <span>{folderInfo.type} Collection</span>
                        </div>
                    </div>
                    
                    <ToggleGroup 
                        type="single" 
                        value={viewMode}
                        onValueChange={(value: ViewMode) => value && setViewMode(value)}
                        className="bg-muted/50 rounded-lg p-1 border"
                    >
                        <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3 py-2">
                            <Grid3X3 className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="list" aria-label="List view" className="px-3 py-2">
                            <List className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {videos.length > 0 ? (
                    <div className={viewMode === "grid" 
                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        : "space-y-4"
                    }>
                        {videos.map((video, index) => (
                            viewMode === "grid" ? (
                                <Card 
                                    key={video.content.contentId} 
                                    className="group cursor-pointer overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-xl bg-card/50 backdrop-blur-sm"
                                    onClick={() => playVideo(video.content.contentId)}
                                >
                                    <CardContent className="p-0 relative">
                                        <div className="relative h-48 w-full">
                                            <Image
                                                src={video.content.thumbnail || video.folderPoster || "/images/5.jpg"}
                                                alt={video.folderName}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-primary text-primary-foreground rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                                                    <Play className="h-6 w-6 fill-current" />
                                                </div>
                                            </div>
                                            
                                            <Badge variant="secondary" className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm border-0 shadow-sm">
                                                #{index + 1}
                                            </Badge>
                                            
                                            {video.content?.duration && (
                                                <Badge variant="secondary" className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm border-0 shadow-sm">
                                                    {formatDuration(video.content.duration)}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                    
                                    <CardFooter className="p-4">
                                        <div className="space-y-2 w-full">
                                            <h3 className="font-semibold text-foreground line-clamp-1 text-lg">
                                                {video.content.title}
                                            </h3>
                                            
                                            {video.content?.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {video.content.description}
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                                                {video.dateCreated && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(video.dateCreated)}
                                                    </span>
                                                )}
                                                
                                                {video.isPaid && (
                                                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-700 border-yellow-200">
                                                        Paid
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ) : (
                                // List View Card
                                <Card 
                                    key={video.folderId}
                                    className="group cursor-pointer overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm"
                                    onClick={() => playVideo(video.content.contentId)}
                                >
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="relative h-48 sm:h-32 sm:w-48 flex-shrink-0">
                                            <Image
                                                src={video.folderPoster || "/images/5.jpg"}
                                                alt={video.folderName}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                                            
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-primary/90 text-primary-foreground rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                                    <Play className="h-5 w-5 fill-current" />
                                                </div>
                                            </div>
                                            
                                            <Badge variant="secondary" className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm border-0">
                                                #{index + 1}
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex-1 p-4">
                                            <div className="flex flex-col h-full justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-foreground text-lg mb-2">
                                                        {video.folderName}
                                                    </h3>
                                                    
                                                    {video.content?.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                                                            {video.content.description}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-4">
                                                        {video.dateCreated && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(video.dateCreated)}
                                                            </span>
                                                        )}
                                                        
                                                        {video.content?.duration && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDuration(video.content.duration)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {video.isPaid && (
                                                        <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-700 border-yellow-200">
                                                            Paid
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 space-y-4">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <Video className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">No videos available</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            This folder doesn't contain any videos yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;