'use client'

import { deletePromotedMusic, getItemById, getUserMusicPromotions } from "@/app/lib/dataSource/contentDataSource"
import { showToast } from "@/app/lib/dataSource/toast"
import { RootState, useAppSelector } from "@/app/lib/local/redux/store"
import { MusicRow, ArtistPromotion, SliderPromotion, AlbumPromotion, MyPromotionType, User, MusicFolderItem } from "@/app/lib/types"
import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Trash2, Eye, Calendar, DollarSign, Clock, Sliders, Music, User as UserIcon, Disc } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { firestoreTimestampToDate } from "@/app/lib/config/timestamp"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PromotionWithContent extends MusicRow {
  content?: MusicFolderItem
}

const Page = () => {
    const { user } = useAppSelector((state: RootState) => state.auth)
    const [loading, setLoading] = useState<boolean>(true)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [promotions, setPromotions] = useState<(MusicRow | ArtistPromotion | SliderPromotion | AlbumPromotion)[]>([])
    const [promotionContents, setPromotionContents] = useState<Map<string, MusicFolderItem>>(new Map())
    const [contentLoading, setContentLoading] = useState<Set<string>>(new Set())

    const onGetItemById = async (promotion: MusicRow | SliderPromotion) => {
        const contentId = promotionContents.get(promotion.id)
        if (contentId) return contentId

        setContentLoading(prev => new Set(prev).add(promotion.id))
        try {
            const item = await getItemById(user.userId, promotion.id)
            if (item) {
                setPromotionContents(prev => new Map(prev).set(promotion.id, item as MusicFolderItem))
                return item as MusicFolderItem
            }
        } catch (error) {
            console.error("Failed to fetch content:", error)
        } finally {
            setContentLoading(prev => {
                const newSet = new Set(prev)
                newSet.delete(promotion.id)
                return newSet
            })
        }
    }

    const loadAllPromotionContents = async () => {
        const contentPromotions = promotions.filter(p => 
            p.type === MyPromotionType.SLIDER || p.type === MyPromotionType.ROW_ITEM || p.type === "row"
        ) as (MusicRow | SliderPromotion)[]
        
        for (const promotion of contentPromotions) {
            if (!promotionContents.has(promotion.id)) {
                await onGetItemById(promotion)
            }
        }
    }

    const handleClickCreatePromotion = () => {
        showToast("Go to the music folder and click music promotion button at the top.", { 
            type: "info", 
            variant: "soft" 
        })
    }

    const onGetMusicPromotions = useCallback(async () => {
        setLoading(true)
        try {
            const items = await getUserMusicPromotions(user)
            setPromotions(items || [])
        } catch (error) {
            console.error("Failed to fetch promotions:", error)
            showToast("Failed to load promotions", { type: "error" })
        } finally {
            setLoading(false)
        }
    }, [user])

    const onDeletePromotedMusic = useCallback(async (promotion: (MusicRow | ArtistPromotion | SliderPromotion | AlbumPromotion)) => {
        setIsDeleting(getPromotionId(promotion))
        try {
            await deletePromotedMusic(user, promotion, () => {
                showToast("Promotion Deleted", { type: "success" })
                onGetMusicPromotions()
            }, () => {
                showToast("Failed to Delete Promotion", { type: "error" })
            })
        } catch (error) {
            console.error("Delete error:", error)
            showToast("Failed to Delete Promotion", { type: "error" })
        } finally {
            setIsDeleting(null)
        }
    }, [user, onGetMusicPromotions])

    const getPromotionId = (promotion: (MusicRow | ArtistPromotion | SliderPromotion | AlbumPromotion)): string => {
        if ('id' in promotion) return promotion.id
        return `${(promotion as any).userId}`
    }

    const getPromotionTypeLabel = (type: MyPromotionType | "row") => {
        switch (type) {
            case MyPromotionType.SLIDER:
                return "Slider Promotion"
            case MyPromotionType.ROW_ITEM:
                return "Row Promotion"
            case MyPromotionType.ARTIST_ROW:
                return "Artist Promotion"
            case MyPromotionType.ALBUM:
                return "Album Promotion"
            case "row":
                return "Music Row"
            default:
                return "Promotion"
        }
    }

    const getPromotionTypeIcon = (type: MyPromotionType | "row") => {
        switch (type) {
            case MyPromotionType.SLIDER:
                return <Sliders className="h-4 w-4" />
            case MyPromotionType.ROW_ITEM:
            case "row":
                return <Music className="h-4 w-4" />
            case MyPromotionType.ARTIST_ROW:
                return <UserIcon className="h-4 w-4" />
            case MyPromotionType.ALBUM:
                return <Disc className="h-4 w-4" />
            default:
                return <Sliders className="h-4 w-4" />
        }
    }

    const getStatusVariant = (startDate: Date) => {
        const now = new Date()
        const start = new Date(startDate)
        const timeDiff = start.getTime() - now.getTime()
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

        if (daysDiff < 0) return "destructive"
        if (daysDiff <= 7) return "secondary"
        return "default"
    }

    const getStatusText = (startDate: Date) => {
        const now = new Date()
        const start = new Date(startDate)
        const timeDiff = start.getTime() - now.getTime()
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

        if (daysDiff < 0) return "Expired"
        if (daysDiff === 0) return "Starts Today"
        if (daysDiff === 1) return "Starts Tomorrow"
        return `Starts in ${daysDiff} days`
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'MWK'
        }).format(amount)
    }

    const getSlotPercentage = (availableSlots: number, totalSlots: number) => {
        return ((totalSlots - availableSlots) / totalSlots) * 100
    }

    const getContentDisplay = (promotion: MusicRow | ArtistPromotion | SliderPromotion | AlbumPromotion) => {
        if (promotion.type === MyPromotionType.SLIDER || promotion.type === MyPromotionType.ROW_ITEM || promotion.type === "row") {
            const content = promotionContents.get((promotion as MusicRow).id)
            if (contentLoading.has((promotion as MusicRow).id)) {
                return (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                )
            }
            if (content) {
                return (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                        <Avatar className="h-12 w-12 rounded">
                            <AvatarImage src={content.content.thumbnail || content.folderPoster} alt={content.content.title} />
                            <AvatarFallback className="bg-primary/10">
                                <Music className="h-6 w-6 text-primary" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{content.content.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">{content.owner.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                    {content.content.genre}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {Math.floor(content.content.duration / 60)}:{(content.content.duration % 60).toFixed(0).padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            }
        }
        
        // For artist and album promotions, show generic content info
        return (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                    {promotion.type === MyPromotionType.ARTIST_ROW ? (
                        <UserIcon className="h-6 w-6 text-primary" />
                    ) : (
                        <Disc className="h-6 w-6 text-primary" />
                    )}
                </div>
                <div className="flex-1">
                    <h4 className="font-medium text-sm">
                        {promotion.type === MyPromotionType.ARTIST_ROW ? "Artist Content" : "Album Content"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        {promotion.type === MyPromotionType.ARTIST_ROW ? "Artist profile promotion" : "Album collection promotion"}
                    </p>
                </div>
            </div>
        )
    }

    useEffect(() => {
        onGetMusicPromotions()
    }, [onGetMusicPromotions])

    useEffect(() => {
        if (promotions.length > 0) {
            loadAllPromotionContents()
        }
    }, [promotions])

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-2 w-full" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-9 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Promotions</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track your music promotion campaigns
                    </p>
                </div>
                <Button
                    onClick={onGetMusicPromotions}
                    disabled={loading}
                    variant="outline"
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Summary Stats */}
            {promotions.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Promotions</p>
                                    <p className="text-2xl font-bold">{promotions.length}</p>
                                </div>
                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Sliders className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {promotions.filter(p => new Date(firestoreTimestampToDate(p.startDate as any)) > new Date()).length}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Starting Soon</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {promotions.filter(p => {
                                            const start = new Date(firestoreTimestampToDate(p.startDate as any))
                                            const now = new Date()
                                            const timeDiff = start.getTime() - now.getTime()
                                            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
                                            return daysDiff >= 0 && daysDiff <= 7
                                        }).length}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Expired</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {0}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Promotions Grid */}
            {promotions.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Sliders className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No promotions found</h3>
                        <p className="text-muted-foreground">
                            You haven't created any promotions yet. Start promoting your music to reach more listeners.
                        </p>
                        <Button onClick={handleClickCreatePromotion} className="mt-4">Create Promotion</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {promotions.map((promotion) => {
                        const promotionId = getPromotionId(promotion)
                        return (
                            <Card key={promotionId} className="group hover:shadow-lg transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            {getPromotionTypeIcon(promotion.type)}
                                            <CardTitle className="text-lg">
                                                {getPromotionTypeLabel(promotion.type)}
                                            </CardTitle>
                                        </div>
                                        <Badge variant={getStatusVariant(firestoreTimestampToDate(promotion.startDate as any))}>
                                            {getStatusText(firestoreTimestampToDate(promotion.startDate as any))}
                                        </Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(firestoreTimestampToDate(promotion.startDate as any))}
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent className="space-y-4">
                                    {/* Content Being Promoted */}
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Content Being Promoted</h4>
                                        {getContentDisplay(promotion)}
                                    </div>

                                    <Separator />

                                    {/* Key Metrics */}
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                                                <span className="text-sm">MWK</span>
                                                Price
                                            </div>
                                            <div className="font-semibold">{formatCurrency(promotion.price)}</div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                                                <Clock className="h-3 w-3" />
                                                Duration
                                            </div>
                                            <div className="font-semibold">{promotion.duration}d</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-1">Slots</div>
                                            <div className="font-semibold">
                                                {promotion.availableSlots}/{promotion.totalSlots}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Slot Progress */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Slot Usage</span>
                                            <span>{Math.round(getSlotPercentage(promotion.availableSlots, promotion.totalSlots))}%</span>
                                        </div>
                                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-primary h-full rounded-full transition-all duration-500"
                                                style={{ width: `${getSlotPercentage(promotion.availableSlots, promotion.totalSlots)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {'description' in promotion && promotion.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {promotion.description}
                                        </p>
                                    )}

                                    {'features' in promotion && promotion.features && promotion.features.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Features</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {promotion.features.slice(0, 3).map((feature, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {feature}
                                                    </Badge>
                                                ))}
                                                {promotion.features.length > 3 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{promotion.features.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="pt-4">
                                    <div className="flex gap-2 w-full">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1 gap-2"
                                                    disabled={isDeleting === promotionId}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Details
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Promotion Details</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        View detailed information about your promotion campaign.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Close</AlertDialogCancel>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    className="gap-2"
                                                    disabled={isDeleting === promotionId}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {isDeleting === promotionId ? "..." : ""}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your
                                                        promotion and remove the data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => onDeletePromotedMusic(promotion)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete Promotion
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Page