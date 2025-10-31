import { showToast } from "@/app/lib/dataSource/toast";
import { Episode, Series } from "@/app/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { Play, Video, MoreVertical, Eye, Edit, Trash2, Clock,Image } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EpisodeGridCard({series }: { series: Series}) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);



 
  const hasVideo = true;
  const thumbnailUrl = series.thumbnail;
  const hasThumbnail = thumbnailUrl && !imageError;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20">
      <CardContent className="p-4">
        <div className="relative mb-4">
          {hasThumbnail ? (
            <div 
              className="w-full aspect-video rounded-md overflow-hidden bg-black cursor-pointer relative"
              onClick={() => {
                    router.push(`/media/series/${series.id}`);
                  }}
            >
              <img
                src={thumbnailUrl}
                alt={`Thumbnail for ${series.name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Play className="h-12 w-12 text-white/90" fill="white" />
                </div>
              </div>
              
            </div>
          ) : hasVideo ? (
            <div 
              className="w-full aspect-video rounded-md overflow-hidden bg-black cursor-pointer"
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                <Video className="h-8 w-8 text-white" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white/90" fill="white" />
                </div>
              </div>
          
            </div>
          ) : (
            <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          

          
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            
            <h3 className="font-semibold text-sm truncate flex-1" title={series.name}>
              {series.name}
            </h3>
          </div>
          
          {series.description?.heading && (
            <p className="text-muted-foreground text-xs line-clamp-2" title={series.description.heading}>
              {series.description.heading}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            
            <div className="flex items-center gap-2">
              
              <Badge variant={hasVideo ? "default" : "secondary"} className="text-xs">
                {hasVideo ? "Ready" : "Draft"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}