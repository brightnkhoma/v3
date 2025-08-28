import {Scissors} from "lucide-react"
import { PathNameProps } from "../studioTopBar"
import { Button } from "@/components/ui/button"

export const CutButton : React.FC<PathNameProps> = ({name})=>{
    const x = name.split("/")
    const y = x.slice(0,x.length-1)
    const z = y.join("/")
    const a = z == "/media/studio/musicFolder"
    return(
      <Button className={`bg-white text-black hover:bg-transparent  ${!a ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`} >
         <Scissors size={18} className="transform rotate-270 text-slate-600"/>
      </Button>
    )
}