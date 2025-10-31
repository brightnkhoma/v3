import { useCallback, useEffect, useState } from "react"
import { Series } from "../lib/types"
import { getFolderSeries } from "../lib/dataSource/contentDataSource"
import { CompactSeriesDisplayCard, SeriesDisplayCard } from "./seriesDisplayCard"
import { Input } from "@/components/ui/input"
import { Search, Filter, Grid3X3, List, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

export const SeriesDisplayPage = () => {
  const [series, setSeries] = useState<Series[]>([])
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const onGetSeries = useCallback(async () => {
    setIsLoading(true)
    try {
      const items = await getFolderSeries()
      setSeries(items || [])
      setFilteredSeries(items || [])
    } catch (error) {
      console.error("Failed to fetch series:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Filter and sort series
  useEffect(() => {
    let result = [...series]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime())
        break
      case "oldest":
        result.sort((a, b) => new Date(a.uploadDate || 0).getTime() - new Date(b.uploadDate || 0).getTime())
        break
      case "title":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        break
      default:
        break
    }

    setFilteredSeries(result)
  }, [series, searchQuery, sortBy])

  useEffect(() => {
    onGetSeries()
  }, [onGetSeries])

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Loading series...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen  transition-colors duration-300">
      {/* Header Section */}
      <div className="sticky top-0 z-10   border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title and Description */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Series Collection
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
                Browse through our curated collection of series
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full   border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
              />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
            {/* Results Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Showing {filteredSeries.length} of {series.length} series
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-colors duration-300">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 transition-colors duration-300">
                  <SelectItem value="newest" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors duration-300">
                    Newest First
                  </SelectItem>
                  <SelectItem value="oldest" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors duration-300">
                    Oldest First
                  </SelectItem>
                  <SelectItem value="title" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors duration-300">
                    Title A-Z
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-1 transition-colors duration-300">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`h-8 px-2 ${
                    viewMode === "grid" 
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  } transition-colors duration-300`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`h-8 px-2 ${
                    viewMode === "list" 
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  } transition-colors duration-300`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <ScrollArea className="container mx-auto px-4 py-8">
        {filteredSeries.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 transition-colors duration-300">
              <Filter className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              No series found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md transition-colors duration-300">
              {searchQuery 
                ? `No results found for "${searchQuery}". Try adjusting your search terms.`
                : "No series available at the moment. Check back later for new content."
              }
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-4 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          // Series Grid/List
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-max"
              : "grid grid-cols-1 gap-4 max-w-4xl "
          }>
            {filteredSeries.map((item, index) => (
              <div
                key={item.id || index}
                className={
                  viewMode === "list" 
                    ? "flex gap-4 p-4     rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300" 
                    : "h-full"
                }
              >
                <CompactSeriesDisplayCard 
                  series={item} 
                //   layout={viewMode === "list" ? "horizontal" : "vertical"}
                />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}