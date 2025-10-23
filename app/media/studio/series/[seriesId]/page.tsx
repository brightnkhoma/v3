// app/zathu/play/series/[seriesId]/seasons/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  MoreVertical, 
  Play,
  Folder,
  Video,
  Edit,
  Trash2,
  Image as ImageIcon,
  Edit2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { showToast as toast } from "@/app/lib/dataSource/toast";
import { Season } from "@/app/lib/types";
import { RootState, useAppSelector } from "@/app/lib/local/redux/store";
import { getUserSeasonsById } from "@/app/lib/dataSource/contentDataSource";

const showToast = (x: string, y: string, z: any = "default") => {
  toast(x, { description: y, type: z });
}

function SeasonCard({ season, seriesId }: { season: Season, seriesId: string }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAddEpisode = () => {
    router.push(`/media/studio/series/${seriesId}/seasons/${season.seasonId}/episodes/create`);
  };

  const handleViewEpisodes = () => {
    router.push(`/media/studio/series/${seriesId}/seasons/${season.seasonId}/episodes`);
  };

  const handleEditSeason = () => {
    router.push(`/media/studio/series/${seriesId}/seasons/create/?${new URLSearchParams({seasonId : season.seasonId})}`);
  };

  const handleDeleteSeason = async () => {
    try {
      showToast("Season deleted", `Season ${season.seasonName} has been deleted`, "success");
    } catch (error) {
      showToast("Error", "Failed to delete season", "error");
    }
  };

  const hasThumbnail = season.thumbNail && season.thumbNail.length > 0;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            {hasThumbnail ? (
              <div className="w-32 h-20 rounded-md overflow-hidden bg-muted">
                <img
                  src={season.thumbNail}
                  alt={`${season.seasonName} thumbnail`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-20 rounded-md bg-muted flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="font-semibold">
                    S{season.seasonNumber}
                  </Badge>
                  <h3 className="text-lg font-semibold truncate">
                    {season.seasonName}
                  </h3>
                </div>
                
                {season.description?.heading && (
                  <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                    {season.description.heading}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  onClick={handleAddEpisode}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Episode
                </Button>

                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleViewEpisodes}>
                      <Folder className="h-4 w-4 mr-2" />
                      View Episodes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEditSeason}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Season
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleDeleteSeason}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Season
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Video size={16} />
                  <span>{season.numberOfEpisodes || 0} episodes</span>
                </div>
                
                {season.description?.content && (
                  <span className="line-clamp-1 hidden sm:block">
                    {season.description.content}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewEpisodes}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptySeasonsState({ seriesId }: { seriesId: string }) {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No Seasons Yet</h3>
            <p className="text-muted-foreground mt-1">
              Get started by creating the first season for your series.
            </p>
          </div>
          <Button
            onClick={() => router.push(`/media/studio/series/${seriesId}/seasons/create`)}
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Season
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SeasonsPage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params.seriesId as string;
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const onGetSeasons = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await getUserSeasonsById(user, seriesId);
      setSeasons(items || []);
    } catch (error) {
      showToast("Error", "Failed to load seasons", "error");
      setSeasons([]);
    } finally {
      setIsLoading(false);
    }
  }, [seriesId, user]);

  const handleCreateSeason = () => {
    router.push(`/media/studio/series/${seriesId}/seasons/create`);
  };

  const handleEditSeries = ()=>{
        router.push(`/media/studio/series/create/?${new URLSearchParams({seriesId : seriesId})}`);

  }

  const handleBackToSeries = () => {
    router.push(`/media/studio/series/${seriesId}`);
  };

  useEffect(() => {
    onGetSeasons();
  }, [onGetSeasons]);

  const totalEpisodes = seasons.reduce((total, season) => total + (season.numberOfEpisodes || 0), 0);
  const emptySeasons = seasons.filter(s => (s.numberOfEpisodes || 0) === 0).length;

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
            onClick={handleBackToSeries}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seasons</h1>
            <p className="text-muted-foreground">
              Manage seasons and episodes for your series
            </p>
          </div>
        </div>

        <Button onClick={handleCreateSeason}>
          <Plus className="h-4 w-4 mr-2" />
          Add Season
        </Button>
        <Button onClick={handleEditSeries}>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Series
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{seasons.length}</p>
                <p className="text-sm text-muted-foreground">Total Seasons</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Play className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEpisodes}</p>
                <p className="text-sm text-muted-foreground">Total Episodes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Folder className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emptySeasons}</p>
                <p className="text-sm text-muted-foreground">Empty Seasons</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seasons List */}
      <div className="space-y-4">
        {seasons.length === 0 ? (
          <EmptySeasonsState seriesId={seriesId} />
        ) : (
          <>
            {/* Header Bar */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {seasons.length} season{seasons.length !== 1 ? 's' : ''}
              </p>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {totalEpisodes} total episodes
                </Badge>
              </div>
            </div>

            {/* Seasons List */}
            <div className="space-y-4">
              {seasons.map((season) => (
                <SeasonCard 
                  key={season.seasonId} 
                  season={season} 
                  seriesId={seriesId}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      {seasons.length > 0 && (
        <div className="flex items-center justify-between pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Ready to organize your content? Start adding episodes to your seasons.
          </p>
          <Button variant="outline" onClick={handleCreateSeason}>
            <Plus className="h-4 w-4 mr-2" />
            Add Another Season
          </Button>
        </div>
      )}
    </div>
  );
}