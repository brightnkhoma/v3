import { AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@radix-ui/react-avatar"
import Image from "next/image"
import { ContentItem } from "../lib/types"
import { Music, Video } from "lucide-react"

export const VideoCard : React.FC<{item : ContentItem}> = ({item})=>{
    const {image,title,views,price,type} = item
    return(
        <div className="flex flex-1 flex-col p-2 rounded-lg h-[20rem] cursor-pointer">
            <ThumbNail uri={image}/>
            <VideoInfoCard type={type} name={title} price={price || 0} views={views || ""}/>

        </div>
    )
}

const VideoInfoCard = ({price, name,views,type} : {price : number, name : string, views : string,type : "music" | "movie" })=>{
    return(
        <div className="flex flex-row items-start gap-4 mt-2 ">
            <Avatar>
                <AvatarImage src={""}/>
                <AvatarFallback>BN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm ">
               <div className="flex flex-row gap-2">
                {
                    type == "movie" ? <Badge asChild><Video size={18}/></Badge> : <Badge asChild><Music size={18}/></Badge>
                }
                 <span className="font-semibold">
                {name}
            </span>
               </div>

            <span className="text-slate-600">Hire Africa</span>
            <div className="flex flex-row items-center justify-between">
                   <span className="text-slate-600">{views || "7.1k"} views . 1 year ago</span>
                 <Badge variant={"outline"}>
                Mk {price || 0}
            </Badge>
            </div>
         
           
            </div>
        </div>
    )
}

const VideoTitle = ()=>{
    return(
        <div className="flex">
            
        </div>
    )
}

const ThumbNail = ({uri} : {uri : string})=>{
    return(
        <div className="size-full relative">
            <Image className="rounded-md" alt="" src={uri || "/images/vid.avif"} 
            fill
            style={{ objectFit: "cover" }}
        />

        </div>
    )
}