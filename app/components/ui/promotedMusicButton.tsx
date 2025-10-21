import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"



export const PromotedMusicButton = ()=>{
    const router = useRouter()
    const handleClick = ()=>{
        router.push(`/media/studio/promoted-music`)
    }
    return(
        <div className="flex">
            <Button onClick={handleClick} variant={"ghost"}>
                Promoted Music
            </Button>
        </div>
    )
}