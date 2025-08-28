"use client"
import { Skeleton } from "@/components/ui/skeleton" 

export const AlbumPlayerSuspense = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col bg-gradient-to-b from-purple-900/70 to-black/80 rounded-xl p-6 shadow-lg max-w-screen w-full mx-auto">
      {children}
    </div>
  )
}

export const AlbumPlayerSkeleton = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row w-full gap-6">
        <div className="size-40 md:size-48 relative rounded-lg overflow-hidden shadow-xl">
          <Skeleton className="h-full w-full bg-gray-700/50" />
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="mb-2 space-y-2">
            <Skeleton className="h-8 w-3/4 bg-gray-700/50" />
            <Skeleton className="h-6 w-1/2 bg-gray-700/50" />
            <Skeleton className="h-4 w-1/3 bg-gray-700/50" />
          </div>
          
          <div className="flex gap-3 items-center mt-4">
            <Skeleton className="h-10 w-10 rounded-full bg-gray-700/50" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 bg-gray-700/50" />
              <Skeleton className="h-4 w-24 bg-gray-700/50" />
            </div>
          </div>
          
          <div className="mt-4 flex-1"></div>
          
          <div className="flex flex-wrap gap-4 py-3">
            <Skeleton className="h-10 w-24 rounded-full bg-gray-700/50" />
            <Skeleton className="h-10 w-20 rounded-full bg-gray-700/50" />
            <Skeleton className="h-10 w-20 rounded-full bg-gray-700/50" />
            <Skeleton className="h-10 w-20 rounded-full bg-gray-700/50" />
            <Skeleton className="h-10 w-10 rounded-full bg-gray-700/50" />
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white/10 rounded-full h-2 w-full">
        <Skeleton className="h-full w-1/2 rounded-full bg-gray-700/50" />
      </div>
    </>
  )
}