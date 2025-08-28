import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Image from 'next/image';
import { useMemo } from 'react';

export const MusicSlideBar = () => {
  const elements = useMemo(() => {
    return [
      {
        uri: "/images/1.webp",
        alt: "Music cover 1"
      },
      {
        uri: "/images/2.webp",
        alt: "Music cover 2"
      },
      {
        uri: "/images/3.avif",
        alt: "Music cover 3"
      },
      {
        uri: "/images/5.jpg",
        alt: "Music cover 4"
      }
    ];
  }, []);

  return (
    <div className="relative w-full max-w-6xl mx-auto  py-4">
      <Swiper
        className="rounded-xl shadow-lg"
        spaceBetween={20}
        slidesPerView={1.2}
        centeredSlides={true}
        loop={true}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          renderBullet: (index, className) => {
            return `<span class="${className} bg-white opacity-60 hover:opacity-100 transition-opacity"></span>`;
          },
        }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        breakpoints={{
          640: {
            slidesPerView: 1.5,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 2.5,
          },
        }}
        modules={[Pagination, Navigation]}
      >
        {elements.map((value, index) => (
          <SwiperSlide key={index} className="overflow-hidden rounded-lg">
            <div className="relative h-64 md:h-72 w-full transition-transform duration-300 hover:scale-105">
              <Image
                src={value.uri}
                alt={value.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <h3 className="text-white text-lg font-bold">{value.alt}</h3>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Navigation Buttons */}
        <button className="swiper-button-next !text-white !right-2 after:text-sm after:font-bold after:content-['→'] hover:!opacity-100 !opacity-70" />
        <button className="swiper-button-prev !text-white !left-2 after:text-sm after:font-bold after:content-['←'] hover:!opacity-100 !opacity-70" />
      </Swiper>
    </div>
  );
};