// app/zathu/play/series/[seriesId]/seasons/[seasonId]/episodes/create/page.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  ArrowLeft, 
  Upload, 
  Video as VideoIcon,
  FileText,
  Plus,
  Clock,
  Eye,
  Globe
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { showToast as toast } from "@/app/lib/dataSource/toast";
import { ContentFile, Episode, LicenseType, Movie, Season, Series, VideoFolderItem } from "@/app/lib/types";
import { RootState, useAppSelector } from "@/app/lib/local/redux/store";
import { createEpisode, getEpisodeById, getFileContent, getUserSeasonById, getUserSeriesById, onGenerateFile, uploadFile } from "@/app/lib/dataSource/contentDataSource";
import { ContentType } from "@/app/lib/types";
import { UploadTask } from "firebase/storage";

const showToast = (x: string, y: string, z: any = "default") => {
  toast(x, { description: y, type: z });
}

const episodeFormSchema = z.object({
  name: z.string().min(1, "Episode name is required").max(100),
  episodeNumber: z.coerce.number().min(1, "Episode number is required"),
  description: z.object({
    heading: z.string().min(1, "Heading is required").max(100),
    content: z.string().min(1, "Description content is required").max(1000),
  }),
  duration: z.string().min(1, "Duration is required"),
  videoUrl: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type EpisodeFormValues = z.infer<typeof episodeFormSchema>;

// Video Upload Component
function VideoUpload({ 
  onVideoUploaded,
  currentVideoUrl 
}: { 
  onVideoUploaded: (url: string, contentFile: ContentFile | undefined) => void;
  currentVideoUrl?: string;
}) {
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAppSelector((state: RootState) => state.auth);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      showToast("Invalid file type", "Please select a video file", "error");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      showToast("File too large", "Please select a video smaller than 500MB", "error");
      return;
    }

    startUpload(file);
  };

  const startUpload = async (file: File) => {
    const contentId = `episode_${Date.now()}`;
    
    try {
      await uploadFile(
        file,
        (progress) => {
          setUploadProgress(progress);
        },
        (isPaused) => {
        },
        (isRunning) => {
        },
        (isCanceled) => {
        },
        (task) => {
          setUploadTask(task);
        },
        async (downloadUri) => {
          if (downloadUri) {
            const contentFile = await onGenerateFile(downloadUri, file, user.userId, ContentType.MOVIE);
            onVideoUploaded(downloadUri, contentFile);
            showToast("Video uploaded successfully", "Your episode video has been uploaded");
          } else {
            showToast("Upload failed", "Failed to upload video", "error");
          }
          setUploadTask(null);
          setUploadProgress(0);
        },
        contentId,
        file.name.split('.').pop() || 'mp4',
        ContentType.VIDEO
      );
    } catch (error) {
      showToast("Upload error", "An error occurred during upload", "error");
      setUploadTask(null);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const cancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setUploadTask(null);
      setUploadProgress(0);
      showToast("Upload cancelled", "Video upload was cancelled");
    }
  };

  const removeVideo = () => {
    onVideoUploaded("", undefined);
    showToast("Video removed", "Episode video has been removed");
  };

  return (
    <div className="space-y-4">
      {!uploadTask && !currentVideoUrl && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragOver 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <VideoIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Upload Episode Video</p>
          <p className="text-muted-foreground mb-1">
            Drag and drop a video file or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supports MP4, MOV, AVI • Max 500MB
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {uploadTask && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <VideoIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                episode_video.mp4
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelUpload}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
          
          <Progress value={uploadProgress} className="h-2" />
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Uploading video...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
        </div>
      )}

      {currentVideoUrl && !uploadTask && (
        <div className="space-y-3">
          <div className="aspect-video rounded-lg border bg-black flex items-center justify-center">
            <video 
              src={currentVideoUrl}
              className="max-h-64 rounded"
              controls
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={removeVideo}
              className="flex-1"
            >
              Remove Video
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              Replace Video
            </Button>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

export default function CreateEpisodePage() {
  const router = useRouter();
  const params = useParams();
  const episodeId = useSearchParams().get("episodeId")
  const seriesId = params.seriesId as string;
  const seasonId = params.seasonId as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentFile, setContentFile] = useState<ContentFile>();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [season, setSeason] = useState<Season | null>(null)

  const formMethods = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeFormSchema) as any,
    defaultValues: {
      name: "",
      episodeNumber: 1,
      description: {
        heading: "",
        content: "",
      },
      duration: "",
      videoUrl: "",
      isPublished: false,
    },
  });

  const onGetUserSeriesById = useCallback(async()=>{
    const item = await getUserSeasonById(user, seasonId)
    setSeason(item)
    if(item){
              formMethods.setValue("episodeNumber",(item.numberOfEpisodes || 0) + 1)

    }
  },[seriesId])

  const onGetEpisode = useCallback(async()=>{
    if(episodeId){
      const item = await getEpisodeById(episodeId,user)
      setEpisode(item)
      if(item){
        formMethods.setValue("description", item.description)
        formMethods.setValue("name", item.name || "")
        formMethods.setValue("description.content", item.description.content || "")
        formMethods.setValue("description.heading", item.description.heading || "")
        formMethods.setValue("episodeNumber", item.episodeNumber)
        formMethods.setValue("isPublished", item.isPublished || false)
        
        const fileContent = await getFileContent(item.content,user)
        setContentFile(fileContent || undefined)
        formMethods.setValue("videoUrl", fileContent?.uri)
      }
    }
  },[episodeId, formMethods, user])

  useEffect(()=>{
    onGetEpisode()
    onGetUserSeriesById()
  },[onGetEpisode])

  useEffect(() => {
    if (contentFile?.duration) {
      formMethods.setValue("duration", contentFile.duration, { shouldValidate: true });
    }
  }, [contentFile, formMethods]);

  const handleVideoUploaded = (url: string, _contentFile: ContentFile | undefined) => {
    formMethods.setValue("videoUrl", url, { shouldValidate: true });
    setContentFile(_contentFile);
  };

  const onSubmit = async (data: EpisodeFormValues) => {
    setIsSubmitting(true);
    try {
      if (!data.videoUrl || !contentFile) return;
   
      const content1: Movie = {
        contentId: "",
        ownerId: user.userId,
        title: contentFile.name,
        description: "",
        releaseDate: new Date(),
        genres: [],
        type: ContentType.SERIES,
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
        thumbnail: "",
        director: "",
        cast: [],
        duration: Number(contentFile.duration),
        rating: "",
        genre: "Soundtrack",
        views: 0
      };

      const content: VideoFolderItem = {
        actorName: "",
        featuredActors: [],
        name: data.name,
        content: content1,
        type: "Series",
        folderName: seasonId,
        folderId: seasonId,
        owner: user,
        folderPoster: "",
        isPoster: false,
        total: 0
      };

      const episodeData: Episode = {
        id: episode?.id || '',
        name: data.name,
        seasonId: seasonId,
        seriesId: seriesId,
        description: data.description,
        content: content,
        episodeNumber: data.episodeNumber,
        isPublished: data.isPublished
      };

      const check = await createEpisode(user, episodeData, contentFile);
      if (!check) {
        throw new Error("Episode not created");
      }

      showToast(
        "Episode created successfully!", 
        `${data.name} has been ${data.isPublished ? 'published' : 'saved as draft'}.`,
        "success"
      );
      router.push(`/media/studio/series/${seriesId}/seasons/${seasonId}/episodes`);
    } catch (error) {
      showToast("Error creating episode", "Please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedVideoUrl = formMethods.watch("videoUrl");
  const watchedDuration = formMethods.watch("duration");
  const isPublished = formMethods.watch("isPublished");

  const handleBackToEpisodes = () => {
    router.push(`/media/studio/series/${seriesId}/seasons/${seasonId}/episodes`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold tracking-tight">
            {episodeId ? "Edit Episode" : "Add New Episode"}
          </h1>
          <p className="text-muted-foreground">
            {episodeId ? "Update episode details" : "Create a new episode for this season"}
          </p>
        </div>
      </div>

      <Form {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Episode Information
                  </CardTitle>
                  <CardDescription>
                    Enter the basic details about this episode
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={formMethods.control}
                      name="episodeNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Episode Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="1" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The numerical order of this episode
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formMethods.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Duration
                            {contentFile?.duration && (
                              <Badge variant="outline" className="ml-2">
                                Auto-filled
                              </Badge>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 45:00, 1:30:00" 
                              value={`${Math.floor(Number(contentFile?.duration)/60)}:${Math.floor(Number(contentFile?.duration)%60)}`}
                              readOnly={!!contentFile?.duration}
                              className={contentFile?.duration ? "bg-muted" : ""}
                            />
                          </FormControl>
                          <FormDescription>
                            {contentFile?.duration 
                              ? "Duration automatically detected from video file"
                              : "Episode runtime (will be auto-filled after video upload)"
                            }
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={formMethods.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Episode Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter episode title" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A descriptive title for this episode
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formMethods.control}
                    name="description.heading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description Heading</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a catchy heading" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formMethods.control}
                    name="description.content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Episode Synopsis</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what happens in this episode..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed summary of the episode's plot and key events.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Video Upload Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <VideoIcon className="h-5 w-5" />
                    Episode Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={formMethods.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload Video</FormLabel>
                        <FormControl>
                          <VideoUpload
                            onVideoUploaded={handleVideoUploaded}
                            currentVideoUrl={watchedVideoUrl}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload the video file for this episode
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Publish Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Publish Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={formMethods.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Publish Episode
                          </FormLabel>
                          <FormDescription>
                            {isPublished 
                              ? "This episode will be visible to viewers"
                              : "This episode will be saved as draft and hidden from viewers"
                            }
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className={`p-3 rounded-lg border ${isPublished ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isPublished ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <span className={`text-sm font-medium ${isPublished ? 'text-green-800' : 'text-amber-800'}`}>
                        {isPublished ? 'Episode will be published' : 'Episode will be saved as draft'}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isPublished ? 'text-green-600' : 'text-amber-600'}`}>
                      {isPublished 
                        ? 'Viewers will be able to watch this episode immediately.'
                        : 'You can publish this episode later from the episodes list.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Video:</span>
                    <Badge variant={watchedVideoUrl ? "default" : "outline"}>
                      {watchedVideoUrl ? "Uploaded" : "Not Uploaded"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <Badge variant={watchedDuration ? "default" : "outline"}>
                      {watchedDuration || "Not Set"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">File Size:</span>
                    <span className="text-muted-foreground">
                      {contentFile?.size ? `${(contentFile.size / (1024 * 1024)).toFixed(1)} MB` : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={isPublished ? "default" : "secondary"}>
                      {isPublished ? "Published" : "Draft"}
                    </Badge>
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
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleBackToEpisodes}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Episodes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      formMethods.reset();
                      setContentFile(undefined);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Clear Form
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToEpisodes}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !watchedVideoUrl || !watchedDuration}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {episodeId ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {episodeId ? "Update Episode" : "Create Episode"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}