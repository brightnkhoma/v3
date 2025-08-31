import { MusicColumn } from '@/app/components/musicColumn'
import { MusicSlideBar } from '@/app/components/musicSlideBar'
import { PromotionGroupRow } from '@/app/components/promotionRow'
import { SliderPromotion } from '@/app/components/sliderPromotion'
import { getFilteredItems, getFolderItems, getMusic, getPromotions } from '@/app/lib/dataSource/contentDataSource'
import { RootState, useAppSelector } from '@/app/lib/local/redux/store'
import { Music, MusicFolderItem, MusicRowItemProps, MusicRowProps, Promotion, PromotionGroup, PromotionType } from '@/app/lib/types'
import React, { useEffect, useState } from 'react'

function MusicHomePage() {
    const {user} = useAppSelector((state : RootState)=> state.auth) || {}
    const [xhotlist, sextHotlis] = useState<MusicRowProps[]>([])
    const [groups, setGroups] = useState<PromotionGroup[]>([])
    const [sliderGroup, setSliderGroup] = useState<PromotionGroup>()

   
    const onGetPromotions = async()=>{
      const promotions = await getPromotions(user)
      const grouped = groupPromotionsByType(promotions)
      setGroups(grouped.filter(x=> x.type !== PromotionType.SLIDER))
      const mySliderGroup = grouped.find(x=> x.type == PromotionType.SLIDER)
      setSliderGroup(mySliderGroup)
    }


 const groupPromotionsByType = (promotions: Promotion[]): PromotionGroup[] => {
  if (!promotions || promotions.length === 0) {
    return [];
  }

  const groupsByType = new Map<PromotionType, Promotion[]>();
  
  promotions.forEach(promotion => {
    if (!groupsByType.has(promotion.type)) {
      groupsByType.set(promotion.type, []);
    }
    groupsByType.get(promotion.type)!.push(promotion);
  });

  const result: PromotionGroup[] = [];

  for (const [type, typePromotions] of groupsByType.entries()) {
    if (type === PromotionType.CUSTOM_GROUP) {
      const groupsByCustomName = new Map<string, Promotion[]>();
      
      typePromotions.forEach(promotion => {
        const groupName = promotion.groupName || 'Ungrouped';
        if (!groupsByCustomName.has(groupName)) {
          groupsByCustomName.set(groupName, []);
        }
        groupsByCustomName.get(groupName)!.push(promotion);
      });

      for (const [groupName, groupPromotions] of groupsByCustomName.entries()) {
        result.push({
          items: groupPromotions.map(p => p.musicItem),
          name: groupName,
          type: PromotionType.CUSTOM_GROUP,
          groupName: groupName
        });
      }
    } else {
      result.push({
        items: typePromotions.map(p => p.musicItem),
        name: getPromotionTypeName(type),
        type: type
      });
    }
  }

  return result;
};

const getPromotionTypeName = (type: PromotionType): string => {
  switch (type) {
    case PromotionType.SLIDER:
      return 'Homepage Slider';
    case PromotionType.ROW_ITEM:
      return 'Homepage Row';
    case PromotionType.ARTIST_ROW:
      return 'Promoted Artists';
    case PromotionType.CUSTOM_GROUP:
      return 'Custom Groups';
    default:
      return 'Other Promotions';
  }
};



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
      onGetPromotions()
        onGetMusic()
    },[])
  return (
    <div className='flex flex-col max-w-screen '>
        {/* <MusicSlideBar/> */}
        {sliderGroup && <SliderPromotion group={sliderGroup}/>}
        
        {
          groups.map((x,i)=>(<PromotionGroupRow group={x} key={i}/>))
        }
        {/* {xhotlist && <MusicColumn x={xhotlist}/>} */}
    </div>
  )
}

export default MusicHomePage