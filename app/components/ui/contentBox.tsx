import Image from "next/image";
import { Play, Heart, Headphones } from 'lucide-react';

interface ContentBoxProps {
    imageUri: string;
    title?: string;
    artist?: string;
    likes?: string;
    listens?: number;
    id: string;
    albumName ? : string,
}

export const ContentBox: React.FC<{ x: ContentBoxProps }> = ({ x }) => {
    const { id, imageUri, title, artist, likes, listens,albumName } = x;

    return (
        <div className="group relative w-[150px] cursor-pointer transition-all duration-200 hover:scale-105">
            {/* Image container with hover overlay */}
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
                <Image 
                    src={imageUri || "/images/2.webp"} 
                    alt={title || "Music cover"} 
                    fill
                    className="object-cover"
                />
                
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 bg-opacity-40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary p-2">
                        <Play className="h-6 w-6 " />
                    </div>
                </div>
            </div>

            <div className="mt-2 px-1">
                <h3 className="truncate text-sm  font-medium ">{albumName || "Untitled"}</h3>
                <p className="truncate text-xs ">{artist || "Unknown artist"}</p>
                
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    {likes !== undefined && (
                        <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {likes}
                        </span>
                    )}
                    {listens !== undefined && (
                        <span className="flex items-center gap-1">
                            <Headphones className="h-3 w-3" />
                            {listens}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};