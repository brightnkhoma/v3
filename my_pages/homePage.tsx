"use client"
import { VideoCard } from '@/app/components/videoCard'
import { getContents, onGetContentItems } from '@/app/lib/dataSource/contentDataSource'
import { ContentItem } from '@/app/lib/types'
import React, { useEffect, useState } from 'react'

function HomePage() {
  const [items, setItems] = useState<ContentItem[]>([])

  const onGetContents = async()=>{
    const contents = await onGetContentItems()
    setItems(contents)
  }

  useEffect(()=>{
    onGetContents()
  },[])
  return (
    <div className='flex-1 min-h-[100vh] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 '>
      {
        items.map((value, index)=>(
          <VideoCard key={index} item={value}/>
        ))
      }
    </div>
  )
}

export default HomePage