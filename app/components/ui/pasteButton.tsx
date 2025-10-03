import { ClipboardPaste } from "lucide-react"
import { PathNameProps } from "../studioTopBar"
import { Button } from "@/components/ui/button"
import { useContext } from "react"
import { AppContext } from "@/app/appContext"
import { moveMoreFolderItem } from "@/app/lib/dataSource/contentDataSource"
import { RootState, useAppSelector } from "@/app/lib/local/redux/store"
import { MusicFolderItem } from "@/app/lib/types"

export const PasteButton: React.FC<PathNameProps> = ({ name }) => {
  const x = name.split("/")
  const y = x.slice(0, x.length - 1)
  const z = y.join("/")
  const a = z == "/media/studio/musicFolder"
  const { global } = useContext(AppContext)!
  const { cut, setCut,setSelectedMusicFolderItems,isPasting,setIsPasting } = global
  const {meta} = useAppSelector((state : RootState)=> state.auth)

  const onPaste = async () => {
    if(isPasting || cut.length == 0) return;
     setIsPasting(true)
    if (cut.length > 0) {
        await moveMoreFolderItem(cut,(meta as MusicFolderItem),()=>{
            setSelectedMusicFolderItems([])

        },()=>{

        })
      console.log("Pasting items:", cut)
      setIsPasting(false)
      setCut([])
    }
  }



  return (
    <Button 
      onClick={onPaste} 
      className={`bg-transparent hover:bg-transparent ${
        !a || cut.length === 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
      }`}
      disabled={!a || cut.length === 0}
    >
      <ClipboardPaste 
        size={18} 
        className={` ${cut.length > 0 ? "text-green-600" : "text-slate-600"}  ${isPasting && "animate-caret-blink"}`}
      />
    </Button>
  )
}