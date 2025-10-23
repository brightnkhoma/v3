"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  Users, 
  FileText,
  DollarSign,
  Shield,
  X,
  Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { showToast  as toast} from "@/app/lib/dataSource/toast";
import { Series } from "@/app/lib/types";
import { RootState, useAppSelector } from "@/app/lib/local/redux/store";
import { createNewSeriesFolder, getUserSeriesById, uploadFile } from "@/app/lib/dataSource/contentDataSource";
import { ContentType } from "@/app/lib/types";
import { UploadTask } from "firebase/storage";

enum LicenseType {
  STREAM_ONLY = "STREAM_ONLY",
  DOWNLOADABLE = "DOWNLOADABLE",
  PURCHASABLE = "PURCHASABLE",
  STANDARD = "STANDARD",
  CREATIVE_COMMONS = "CREATIVE_COMMONS",
  CUSTOM = "CUSTOM",
}

const seriesFormSchema = z.object({
  name: z.string().min(1, "Series name is required"),
  descriptionHeading: z.string().min(1, "Description heading is required"),
  descriptionContent: z.string().min(1, "Description content is required"),
  isTranslated: z.boolean().default(false),
  isPublished: z.boolean().default(false), // Added isPublished field
  actors: z.array(z.string()).min(1, "At least one actor is required"),
  thumbnail: z.string().optional(),
  licenseType: z.nativeEnum(LicenseType),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  basePrice: z.coerce.number().min(0, "Base price cannot be negative"),
});

type SeriesFormValues = z.infer<typeof seriesFormSchema>;

 const showToast = (x : string, y : string, z : any = "default")=>{
    toast(x,{description : y, type : z})
  }
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

    if (file.size > 15 * 1024 * 1024) {
      showToast("File too large", "Please select an image smaller than 15MB", "error");
      return;
    }

    startUpload(file);
  };

  const startUpload = async (file: File) => {
    const contentId = `thumbnail_${Date.now()}`;
    
    try {
      await uploadFile(
        file,
        (progress) => {
          setUploadProgress(progress);
        },
        () => {
        },
        () => {
        },
        () => {
        },
        (task) => {
          setUploadTask(task);
        },
        (downloadUri) => {
          if (downloadUri) {
            onThumbnailUploaded(downloadUri);
            showToast("Thumbnail uploaded successfully", "Your series thumbnail has been uploaded");
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
    showToast("Thumbnail removed", "Series thumbnail has been removed");
  };

  const getFileName = () => {
    if (!uploadTask) return "";
    return "thumbnail.jpg";
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
                {getFileName()}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelUpload}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
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
          <div className="aspect-video rounded-lg border bg-muted overflow-hidden relative group">
            <img
              src={currentThumbnail}
              alt="Series thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={removeThumbnail}
                className="bg-background/80 hover:bg-background"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Thumbnail uploaded successfully
          </p>
        </div>
      )}
    </div>
  );
}

function ActorsInput({ 
  actors, 
  onAddActor, 
  onRemoveActor,
  error 
}: { 
  actors: string[];
  onAddActor: (actor: string) => void;
  onRemoveActor: (actor: string) => void;
  error?: string;
}) {
  const [actorInput, setActorInput] = useState("");

  const handleAddActor = () => {
    if (actorInput.trim() && !actors.includes(actorInput.trim())) {
      onAddActor(actorInput.trim());
      setActorInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddActor();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="actor-input">Actors</Label>
        <div className="flex gap-2">
          <Input
            id="actor-input"
            placeholder="Add actor name"
            value={actorInput}
            onChange={(e) => setActorInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button type="button" onClick={handleAddActor} variant="outline">
            Add
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Press Enter or click Add to include actors
        </p>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[60px]">
        {actors.map((actor) => (
          <Badge key={actor} variant="secondary" className="px-3 py-1">
            {actor}
            <button
              type="button"
              onClick={() => onRemoveActor(actor)}
              className="ml-2 hover:text-destructive"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

export default function CreateSeriesPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const seriesId = useSearchParams().get("seriesId")
  const [series, setSeries] = useState<Series | null>(null)
  const formMethods = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesFormSchema) as any,
    defaultValues: {
      name: "",
      descriptionHeading: "",
      descriptionContent: "",
      isTranslated: false,
      isPublished: false, // Added default value
      actors: [],
      thumbnail: "",
      licenseType: LicenseType.STREAM_ONLY,
      price: 0,
      basePrice: 0,
    },
  });


  const onGetSeriesById = useCallback(async()=>{
    if(seriesId){
      const item = await getUserSeriesById(user, seriesId)
      setSeries(item)
      if(item){
        const {actors,description,isPublished,isTranslated,licence,name,pricing,thumbnail} = item
        formMethods.setValue("actors",actors)
        formMethods.setValue("basePrice",pricing.basePrice)
        formMethods.setValue("descriptionContent",description.content)
        formMethods.setValue("descriptionHeading",description.heading)
        formMethods.setValue("isPublished",isPublished || false)
        formMethods.setValue("isTranslated",isTranslated)
        formMethods.setValue("licenseType",licence)
        formMethods.setValue("price",pricing.price)
        formMethods.setValue("thumbnail",thumbnail)
        formMethods.setValue("name",name)
      }
    }
  },[seriesId])

  const addActor = (actor: string) => {
    const currentActors = formMethods.getValues("actors");
    formMethods.setValue("actors", [...currentActors, actor], { shouldValidate: true });
  };

  const removeActor = (actorToRemove: string) => {
    const currentActors = formMethods.getValues("actors");
    formMethods.setValue(
      "actors",
      currentActors.filter(actor => actor !== actorToRemove),
      { shouldValidate: true }
    );
  };

  const handleThumbnailUploaded = (url: string) => {
    formMethods.setValue("thumbnail", url, { shouldValidate: true });
  };

  const onSubmit = async (data: SeriesFormValues) => {
    setIsSubmitting(true);
    try {
      const seriesData: Series = {
        name: data.name,
        description: {
          heading: data.descriptionHeading,
          content: data.descriptionContent,
        },
        isTranslated: data.isTranslated,
        isPublished: data.isPublished, 
        actors: data.actors,
        thumbnail: data.thumbnail || "",
        licence: data.licenseType ,
        pricing: {
          price: data.price,
          basePrice: data.basePrice,
          currency: "MWK",
          isPublic: true
        },
        id: series?.id || "", 
        owner: user,
        uploadDate: series?.uploadDate || new Date() 
      };

      const check = await createNewSeriesFolder(user, seriesData);
      if (!check) {
        throw new Error("Series not created");
      }

      showToast(
        `Series ${data.isPublished ? 'published' : 'saved'} successfully!`, 
        `${data.name} has been ${data.isPublished ? 'published and is now visible to users' : 'saved as draft'}.`
      );

      router.push("/media/studio");
    } catch (error) {
      showToast("Error creating series", "Please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(()=>{
    onGetSeriesById()
  },[])

  const watchedActors = formMethods.watch("actors");
  const watchedThumbnail = formMethods.watch("thumbnail");
  const watchedIsPublished = formMethods.watch("isPublished");
  const actorsError = formMethods.formState.errors.actors?.message;

  return (
    <div className="container mx-auto py-6 space-y-6">
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
            {series ? 'Edit Series' : 'Create New Series'}
          </h1>
          <p className="text-muted-foreground">
            {series ? 'Edit' : 'Set up'} your series details before adding seasons and episodes
          </p>
        </div>
      </div>

      <Form {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Enter the basic details about your series
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={formMethods.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Series Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter series name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formMethods.control}
                    name="descriptionHeading"
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
                    name="descriptionContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your series..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of your series.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Cast & Crew
                  </CardTitle>
                  <CardDescription>
                    Add actors and other key people involved in the series
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={formMethods.control}
                    name="actors"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <ActorsInput
                            actors={watchedActors}
                            onAddActor={addActor}
                            onRemoveActor={removeActor}
                            error={actorsError}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Thumbnail
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={formMethods.control}
                    name="thumbnail"
                    render={() => (
                      <FormItem>
                        <FormLabel>Series Thumbnail</FormLabel>
                        <FormControl>
                          <ThumbnailUpload
                            onThumbnailUploaded={handleThumbnailUploaded}
                            currentThumbnail={watchedThumbnail}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload a thumbnail image for your series
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={formMethods.control}
                    name="isTranslated"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Translated Content</FormLabel>
                          <FormDescription>
                            Is this series translated from another language?
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

                  <FormField
                    control={formMethods.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Publish Series</FormLabel>
                          <FormDescription>
                            {field.value 
                              ? "This series is visible to users" 
                              : "This series is hidden from users"
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

                  <FormField
                    control={formMethods.control}
                    name="licenseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select license type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(LicenseType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace(/_/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>MWK</span>
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={formMethods.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formMethods.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Original price before any discounts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

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
                    {series ? 'Editing' : 'Creating'} Series...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {series ? 'Edit' : 'Create'} Series
                    {watchedIsPublished ? ' & Publish' : ' as Draft'}
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