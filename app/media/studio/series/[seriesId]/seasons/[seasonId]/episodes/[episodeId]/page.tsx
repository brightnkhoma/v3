// app/zathu/play/series/[seriesId]/seasons/[seasonId]/episodes/[episodeId]/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Play,
  Edit,
  Download,
  Video,
  Clock,
  Calendar,
  Eye,
  Share2,
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showToast as toast } from "@/app/lib/dataSource/toast";
import { ContentFile, Episode, Season, Series } from "@/app/lib/types";
import { RootState, useAppSelector } from "@/app/lib/local/redux/store";
import { getEpisodeById, getFileContent, getUserSeasonById, getUserSeriesById } from "@/app/lib/dataSource/contentDataSource";

const showToast = (x: string, y: string, z: any = "default") => {
  toast(x, { description: y, type: z });
}

export default function EpisodeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params.seriesId as string;
  const seasonId = params.seasonId as string;
  const episodeId = params.episodeId as string;
  const { user } = useAppSelector((state: RootState) => state.auth);
  
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [fileContent, setFileContent] = useState<ContentFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const onGetEpisode = useCallback(async () => {
    try {
      setIsLoading(true);
      const episodeData = await getEpisodeById(episodeId,user);
      setEpisode(episodeData || null);
    } catch (error) {
      showToast("Error", "Failed to load episode details", "error");
      setEpisode(null);
    } finally {
      setIsLoading(false);
    }
  }, [episodeId]);

  const onGetFileContent = useCallback(async () => {
    if (!episode?.content) return;
    try {
      const item = await getFileContent(episode.content, user);
      setFileContent(item);
    } catch (error) {
      console.error("Failed to load file content:", error);
      setFileContent(null);
    }
  }, [episode, user]);

  const onGetSeriesById = useCallback(async () => {
    if (!episode?.seriesId) return;
    try {
      const item = await getUserSeriesById(user, episode.seriesId);
      setSeries(item);
    } catch (error) {
      console.error("Failed to load series:", error);
      setSeries(null);
    }
  }, [episode, user]);

  const onGetSeasonById = useCallback(async () => {
    if (!episode?.seasonId) return;
    try {
      const item = await getUserSeasonById(user, episode.seasonId);
      setSeason(item);
    } catch (error) {
      console.error("Failed to load season:", error);
      setSeason(null);
    }
  }, [episode, user]);

  const handleBackToEpisodes = () => {
    router.push(`/media/studio/series/${seriesId}/seasons/${seasonId}/episodes`);
  };

  const handleEditEpisode = () => {
    router.push(`/media/studio/series/${seriesId}/seasons/${seasonId}/episodes/create/?${new URLSearchParams({episodeId : episode?.id || ""})}`);
  };

  const handlePlayEpisode = () => {
    router.push(`/media/movies/play/${episodeId}`);
  };

  const handleDownload = () => {
    if (fileContent?.uri) {
      // Create a temporary link for download
      const link = document.createElement('a');
      link.href = fileContent.uri;
      link.download = `${episode?.name || 'episode'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Download started", "Episode download has been initiated");
    } else {
      showToast("Error", "No video available for download", "error");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: episode?.name || 'Episode',
        text: episode?.description?.heading || 'Check out this episode',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied", "Episode link copied to clipboard");
    }
  };

  // Load episode data on mount
  useEffect(() => {
    onGetEpisode();
  }, [onGetEpisode]);

  // Load additional data when episode is available
  useEffect(() => {
    if (episode) {
      onGetFileContent();
      onGetSeriesById();
      onGetSeasonById();
    }
  }, [episode, onGetFileContent, onGetSeriesById, onGetSeasonById]);

  const hasVideo = fileContent?.uri;
  const duration = fileContent ? (`${Math.floor(Number(fileContent.duration)/60) }:${(Number(fileContent.duration)%60).toFixed(0)}`) : "Unknown";
  const fileSize = fileContent?.size ? `${(fileContent.size / (1024 * 1024)).toFixed(1)} MB` : "Unknown";

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-96 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToEpisodes}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Episode Not Found</h1>
            <p className="text-muted-foreground">
              The episode you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Episode Not Available</h3>
                <p className="text-muted-foreground mt-1">
                  This episode may have been deleted or you don't have permission to view it.
                </p>
              </div>
              <Button onClick={handleBackToEpisodes} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Episodes
              </Button>
            </div>
          </CardContent>
        </Card>
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
            onClick={handleBackToEpisodes}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" className="text-base font-semibold">
                Episode {episode.episodeNumber || 1}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight">{episode.name}</h1>
            </div>
            <p className="text-muted-foreground">
              {series?.name && season?.seasonName 
                ? `${series.name} • ${season.seasonName}`
                : "Episode details and information"
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleEditEpisode}
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {hasVideo && (
            <Button onClick={handlePlayEpisode}>
              <Play className="h-4 w-4 mr-2" />
              Play Episode
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Episode Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasVideo ? (
                <div className="aspect-video rounded-lg border bg-black flex items-center justify-center">
                  <video 
                    src={fileContent!.uri}
                    className="w-full h-full max-h-96 object-contain rounded"
                    controls
                    poster={episode.content?.folderPoster}
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg border bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">No Video Available</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Upload a video to preview this episode
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={handlePlayEpisode}
                  disabled={!hasVideo}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play Episode
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={!hasVideo}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Episode Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {episode.description?.heading && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">{episode.description.heading}</h3>
                  <div className="w-16 h-1 bg-primary rounded-full mb-4" />
                </div>
              )}
              
              {episode.description?.content ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {episode.description.content}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No description available for this episode.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Content Details Card */}
          {episode.content && (
            <Card>
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Content Type:</span>
                    <p className="font-medium">{episode.content.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Folder:</span>
                    <p className="font-medium">{episode.content.folderName}</p>
                  </div>
                  {episode.content.actorName && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Actors:</span>
                      <p className="font-medium">{episode.content.actorName}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Episode Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Episode Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Episode Number:</span>
                  <Badge variant="secondary">{episode.episodeNumber || 1}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-muted-foreground" />
                    <span className="font-medium">{duration}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">File Size:</span>
                  <span className="font-medium">{fileSize}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Video Status:</span>
                  <Badge variant={hasVideo ? "default" : "secondary"}>
                    {hasVideo ? "Available" : "Not Uploaded"}
                  </Badge>
                </div>
                
                {series && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Series:</span>
                    <Badge variant="outline">{series.name}</Badge>
                  </div>
                )}
                
                {season && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Season:</span>
                    <Badge variant="outline">{season.seasonName}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleEditEpisode}
                variant="outline"
                className="w-full justify-start"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Episode
              </Button>
              
              <Button
                onClick={handlePlayEpisode}
                disabled={!hasVideo}
                variant="outline"
                className="w-full justify-start"
              >
                <Play className="h-4 w-4 mr-2" />
                Play Episode
              </Button>
              
              <Button
                onClick={handleBackToEpisodes}
                variant="outline"
                className="w-full justify-start"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Episodes
              </Button>
            </CardContent>
          </Card>

          
        </div>
      </div>
    </div>
  );
}