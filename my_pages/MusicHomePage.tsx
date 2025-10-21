import { PromotionGroupRow } from '@/app/components/promotionRow'
import { SliderPromotion } from '@/app/components/sliderPromotion'
import { getPromotedMusic } from '@/app/lib/dataSource/contentDataSource'
import { RootState, useAppSelector } from '@/app/lib/local/redux/store'
import { MusicFolderItem, MusicRowProps, PromotionGroup } from '@/app/lib/types'
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '@/app/appContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

function MusicHomePage() {
    const { user } = useAppSelector((state: RootState) => state.auth) || {}
    const [xhotlist, setXHotlist] = useState<MusicRowProps[]>([])
    const [groups, setGroups] = useState<PromotionGroup[]>([])
    const [sliderGroup, setSliderGroup] = useState<PromotionGroup>()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { audioManager } = useContext(AppContext)!

    const onGetPData = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const pData = await getPromotedMusic(user)
            
            if (pData) {
                const x = Object.entries(pData.rowGroups).map(c => ({ 
                    items: c[1], 
                    name: c[0], 
                    type: "Row" 
                } as PromotionGroup))
                
                const y: PromotionGroup = { 
                    items: pData.sliders, 
                    name: "Slider", 
                    type: "Slider", 
                    groupName: "Slider" 
                }
                
                const z: PromotionGroup = { 
                    type: "Artist", 
                    items: pData.artists.map(c => ({ owner: c } as MusicFolderItem)), 
                    name: "Artists" 
                }
                
                x.push(z)
                setGroups(x)
                setSliderGroup(y)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load music content')
            console.error('Error fetching promoted music:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        onGetPData()
    }, [])

    const LoadingSkeleton = () => (
        <div className="flex flex-col space-y-8 max-w-screen">
            <div className="space-y-4">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index} className="overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <CardContent className="p-4">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {Array.from({ length: 4 }).map((_, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, itemIndex) => (
                            <Card key={itemIndex} className="overflow-hidden">
                                <Skeleton className="aspect-square w-full" />
                                <CardContent className="p-3">
                                    <Skeleton className="h-5 w-full mb-2" />
                                    <Skeleton className="h-4 w-3/4" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
                <button
                    onClick={onGetPData}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (!isLoading && groups.length === 0 && !sliderGroup) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 space-y-4 text-center">
                <div className="text-muted-foreground">
                    <h3 className="text-lg font-semibold mb-2">No content available</h3>
                    <p>There's no music content to display at the moment.</p>
                </div>
                <button
                    onClick={onGetPData}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                    Refresh
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col max-w-screen space-y-8">
            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <>
                    {sliderGroup && (
                        <section className="space-y-4">
                          
                            <SliderPromotion group={sliderGroup} />
                        </section>
                    )}

                    {groups.map((group, index) => (
                        <section key={`${group.name}-${index}`} className="space-y-4">
            
                            <PromotionGroupRow 
                                isMusicLoading={audioManager.isMusicLoading} 
                                group={group} 
                            />
                        </section>
                    ))}
                </>
            )}
        </div>
    )
}

export default MusicHomePage