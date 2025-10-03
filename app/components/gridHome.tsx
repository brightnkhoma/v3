"use client"
import VideoComponent from '@/app/components/video';
import React, { useCallback, useEffect, useState } from 'react';
import { AccountType, ContentType, LicenseType, VideoFolderItem } from '../lib/types';
import { getVideos, uploadFile } from '../lib/dataSource/contentDataSource';
import { Skeleton } from '@/components/ui/skeleton';
import { InView } from './inView';
uploadFile
const HomePage: React.FC = () => {

  const [videos, setVides] = useState<VideoFolderItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

 

  const onGetVideos = useCallback(async()=>{

    const lastDoc = videos[videos.length -1] || undefined 
    const _videos = await getVideos(lastDoc)
    const myVideos = [...videos,..._videos]
    setVides(myVideos)
    setLoading(false)
  },[videos])

  function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] mx-auto rounded-xl" />
      <div className="space-y-2  mx-auto">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}

  // useEffect(()=>{
  //   onGetVideos()
  // },[])

  return (
    <div className="min-h-screen cbg-gray-50 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videos.map((video, i) => (
          <VideoComponent
            key={i}
            video={video} inFolder={true}          />
        ))}
      </div>
      <InView onView={onGetVideos}/>
      {
    loading && (
    <div className="min-h-screen w-full cbg-gray-50 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({length : 50}).map((_, i) => (
          <SkeletonCard
            key={i}
              />
        ))}
      </div>
    </div>
  )
  }
    </div>
  );
};

export default HomePage;