import { setPreview } from "@/app/lib/local/redux/reduxSclice"
import { RootState, useAppDispatch, useAppSelector } from "@/app/lib/local/redux/store"
import { Button } from "@/components/ui/button"
import {List} from "lucide-react"

export const DetailsButton = ()=>{
    const dispatch = useAppDispatch()
    const {showPreview} = useAppSelector((state : RootState)=> state.auth)
    const toggleDetails = ()=>{
        dispatch(setPreview(!showPreview))

    }
    return(
        <Button onClick={toggleDetails} className="flex flex-row items-center gap-4 bg-white text-black hover:bg-white hover:border">
            <List size={18} className="text-shadow-blue-950"/>
            <span>
                Details
            </span>

        </Button>
    )
}