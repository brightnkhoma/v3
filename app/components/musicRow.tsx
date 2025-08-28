import { MusicRowProps } from "../lib/types"
import { Swiper, SwiperSlide } from 'swiper/react'
import { HotMusicItem } from "./ui/HotMusicItem"
import 'swiper/css';
import { Navigation } from 'swiper/modules';

export const MusicRow: React.FC<{ x: MusicRowProps }> = ({ x }) => {
    const { items, name } = x
    

    return (
        <div className="w-full px-4 md:px-6 lg:px-8 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold ">{name}</h2>
                
                {/* <div className="hidden md:flex gap-2">
                    <button className={`swiper-button-prev-${name.replace(/\s+/g, '-')} 
                        h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center
                        hover:bg-gray-700 transition-colors`}>
                        &lt;
                    </button>
                    <button className={`swiper-button-next-${name.replace(/\s+/g, '-')} 
                        h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center
                        hover:bg-gray-700 transition-colors`}>
                        &gt;
                    </button>
                </div> */}
            </div>

            <Swiper
                modules={[Navigation]}
                navigation={{
                    nextEl: `.swiper-button-next-${name.replace(/\s+/g, '-')}`,
                    prevEl: `.swiper-button-prev-${name.replace(/\s+/g, '-')}`,
                }}
                spaceBetween={16}
                slidesPerView={2}
                breakpoints={{
                    640: {
                        slidesPerView: 3,
                    },
                    768: {
                        slidesPerView: 4,
                    },
                    1024: {
                        slidesPerView: 5,
                    },
                    1280: {
                        slidesPerView: 6,
                    },
                }}
                // className="!overflow-visible"
            >
                {items.map((value, index) => (
                    <SwiperSlide key={index} className="!h-auto">
                        <HotMusicItem x={value} />
                    </SwiperSlide>
                ))}
            </Swiper>
            {/* <hr className="mt-10"/> */}
        </div>
    )
}