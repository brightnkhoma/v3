// app/zathu/play/series/[seriesId]/seasons/[seasonId]/episodes/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  MoreVertical, 
  Play,
  Edit,
  Trash2,
  Video,
  Clock,
  Eye,
  FileText,
  Grid,
  List,
  Search,
  Filter,
  SortAsc,
  FolderOpen,
  Image
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showToast as toast } from "@/app/lib/dataSource/toast";
import { Episode } from "@/app/lib/types";
import { RootState, useAppSelector } from "@/app/lib/local/redux/store";
import { getEpisodesBySeasonId } from "@/app/lib/dataSource/contentDataSource";

const showToast = (x: string, y: string, z: any = "default") => {
  toast(x, { description: y, type: z });
}

// Grid View Episode Card
function EpisodeGridCard({ episode, seriesId, seasonId }: { episode: Episode, seriesId: string, seasonId: string }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleViewDetails = () => {
    router.push(`/media/studio/series/${seriesId}/seasons/${seasonId}/episodes/${episode.id}`);
  };

  const handleEdit = () => {
        router.push(`/media/studio/series/${seriesId}/seasons/${seasonId}/episodes/create/?${new URLSearchParams({episodeId : episode?.id || ""})}`);

  };

  const handleDelete = async () => {
    try {
      // Add delete logic here
      showToast("Episode deleted", `Episode ${episode.name} has been deleted`, "success");
    } catch (error) {
      showToast("Error", "Failed to delete episode", "error");
    }
  };

  const getDuration = () => {
    if (episode.content?.content?.duration) {
      const time = episode.content.content.duration;
      const min = Math.floor(time/60)
      const sec = Math.floor(time%60)
      return `${min} : ${sec}`

    }
    return "Unknown";
  };

  const hasVideo = true;
  const thumbnailUrl = episode.content?.content?.thumbnail;
  const hasThumbnail = thumbnailUrl && !imageError;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20">
      <CardContent className="p-4">
        {/* Thumbnail */}
        <div className="relative mb-4">
          {hasThumbnail ? (
            <div 
              className="w-full aspect-video rounded-md overflow-hidden bg-black cursor-pointer relative"
              onClick={() => {
                    router.push(`/media/movies/play/${episode.id}?${new URLSearchParams({ isEpisode: "true" }).toString()}`);
                  }}
            >
              <img
                src={thumbnailUrl}
                alt={`Thumbnail for ${episode.name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Play className="h-12 w-12 text-white/90" fill="white" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="bg-black/80 text-white text-xs">
                  {getDuration()}
                </Badge>
              </div>
            </div>
          ) : hasVideo ? (
            <div 
              className="w-full aspect-video rounded-md overflow-hidden bg-black cursor-pointer"
              onClick={handleViewDetails}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                <Video className="h-8 w-8 text-white" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white/90" fill="white" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="bg-black/80 text-white text-xs">
                  {getDuration()}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          {/* Quick Actions Overlay */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0  hover:opacity-70">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleViewDetails}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Episode
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    router.push(`/media/movies/play/${episode.id}?${new URLSearchParams({ isEpisode: "true" }).toString()}`);
                  }}
                  disabled={!hasVideo}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play Episode
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Episode
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-semibold text-xs">
              E{episode.episodeNumber || 1}
            </Badge>
            <h3 className="font-semibold text-sm truncate flex-1" title={episode.name}>
              {episode.name}
            </h3>
          </div>
          
          {episode.description?.heading && (
            <p className="text-muted-foreground text-xs line-clamp-2" title={episode.description.heading}>
              {episode.description.heading}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{getDuration()}</span>
            </div>
            <div className="flex items-center gap-2">
              {hasThumbnail && (
                <Badge variant="outline" className="text-xs">
                  <Image className="h-3 w-3 mr-1" />
                </Badge>
              )}
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

// List View Episode Row
function EpisodeListRow({ episode, seriesId, seasonId }: { episode: Episode, seriesId: string, seasonId: string }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleViewDetails = () => {
    router.push(`/media/studio/series/${seriesId}/seasons/${seasonId}/episodes/${episode.id}`);
  };

  const handleEdit = () => {
       router.push(`/media/studio/series/${seriesId}/seasons/${seasonId}/episodes/create/?${new URLSearchParams({episodeId : episode?.id || ""})}`);

  };

  const getDuration = () => {
    if (episode.content?.content?.duration) {
      return episode.content.content.duration;
    }
    return "Unknown";
  };

  const hasVideo = true;
  const thumbnailUrl = episode.content?.content?.thumbnail;
  const hasThumbnail = thumbnailUrl && !imageError;

  return (
    <div 
      className="flex items-center gap-4 p-4 border-b hover:bg-muted/50 group cursor-pointer transition-colors"
      onDoubleClick={()=>router.push(`/media/movies/play/${episode.id}?${new URLSearchParams({ isEpisode: "true" }).toString()}`)}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-20 h-12 rounded overflow-hidden bg-muted relative">
        {hasThumbnail ? (
          <>
            <img
              src={thumbnailUrl}
              alt={`Thumbnail for ${episode.name}`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <Play className="h-4 w-4   opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : hasVideo ? (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
            <Video className="h-4 w-4 " />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        
        {/* Thumbnail Indicator */}
        {hasThumbnail && (
          <div className="absolute top-1 left-1">
            <Image className="h-2 w-2 " fill="white" />
          </div>
        )}
      </div>

      {/* Episode Info */}
      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-4 flex items-center gap-3">
          <Badge variant="secondary" className="font-semibold text-xs min-w-[40px]">
            E{episode.episodeNumber || 1}
          </Badge>
          <span className="font-medium truncate" title={episode.name}>
            {episode.name}
          </span>
        </div>

        <div className="col-span-4">
          {episode.description?.heading && (
            <p className="text-muted-foreground text-sm truncate" title={episode.description.heading}>
              {episode.description.heading}
            </p>
          )}
        </div>

        <div className="col-span-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>{getDuration()}</span>
          </div>
        </div>

        <div className="col-span-2">
          <div className="flex items-center gap-2">
            {hasThumbnail && (
              <Badge variant="outline" className="text-xs">
                <Image className="h-3 w-3" />
              </Badge>
            )}
            <Badge variant={hasVideo ? "default" : "secondary"} className="text-xs">
              {hasVideo ? "Ready" : "Draft"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          onClick={handleViewDetails}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>

        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleViewDetails}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Episode
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                router.push(`/media/movies/play/${episode.id}?${new URLSearchParams({ isEpisode: "true" }).toString()}`);
              }}
              disabled={!hasVideo}
            >
              <Play className="h-4 w-4 mr-2" />
              Play Episode
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Episode
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyEpisodesState({ seriesId, seasonId }: { seriesId: string, seasonId: string }) {
  const router = useRouter();

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">No Episodes Yet</h3>
            <p className="text-muted-foreground mt-2">
              This season is empty. Start by creating your first episode to organize your content.
            </p>
          </div>
          <Button
            onClick={() => router.push(`/media/studio/series/${seriesId}/seasons/${seasonId}/episodes/create`)}
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Episode
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EpisodesPage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params.seriesId as string;
  const seasonId = params.seasonId as string;
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const onGetEpisodes = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await getEpisodesBySeasonId(user, seriesId, seasonId);
      setEpisodes(items || []);
    } catch (error) {
      showToast("Error", "Failed to load episodes", "error");
      setEpisodes([]);
    } finally {
      setIsLoading(false);
    }
  }, [seriesId, seasonId, user]);

  const handleCreateEpisode =useCallback( () => {
    router.push(`/media/studio/series/${seriesId}/seasons/${seasonId}/episodes/create`);
  },[seriesId,seasonId])

  const handleBackToSeasons =useCallback( () => {
    router.back();
  },[seriesId])
  const filteredEpisodes = episodes.filter(episode =>
    episode.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    episode.description?.heading?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    episode.description?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  useEffect(() => {
    onGetEpisodes();
  }, [onGetEpisodes]);

  const episodesWithVideo = episodes.filter(ep => true).length; 
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToSeasons}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Episodes</h1>
            <p className="text-muted-foreground">
              Manage and organize your season episodes
            </p>
          </div>
        </div>

        <Button onClick={handleCreateEpisode} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Episode
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{episodes.length}</p>
                <p className="text-sm text-muted-foreground">Total Episodes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{episodesWithVideo}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{episodes.length - episodesWithVideo}</p>
                <p className="text-sm text-muted-foreground">Draft</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search episodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuItem>All Episodes</DropdownMenuItem>
              <DropdownMenuItem>Published</DropdownMenuItem>
              <DropdownMenuItem>Draft</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuItem>Episode Number</DropdownMenuItem>
              <DropdownMenuItem>Name</DropdownMenuItem>
              <DropdownMenuItem>Date Created</DropdownMenuItem>
              <DropdownMenuItem>Duration</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* View Toggle */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
          <TabsList>
            <TabsTrigger value="grid">
              <Grid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Episodes List */}
      <div className="space-y-4">
        {filteredEpisodes.length === 0 ? (
          <EmptyEpisodesState seriesId={seriesId} seasonId={seasonId} />
        ) : (
          <>
            {/* Header Bar */}
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-muted-foreground">
                {filteredEpisodes.length} item{filteredEpisodes.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
              
              
            </div>

            {/* Episodes Content */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEpisodes.map((episode) => (
                  <EpisodeGridCard 
                    key={episode.id} 
                    episode={episode} 
                    seriesId={seriesId}
                    seasonId={seasonId}
                  />
                ))}
              </div>
            ) : (
              <Card>
                {/* List Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                  <div className="col-span-1">Thumbnail</div>
                  <div className="col-span-3">Name</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Duration</div>
                  <div className="col-span-2">Status</div>
                </div>
                
                {/* List Items */}
                <div className="divide-y">
                  {filteredEpisodes.map((episode) => (
                    <EpisodeListRow 
                      key={episode.id} 
                      episode={episode} 
                      seriesId={seriesId}
                      seasonId={seasonId}
                    />
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Quick Actions */}
      {episodes.length > 0 && (
        <div className="flex items-center justify-between pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            {episodesWithVideo === episodes.length 
              ? "All episodes are ready to publish!" 
              : `${episodes.length - episodesWithVideo} episode${episodes.length - episodesWithVideo !== 1 ? 's' : ''} need attention`
            }
           
          </p>
          
        </div>
      )}
    </div>
  );
}