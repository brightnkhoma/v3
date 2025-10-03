"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoFolderCollection } from "../lib/types"
import { useCallback, useMemo } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Play, Calendar, Video } from "lucide-react";

export interface VideoStackProps {
    item: VideoFolderCollection;
    onClick: (folderId: string) => void;
    className?: string;
}

export const VideoStack: React.FC<VideoStackProps> = ({ item, onClick, className }) => {
    const imageUrl = useMemo(() => item.item.folderPoster || "/images/5.jpg", [item]);
    
    const handleClick = useCallback(() => {
        onClick(item.item.folderId);
    }, [item.item.folderId, onClick]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(item.item.folderId);
        }
    }, [item.item.folderId, onClick]);

    const formattedDate = useMemo(() => {
        if (!item.item.dateCreated) return null;
        return new Date(item.item.dateCreated).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }, [item.item.dateCreated]);

    const getInitials = useMemo(() => {
        if (!item.item.owner?.name) return "U";
        return item.item.owner.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }, [item.item.owner]);

    return (
        <Card 
            className={`
                h-max
                w-64 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] 
                cursor-pointer group border hover:border-primary/30
                bg-gradient-to-br from-card to-card/95 overflow-hidden
                ${className || ''}
            `}
            onClick={handleClick}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-bold line-clamp-2 leading-tight flex-1">
                        {item.item.folderName || "Untitled Folder"}
                    </CardTitle>
                    <FolderOpen className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                <div 
                    className="relative h-44 w-full rounded-lg overflow-hidden bg-muted/50"
                    role="button"
                    tabIndex={0}
                    onClick={handleClick}
                    onKeyPress={handleKeyPress}
                    aria-label={`Open folder ${item.item.folderName}`}
                >
                    <div className="absolute top-3 -right-1 w-[92%] h-[92%] rounded-lg border-2 border-background/80 transform rotate-3 opacity-70">
                        <Image 
                            src={imageUrl} 
                            alt=""
                            fill
                            className="object-cover rounded-lg"
                            sizes="(max-width: 768px) 100vw, 256px"
                        />
                    </div>
                    <div className="absolute top-1.5 -right-0.5 w-[94%] h-[94%] rounded-lg border-2 border-background/80 transform rotate-2 opacity-85">
                        <Image 
                            src={imageUrl} 
                            alt=""
                            fill
                            className="object-cover rounded-lg"
                            sizes="(max-width: 768px) 100vw, 256px"
                        />
                    </div>

                    <div className="absolute inset-0 z-10 transform group-hover:scale-105 transition-transform duration-300">
                        <Image 
                            src={imageUrl} 
                            alt={`Thumbnail for ${item.item.folderName}`}
                            fill
                            className="object-cover rounded-lg"
                            sizes="(max-width: 768px) 100vw, 256px"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="bg-primary/95 text-primary-foreground rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                                <Play className="h-5 w-5 fill-current" />
                            </div>
                        </div>
                    </div>

                    {item.count !== undefined && (
                        <Badge variant="secondary" className="absolute top-3 left-3 z-20 bg-background/95 backdrop-blur-sm border-0 shadow-sm">
                            <Video className="h-3 w-3 mr-1.5" />
                            {item.count}
                        </Badge>
                    )}

                    {formattedDate && (
                        <Badge variant="secondary" className="absolute bottom-3 right-3 z-20 bg-background/95 backdrop-blur-sm border-0 shadow-sm text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formattedDate}
                        </Badge>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-3 pt-0">
                {item.item.owner && (
                    <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-8 w-8 ring-2 ring-background">
                            <AvatarImage src={item.item.owner.avatar} alt={item.item.owner.name} />
                            <AvatarFallback className="text-xs bg-primary/10">
                                {getInitials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground truncate block">
                                {item.item.owner.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate block">
                                Owner
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                  
                    
                    <span className="text-xs text-primary/70 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Click to open →
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
};