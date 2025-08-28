import { MusicColumn } from '@/app/components/musicColumn'
import { MusicSlideBar } from '@/app/components/musicSlideBar'
import { getFilteredItems, getFolderItems, getMusic } from '@/app/lib/dataSource/contentDataSource'
import { RootState, useAppSelector } from '@/app/lib/local/redux/store'
import { Music, MusicFolderItem, MusicRowItemProps, MusicRowProps } from '@/app/lib/types'
import React, { useEffect, useState } from 'react'

function MusicHomePage() {
    const {user} = useAppSelector((state : RootState)=> state.auth) || {}
    const [xhotlist, sextHotlis] = useState<MusicRowProps[]>([])

    const onGetMusic = async()=>{
        // const x = await getFolderItems(user)
        const yz = await getFilteredItems(user)
        sextHotlis(yz)
        // console.log(x);
        
        // const y : MusicRowProps = {
        //     name: 'Weekly-Best',
        //     items: x as MusicFolderItem[]
        // }
        // sextHotlis(y)

        // const music = await getMusic()




        // const convertMusicToRowItem = (x : Music)=>{
        //     const {title,thumbnail,contentId,description} = x
        //     const item : MusicRowItemProps = {
        //         title,
        //         id: contentId,
        //         thumNail: thumbnail,
        //         listens: 12000,
        //         likes: 5000,
        //         price: 0,
        //         albumName : x.album
        //     }

        // return item

        // }

        // const data = music.map(convertMusicToRowItem)

        // setHotlis({items : data, name : "Hotlist"})
    }

    useEffect(()=>{
        onGetMusic()
    },[])
  return (
    <div className='flex flex-col max-w-screen '>
        <MusicSlideBar/>
        {xhotlist && <MusicColumn x={xhotlist}/>}
    </div>
  )
}

export default MusicHomePage