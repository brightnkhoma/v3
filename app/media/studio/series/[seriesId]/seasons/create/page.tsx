// app/zathu/play/series/[seriesId]/seasons/create/page.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  FileText,
  Plus,
  Minus
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
import { Switch } from "@/components/ui/switch"; // Added Switch import
import { showToast as toast } from "@/app/lib/dataSource/toast";
import { Season, Series } from "@/app/lib/types";
import { RootState, useAppSelector } from "@/app/lib/local/redux/store";
import { createSeason, getUserSeasonById, uploadFile } from "@/app/lib/dataSource/contentDataSource";
import { ContentType } from "@/app/lib/types";
import { UploadTask } from "firebase/storage";

 const showToast = (x : string, y : string, z : any = "default")=>{
    toast(x,{description : y, type : z})
  }

const seasonFormSchema = z.object({
  seasonNumber: z.coerce.number().min(1, "Season number is required"),
  seasonName: z.string().min(1, "Season name is required").max(100),
  description: z.object({
    heading: z.string().min(1, "Heading is required").max(100),
    content: z.string().min(1, "Description content is required").max(1000),
  }),
  thumbnail: z.string().optional(),
  isPublished: z.boolean().default(false), // Added isPublished field
});

type SeasonFormValues = z.infer<typeof seasonFormSchema>;

// Thumbnail Upload Component (same as series page)
function ThumbnailUpload({ 
  onThumbnailUploaded,
  currentThumbnail 
}: { 
  onThumbnailUploaded: (url: string) => void;
  currentThumbnail?: string;
}) {
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAppSelector((state: RootState) => state.auth);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast("Invalid file type", "Please select an image file", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File too large", "Please select an image smaller than 10MB", "error");
      return;
    }

    startUpload(file);
  };

  const startUpload = async (file: File) => {
    const contentId = `season_thumbnail_${Date.now()}`;
    
    try {
      await uploadFile(
        file,
        (progress) => {
          setUploadProgress(progress);
        },
        (isPaused) => {
          // Handle pause state if needed
        },
        (isRunning) => {
          // Handle running state if needed
        },
        (isCanceled) => {
          // Handle cancel state if needed
        },
        (task) => {
          setUploadTask(task);
        },
        (downloadUri) => {
          if (downloadUri) {
            onThumbnailUploaded(downloadUri);
            showToast("Thumbnail uploaded successfully", "Your season thumbnail has been uploaded");
          } else {
            showToast("Upload failed", "Failed to upload thumbnail", "error");
          }
          setUploadTask(null);
          setUploadProgress(0);
        },
        contentId,
        file.name.split('.').pop() || 'jpg',
        ContentType.SERIES
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
      showToast("Upload cancelled", "Thumbnail upload was cancelled");
    }
  };

  const removeThumbnail = () => {
    onThumbnailUploaded("");
    showToast("Thumbnail removed", "Season thumbnail has been removed");
  };

  return (
    <div className="space-y-4">
      {!uploadTask && !currentThumbnail && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragOver 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Upload Thumbnail</p>
          <p className="text-xs text-muted-foreground">
            Drag and drop an image or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports JPG, PNG, WEBP • Max 10MB
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {uploadTask && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                thumbnail.jpg
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelUpload}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          
          <Progress value={uploadProgress} className="h-2" />
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
        </div>
      )}

      {currentThumbnail && !uploadTask && (
        <div className="space-y-3">
          <div className="aspect-video rounded-lg border bg-muted overflow-hidden">
            <img
              src={currentThumbnail}
              alt="Season thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={removeThumbnail}
            className="w-full"
          >
            <Minus className="h-4 w-4 mr-2" />
            Remove Thumbnail
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CreateSeasonPage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params.seriesId as string;
  const seasonId = useSearchParams().get("seasonId")
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [season, setSeason] = useState<Season | null>(null)

  const formMethods = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonFormSchema) as any,
    defaultValues: {
      seasonNumber: 1,
      seasonName: "",
      description: {
        heading: "",
        content: "",
      },
      thumbnail: "",
      isPublished: false, // Added default value
    },
  });

  const handleThumbnailUploaded = (url: string) => {
    formMethods.setValue("thumbnail", url, { shouldValidate: true });
  };

  const handleGetSeasonById = useCallback(async()=>{
    if(!seasonId) return;
    const item = await getUserSeasonById(user, seasonId)
    setSeason(item)
    if(item){
      const {description,seasonName,seasonNumber,thumbNail, isPublished} = item
      formMethods.setValue("thumbnail",thumbNail)
      formMethods.setValue("description",description)
      formMethods.setValue("description.content",description.content)
      formMethods.setValue("description.heading",description.heading)
      formMethods.setValue("seasonName",seasonName)
      formMethods.setValue("seasonNumber",seasonNumber)
      formMethods.setValue("isPublished", isPublished || false) // Added isPublished
    }
  },[seasonId])

  const onSubmit = async (data: SeasonFormValues) => {
    setIsSubmitting(true);
    try {
      let seasonData: Season 
      if(season){
        const {description,numberOfEpisodes,seasonName,seasonNumber,thumbNail, isPublished} = season
       seasonData = {
          ...season,
          seasonNumber: data.seasonNumber || seasonNumber,
          seasonName: data.seasonName || seasonName,
          description: data.description || description,
          numberOfEpisodes:  numberOfEpisodes || 0,
          seriesId: seriesId ,
          thumbNail : data.thumbnail || thumbNail,
          isPublished: data.isPublished // Added isPublished
      };
      }else{
      seasonData  = {
          seasonNumber: data.seasonNumber,
          seasonId: ``,
          seasonName: data.seasonName,
          description: data.description,
          numberOfEpisodes: 0,
          seriesId: seriesId,
          thumbNail : data.thumbnail,
          isPublished : data.isPublished // Added isPublished
      };
      }

      const check = await createSeason(user, seasonData);
      if (!check) {
        throw new Error("Season not created");
      }

      showToast(
        `Season ${data.isPublished ? 'published' : 'saved'} successfully!`, 
        `${data.seasonName} has been ${data.isPublished ? 'published and is now visible to users' : 'saved as draft'}.`
      );

      router.push(`/media/studio/series/${seriesId}`);
    } catch (error) {
      showToast("Error creating season", "Please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(()=>{
    handleGetSeasonById()
  },[seasonId])

  const watchedThumbnail = formMethods.watch("thumbnail");
  const watchedIsPublished = formMethods.watch("isPublished");

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {season ? 'Edit Season' : 'Add New Season'}
          </h1>
          <p className="text-muted-foreground">
            {season ? 'Edit' : 'Create'} a new season for your series
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
                    Season Information
                  </CardTitle>
                  <CardDescription>
                    Enter the basic details about this season
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={formMethods.control}
                      name="seasonNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Season Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="1" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The numerical order of this season
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formMethods.control}
                      name="seasonName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Season Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., The Beginning, Final Season" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for this season
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                        <FormLabel>Season Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe this season's storyline, themes, or key events..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide an overview of what viewers can expect from this season.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Episode Planning Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Episode Planning</CardTitle>
                  <CardDescription>
                    You can add episodes after creating this season
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/20">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ready to add episodes?</p>
                      <p className="text-sm text-muted-foreground">
                        After creating this season, you'll be able to add individual episodes with videos, descriptions, and more.
                      </p>
                    </div>
                    <Badge variant="secondary" className="whitespace-nowrap">
                      Next Step
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Thumbnail Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Season Thumbnail
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={formMethods.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Season Thumbnail</FormLabel>
                        <FormControl>
                          <ThumbnailUpload
                            onThumbnailUploaded={handleThumbnailUploaded}
                            currentThumbnail={watchedThumbnail}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload a thumbnail image for this season
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Publish Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Publish Status</CardTitle>
                  <CardDescription>
                    Control the visibility of this season
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={formMethods.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Publish Season
                          </FormLabel>
                          <FormDescription>
                            {field.value 
                              ? "This season is visible to users" 
                              : "This season is hidden from users"
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
                  {watchedIsPublished && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800 font-medium">
                        Ready to publish
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        This season will be visible to users once you save changes.
                      </p>
                    </div>
                  )}
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
                    onClick={() => router.push(`/media/studio/series/${seriesId}`)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Series
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      formMethods.reset();
                      setSeason(null)
                    }}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Reset Form
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
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                variant={watchedIsPublished ? "default" : "outline"}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {season ? "Editing" : "Creating"} Season...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {season ? "Edit" : "Create"} Season
                    {watchedIsPublished ? " & Publish" : " as Draft"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}