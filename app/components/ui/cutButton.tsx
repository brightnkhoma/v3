import {Scissors} from "lucide-react"
import { PathNameProps } from "../studioTopBar"
import { Button } from "@/components/ui/button"
import { useContext } from "react"
import { AppContext } from "@/app/appContext"

export const CutButton : React.FC<PathNameProps> = ({name})=>{
    const x = name.split("/")
    const y = x.slice(0,x.length-1)
    const z = y.join("/")
    const a = z == "/media/studio/musicFolder"
    const {global} = useContext(AppContext)!
    const {cut,setCut,selectedMusicFolderItems} = global

    const onCut = ()=>{
      if(cut.length > 0){
        setCut([])
      }else{
        setCut(selectedMusicFolderItems)
      }
    }
    return(
      <Button onClick={onCut} className={` bg-transparent hover:bg-transparent  ${!a ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`} >
        {
          cut.length > 0 ?  <Scissors size={18} className="transform rotate-270 animate-caret-blink text-red-600"/> :  <Scissors size={18} className="transform rotate-270 text-slate-600"/>
        }
      </Button>
    )
}