import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Calendar, Users, Star, Heart, Share, Clock, ChevronRight, Eye } from "lucide-react";

import { Series, Season, Episode } from "@/app/lib/types";
import { showToast } from "@/app/lib/dataSource/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSeriesById, getSeriesSeasonById, getSeriesSeasonEpisodesById, getUserSeasonsById, getUserSeriesById } from "../lib/dataSource/contentDataSource";
import { firestoreTimestampToDate } from "../lib/config/timestamp";


interface SeasonCardProps {
  season: Season;
  isSelected: boolean;
  onSelect: (season: Season) => void;
}

function SeasonCard({ season, isSelected, onSelect }: SeasonCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-2 hover:border-primary/20'
      }`}
      onClick={() => onSelect(season)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg">Season {season.seasonNumber}</h3>
              {!season.isPublished && (
                <Badge variant="secondary" className="text-xs">
                  Coming Soon
                </Badge>
              )}
            </div>
            <h4 className="font-semibold text-muted-foreground mb-2">{season.seasonName}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {season.description.content}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{season.numberOfEpisodes} episodes</span>
              </div>
              <Badge variant={season.isPublished ? "default" : "secondary"} className="text-xs">
                {season.isPublished ? "Available" : "Unpublished"}
              </Badge>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${
            isSelected ? 'rotate-90' : ''
          }`} />
        </div>
      </CardContent>
    </Card>
  );
}

// Episode Card Component
interface EpisodeCardProps {
  episode: Episode;
  onWatch: (episode: Episode) => void;
}

function EpisodeCard({ episode, onWatch }: EpisodeCardProps) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Episode Thumbnail */}
          <div 
            className="relative flex-shrink-0 w-24 h-16 bg-muted rounded-md overflow-hidden cursor-pointer"
            onClick={() => onWatch(episode)}
          >
            <img src={episode.content.content.thumbnail || episode.content.folderPoster} className="inset-0 size-full"/>
            <div className="absolute top-0 w-full h-full bg-gradient-to-br from-gray-300/0 to-gray-400/0 flex items-center justify-center group-hover:opacity-80 transition-opacity">
              <Play className="h-6 w-6 text-white/80" fill="white" />
            </div>
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
              24m
            </div>
          </div>

          {/* Episode Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                {episode.name}
              </h4>
              {!episode.isPublished && (
                <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                  Soon
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {episode.description.content}
            </p>
            
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                Episode {episode.episodeNumber}
              </Badge>
              
              <Button
                size="sm"
                variant={episode.isPublished ? "default" : "outline"}
                disabled={!episode.isPublished}
                onClick={() => onWatch(episode)}
                className="h-7 text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                Watch
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



export function SeriesDisplay() {
  const router = useRouter();
  const [series, setSeries] = useState<Series | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const {seriesId} = useParams() as any

  const onGetSeriesById = useCallback(async()=>{
    const item = await getSeriesById(seriesId)
    setSeries(item)
  },[seriesId])

  const onGetSeriesSeasonById = useCallback(async()=>{
    const items = await getSeriesSeasonById(seriesId)
    setSeasons(items)
       if (items.length > 0) {
        const firstPublishedSeason = items.find(s => s.isPublished) || items[0];
        setSelectedSeason(firstPublishedSeason);

      }
  },[series])
  const onGetSeriesSeasonEpisodesById = useCallback(async()=>{
    if(!selectedSeason) return;
    const items = await getSeriesSeasonEpisodesById(selectedSeason.seasonId)
    setEpisodes(items)
  },[seasons,selectedSeason])

  



  const loadSeriesData = useCallback(async () => {
    try {
      setLoading(true);
       await onGetSeriesById()


   
    } catch (error) {
      console.error("Error loading series:", error);
      showToast("Failed to load series");
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  useEffect(() => {
    loadSeriesData();
  }, [loadSeriesData]);

  useEffect(()=>{
    onGetSeriesSeasonById()
  },[series])
  useEffect(()=>{
    onGetSeriesSeasonEpisodesById()
  },[series,seasons,selectedSeason])

  const handleSeasonSelect = async (season: Season) => {
    setSelectedSeason(season);
  };

  const handleWatchEpisode = (episode: Episode) => {
    if (!episode.isPublished) {
      showToast("This episode is not available yet");
      return;
    }
    router.push(`/media/movies/play/${episode.id}/?${new URLSearchParams({isEpisode : "true"})}`);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    showToast(isLiked ? "Removed from favorites" : "Added to favorites");
  };

  const handleShare = () => {
    // Implement share functionality
    showToast("Share link copied to clipboard");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Series not found</h1>
        <Button onClick={() => router.push("/media/series")}>
          Back to Series
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/series")}
            className="mb-4"
          >
            ← Back to Series
          </Button>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Series Poster */}
            <div className="flex-shrink-0 w-full lg:w-80">
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-600">
                {/* Replace with actual image */}
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <img src={series.thumbnail} className="size-full"/>
                    {/* <Eye className="h-12 w-12 mx-auto mb-2 opacity-60" />
                    <span className="text-sm opacity-60">Series Poster</span> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Series Info */}
            <div className="flex-1">
              <div className="mb-4">
                <h1 className="text-4xl font-bold mb-2">{series.name}</h1>
                <p className="text-xl text-muted-foreground mb-4">
                  {series.description.heading}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {series.uploadDate && <span>{new Date(series.uploadDate as any).getFullYear()}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{series.actors.slice(0, 3).join(", ")}</span>
                  </div>
                  <Badge variant="secondary">
                    {series.numberOfSeasons} Seasons
                  </Badge>
                  {series.isTranslated && (
                    <Badge variant="outline">Multi-language</Badge>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {series.description.content}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleLike} variant={isLiked ? "default" : "outline"}>
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {isLiked ? "Liked" : "Like"}
                </Button>
                <Button onClick={handleShare} variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Cast */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Cast</h3>
                <div className="flex flex-wrap gap-2">
                  {series.actors.map((actor, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {actor}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seasons and Episodes */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Seasons & Episodes</h2>
          
          {/* Season Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seasons.map((season) => (
              <SeasonCard
                key={season.seasonId}
                season={season}
                isSelected={selectedSeason?.seasonId === season.seasonId}
                onSelect={handleSeasonSelect}
              />
            ))}
          </div>

          {/* Episodes Grid */}
          {selectedSeason && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {selectedSeason.seasonName} • {episodes.length} Episodes
                </h3>
                <div className="text-sm text-muted-foreground">
                  {episodes.filter(e => e.isPublished).length} available
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {episodes.map((episode) => (
                  <EpisodeCard
                    key={episode.id}
                    episode={episode}
                    onWatch={handleWatchEpisode}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}