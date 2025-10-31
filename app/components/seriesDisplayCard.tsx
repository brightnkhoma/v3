"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Series } from "../lib/types"
import { useCallback, useEffect, useState } from "react"
import { getFolderSeriesSeasonCount } from "../lib/dataSource/contentDataSource"
import { useRouter } from "next/navigation"

interface SeriesDisplayCardProps {
  series: Series
  className?: string
}

export const SeriesDisplayCard = ({ series, className = "" }: SeriesDisplayCardProps) => {
  const { description, id, isTranslated, name, thumbnail } = series
  const [numberOfSeasons, setNumberOfSeasons] = useState<number>(0)

  const ongetNumberOfSeasons = useCallback(async()=>{
    const count = await getFolderSeriesSeasonCount(series)
    alert(count)
    setNumberOfSeasons(count || 0)
  },[series])

  useEffect(()=>{
    ongetNumberOfSeasons()
  },[])
  
  return (
    <Card className={`
      group overflow-hidden transition-all duration-300 
      hover:shadow-lg hover:scale-[1.02] 
      border-border/50 hover:border-border
      bg-card text-card-foreground
      ${className}
    `}>
      <CardContent className="p-0 h-full">
        <div className="flex flex-col md:flex-row h-full">
          {/* Thumbnail Section */}
          <div className="relative md:w-2/5 overflow-hidden">
            <img 
              src={thumbnail} 
              alt={name}
              className="w-full h-48 md:h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Badges on image */}
            <div className="absolute top-2 left-2 flex gap-1">
              {isTranslated && (
                <Badge className="bg-green-500/90 hover:bg-green-500 text-white border-0 text-xs">
                  🌐 Translated
                </Badge>
              )}
            </div>
          </div>
          
          {/* Content Section */}
          <div className="md:w-3/5 p-4 md:p-6 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Header with title and season badge */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold text-card-foreground line-clamp-2 flex-1">
                  {name}
                </h3>
                <Badge variant="secondary" className="whitespace-nowrap bg-muted text-muted-foreground">
                  {numberOfSeasons} {numberOfSeasons === 1 ? 'Season' : 'Seasons'}
                </Badge>
              </div>
              
              {/* Description Section */}
              {description && (
                <div className="space-y-2">
                  {description.heading && (
                    <h4 className="font-semibold text-card-foreground/80 text-sm">
                      {description.heading}
                    </h4>
                  )}
                  {description.content && (
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {description.content}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer Section */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
              <span className="text-xs text-muted-foreground font-mono">#{id}</span>
              <Button 
                size="sm" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const CompactSeriesDisplayCard = ({ series, className = "" }: SeriesDisplayCardProps) => {
  const { description, isTranslated, name, thumbnail } = series
    const [numberOfSeasons, setNumberOfSeasons] = useState<number>(0)
    const router = useRouter()

    const handleClick = ()=>{
        router.push(`series/${series.id}`)
    }

  const ongetNumberOfSeasons = useCallback(async()=>{
    const count = await getFolderSeriesSeasonCount(series)
    setNumberOfSeasons(count || 0)
  },[series])

  useEffect(()=>{
    ongetNumberOfSeasons()
  },[])
  
  return (
    <Card onClick={handleClick} className={`
      group overflow-hidden transition-all duration-200 
      hover:shadow-md border-border/40 hover:border-border
      bg-card text-card-foreground h-max
      ${className}
    `}>
      <div className="flex">
        {/* Thumbnail */}
        <div className="relative w-24 md:w-32 flex-shrink-0">
          <img 
            src={thumbnail} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isTranslated && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-3 md:p-4 min-w-0">
          <div className="flex items-start justify-between mb-2 gap-2">
            <h3 className="font-bold text-card-foreground line-clamp-1 flex-1 text-sm md:text-base">
              {name}
            </h3>
            <Badge variant="outline" className="text-xs bg-muted text-muted-foreground flex-shrink-0">
              {numberOfSeasons}S
            </Badge>
          </div>
          
          {description?.content && (
            <p className="text-muted-foreground text-xs line-clamp-2 mb-3 leading-relaxed">
              {description.content}
            </p>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground/70 font-mono">#Watch Now</span>
            <Button 
              size="sm" 
              variant="ghost"
              className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
            >
              View
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Grid variant for displaying multiple cards
export const SeriesGrid = ({ seriesList, className = "" }: { seriesList: Series[], className?: string }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {seriesList.map((series) => (
        <SeriesDisplayCard key={series.id} series={series} />
      ))}
    </div>
  )
}