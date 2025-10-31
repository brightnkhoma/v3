"use client"

import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Content, ContentType, Genre, Movie, Music, MusicFolderItem, Pricing, User, VideoFolderItem } from "../lib/types"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Save, X, Loader2, Upload, Globe, Languages } from "lucide-react"
import { Input } from "@/components/ui/input"
import { firestoreTimestampToDate } from "../lib/config/timestamp"
import { listenToFolderItemChanges, listenToFolderPosterItemChanges, onUpdateFolderItem, uploadFile } from "../lib/dataSource/contentDataSource"
import { useAppDispatch } from "../lib/local/redux/store"
import { setMeta } from "../lib/local/redux/reduxSclice"
import { showToast } from "../lib/dataSource/toast"
import { v4 } from "uuid"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface FileMetaBarProps {
    data: MusicFolderItem | VideoFolderItem,
    user: User,
    onSave?: (updatedData: Partial<MusicFolderItem | VideoFolderItem>) => void
}

const musicGenres: string[] = [
  "Pop",
  "Rock",
  "Hip Hop",
  "Rap",
  "R&B",
  "Soul",
  "Jazz",
  "Classical",
  "Country",
  "Reggae",
  "Dancehall",
  "Afrobeats",
  "House",
  "Gospel",
  "Trap",
  "Soundtrack",
  "Local"
];

export const FileMetaBar: React.FC<FileMetaBarProps> = ({ data, onSave, user }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [formState, setFormState] = useState(data)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dispatch = useAppDispatch()

    useEffect(()=>{
        setFormState(data)
    },[data])

    const onListenToItemChanges = async () => {
        if (data.isPoster) {
            await listenToFolderPosterItemChanges(user, data, onUpdateFileSuccess)
        } else {
            await listenToFolderItemChanges(user, data, onUpdateFileSuccess)
        }
    }

    const onUpdateFileSuccess = (file: MusicFolderItem | VideoFolderItem) => {
        if (file.folderId === data.folderId) {
            if(
                file.folderName == data.folderName && 
                file.price?.price == data.price?.price && 
                file.content.title == data.content.title &&
                file.isPublished === data.isPublished &&
                file.isTranslated === data.isTranslated
            ){
                return
            }
            dispatch(setMeta(file))
            setFormState(y=>({
                ...y,
                title: file.content.title || '',
                folderName: file.folderName || '',
                price: {...y.price!,price : file.price?.price || 0},
                isPublished: file.isPublished,
                isTranslated: file.isTranslated
            }))
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setUploadProgress(0)

        try {
            await uploadFile(
                file,
                (progress) => setUploadProgress(progress),
                (isPaused) => console.log('Upload paused:', isPaused),
                (isRunning) => console.log('Upload running:', isRunning),
                (isCanceled) => console.log('Upload canceled:', isCanceled),
                (task) => console.log('Upload task:', task),
                (downloadUri) => {
                    if (downloadUri) {
                        handleUpdateFileUri(downloadUri)
                    }
                },
                v4(),
                file.type.includes('image') ? 'image' : 'video',
                (data.type == "Album" || data.type == "Playlist") ? ContentType.MUSIC_TRACK : ContentType.MOVIE
            )
        } catch (error) {
            console.error('Upload failed:', error)
            showToast("Upload failed. Please try again.")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleUpdateFileUri = async (downloadUri: string) => {
        try {
            let updatedItem: Partial<MusicFolderItem | VideoFolderItem>
            
            if (data.isPoster) {
                updatedItem = {
                    ...data,
                    folderPoster: downloadUri
                }
            } else {
                updatedItem = {
                    ...data,
                    content: {
                        ...data.content,
                        thumbnail: downloadUri
                    } as any
                }
            }

            await onUpdateFolderItem(
                user,
                updatedItem as MusicFolderItem | VideoFolderItem,
                () => {
                    showToast("Image updated successfully.")
                    dispatch(setMeta(updatedItem as MusicFolderItem | VideoFolderItem))
                },
                () => {
                    showToast("Failed to update image.")
                }
            )
        } catch (error) {
            console.error('Error updating file URI:', error)
            showToast("Failed to update image.")
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onUpdateFolderItem(
                user,
                formState as MusicFolderItem | VideoFolderItem,
                () => {
                    showToast("Field updated.")
                    setIsEditing(false)
                },
                () => {
                    showToast("Failed to Update the field.")
                }
            )
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setFormState(data)
    }

    const handleInputChange = (field: keyof typeof formState, value: string | boolean) => {
        const y: MusicFolderItem | VideoFolderItem = {...formState}
        
        if (field === "isPublished" || field === "isTranslated") {
            y[field] = value as boolean
        } else if(field == "price"){
            if(y.price){
                const price: Pricing = {
                    isPublic: y.price.isPublic || true,
                    price: Number(value) || 0,
                    basePrice: y.price.basePrice || Number(value) || 0,
                    currency: "MK"
                }
                y.price = price
            }
            else{
                const price: Pricing = {
                    isPublic: true,
                    price: Number(value) || 0,
                    basePrice: 0,
                    currency: "MK"
                }
                y.price = price
            }
        } else if(field == "genre" as keyof typeof formState){
            y.content = {...y.content, genre: value as Genre}
        } else if(field == "name" as keyof typeof formState){
            if(!y.isPoster){
                y.content.title = value as string
            }
        } else if(field == "folderName"){
            if(y.isPoster){
                y.folderName = value as string
            }
        }
        if(field == "title" as keyof typeof formState){
            if(y.isPoster){
                y.folderName = value as string || y.folderName
            } else {
                if(y.content){
                    y.content = {...y.content, title: value as string || y.content.title}
                } else {
                    if(y.isPoster) y.folderName = value as string || y.folderName
                }
            }
        }
        setFormState(y)
    }

    const elements = [
        { name: "Name", value: formState.isPoster ? formState.folderName : formState.content.title, field: "title", readOnly: false },
        { name: "Type", value: data.type, readOnly: true },
        { name: "Owner", value: data.owner?.name || '', readOnly: true },
        { name: "Date created", 
          value: (firestoreTimestampToDate(data.dateCreated as any))?.toLocaleDateString() || "", 
          readOnly: true 
        },
        { name: "Folder Name", value: formState.folderName, field: "folderName", readOnly: !isEditing },
        { name: "Price", value: formState.price?.price, field: "price", readOnly: false },
        { name: "Genre", value: ((formState.content && formState.content.genre) ? formState.content.genre : "Soundtrack"), field: "genre", readOnly: false },
    ]

    useEffect(() => {
        setFormState(data)
    }, [data])

    useEffect(() => {
        onListenToItemChanges()
    }, [data])

    return (
        <ScrollArea className="flex flex-col h-[70vh] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-colors duration-300">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
            />
            
            {/* Image Header */}
            <div className="relative w-full aspect-video">
                {/* Current Image with dimming effect during upload */}
                <div className={`relative w-full h-full ${isUploading ? 'opacity-50' : ''}`}>
                    <Image
                        src={(data.isPoster ? data.folderPoster : data.content.thumbnail) || "/images/1.webp"}
                        alt="File preview thumbnail"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Upload Status Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30">
                        <div className="text-center p-4 bg-white dark:bg-gray-900 bg-opacity-90 rounded-lg shadow-lg max-w-[80%] transition-colors duration-300">
                            <div className="flex items-center justify-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white transition-colors duration-300" />
                                <div>
                                    <p className="font-medium text-black dark:text-white transition-colors duration-300">Uploading Image</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{uploadProgress}% complete</p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3 transition-colors duration-300">
                                <div 
                                    className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300 transition-colors duration-300" 
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button 
                                variant="default"
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving || isUploading}
                                className="gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                <span>Save</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleCancel}
                                disabled={isSaving || isUploading}
                                className="gap-2 border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-300"
                            >
                                <X className="h-4 w-4" />
                                <span>Cancel</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                disabled={isUploading}
                                className="gap-2 bg-white dark:bg-gray-900 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors duration-300"
                            >
                                <Pencil className="h-4 w-4" />
                                <span>Edit Metadata</span>
                            </Button>
                            <Button 
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="gap-2 bg-white dark:bg-gray-900 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors duration-300"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                <span>Change Image</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>
            
            {/* Metadata Content */}
            <ScrollArea className="flex-1 p-6">
                <h1 className="text-xl font-semibold mb-6 text-black dark:text-white transition-colors duration-300">Media Details</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {elements.map((item, index) => (
                        <div key={index} className="space-y-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
                                {item.name}
                            </label>
                            
                            {isEditing && !item.readOnly && item.field ? (
                                item.field === 'price' ? (
                                    <div className="flex flex-col">
                                        <PriceInput 
                                        value={formState.price && formState.price.price ? (formState.price?.price.toString() || "0") : "0"}
                                        onChange={(value) => handleInputChange('price', value)}
                                    />
                                    <Badge className="ml-auto">
                                        what users will pay {formState.total}
                                    </Badge>
                                    </div>
                                ) : item.field === 'genre' ? (
                                    <Select
                                        value={formState.content?.genre || "Soundtrack"}
                                        onValueChange={(value) => handleInputChange('genre' as any, value)}
                                    >
                                        <SelectTrigger className="h-10 border-gray-300 dark:border-gray-700 bg-transparent text-black dark:text-white transition-colors duration-300">
                                            <SelectValue placeholder="Select a genre" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 transition-colors duration-300">
                                            {musicGenres.map((genre) => (
                                                <SelectItem 
                                                    key={genre} 
                                                    value={genre}
                                                    className="text-black dark:text-white focus:bg-gray-100 dark:focus:bg-gray-800 transition-colors duration-300"
                                                >
                                                    {genre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        type="text"
                                        value={item.value || ""}
                                        onChange={(e) => handleInputChange(item.field as keyof typeof formState, e.target.value)}
                                        className="h-10 border-gray-300 dark:border-gray-700 bg-transparent text-black dark:text-white transition-colors duration-300"
                                    />
                                )
                            ) : (
                                <div className="text-sm text-black dark:text-white p-2.5 rounded-md bg-gray-50 dark:bg-gray-900 border border-transparent transition-colors duration-300 flex flex-col">
                                   <span> {item.value || "-"}</span>
                                        {item.field == "price" && <Badge className="ml-auto">
                                        Users will pay {formState.total}
                                    </Badge>}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Status Switches */}
                    <div className="space-y-4 md:col-span-2 border-t border-gray-200 dark:border-gray-800 pt-6 mt-2">
                        <h3 className="text-lg font-medium text-black dark:text-white transition-colors duration-300">
                            Status & Visibility
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Published Status */}
                            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg transition-colors duration-300">
                                        <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="published-switch" className="text-sm font-medium text-black dark:text-white cursor-pointer transition-colors duration-300">
                                            Published
                                        </Label>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                            Make this content publicly available
                                        </p>
                                    </div>
                                </div>
                                {isEditing ? (
                                    <Switch
                                        id="published-switch"
                                        checked={formState.isPublished || false}
                                        onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                                        className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                                    />
                                ) : (
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        formState.isPublished 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                    } transition-colors duration-300`}>
                                        {formState.isPublished ? 'Published' : 'Draft'}
                                    </div>
                                )}
                            </div>

                            {/* Translated Status */}
                            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg transition-colors duration-300">
                                        <Languages className="h-4 w-4 text-green-600 dark:text-green-400 transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <Label htmlFor="translated-switch" className="text-sm font-medium text-black dark:text-white cursor-pointer transition-colors duration-300">
                                            Translated
                                        </Label>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                            Content has been translated
                                        </p>
                                    </div>
                                </div>
                                {isEditing ? (
                                    <Switch
                                        id="translated-switch"
                                        checked={formState.isTranslated || false}
                                        onCheckedChange={(checked) => handleInputChange('isTranslated', checked)}
                                        className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-700 transition-colors duration-300"
                                    />
                                ) : (
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        formState.isTranslated 
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                    } transition-colors duration-300`}>
                                        {formState.isTranslated ? 'Translated' : 'Not Translated'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </ScrollArea>
    )
}

interface PriceInputProps {
    value: string
    onChange: (value: string) => void
}

const PriceInput: React.FC<PriceInputProps> = ({ value, onChange }) => {
    const [inputValue, setInputValue] = useState(value)

    useEffect(() => {
        setInputValue(value)
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        onChange(newValue)
    }

    return (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 transition-colors duration-300">MK</span>
            <Input
                type="number"
                value={inputValue}
                onChange={handleChange}
                className="h-10 pl-8 border-gray-300 dark:border-gray-700 bg-transparent text-black dark:text-white transition-colors duration-300"
                min="0"
                step="0.01"
            />
        </div>
    )
}