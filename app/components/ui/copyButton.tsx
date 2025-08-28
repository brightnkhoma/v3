import { Button } from "@/components/ui/button"
import {Copy} from "lucide-react"
import { PathNameProps } from "../studioTopBar"
export const CopyButton : React.FC<PathNameProps> = ({name})=>{
    const x = name.split("/")
    const y = x.slice(0,x.length-1)
    const z = y.join("/")
    const a = z == "/media/studio/musicFolder"
    return(
        <div>
        <Button className={`bg-white text-black hover:bg-transparent  ${!a ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`} >
            <Copy size={18} className="text-blue-950 cursor-pointer"/>
      </Button>

        </div>
    )
}