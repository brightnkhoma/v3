import { Key } from "react"
import { RootState, useAppSelector } from "../lib/local/redux/store"
import { MusicRowProps } from "../lib/types"
import { MusicRow } from "./musicRow"



export const MusicColumn : React.FC<{x : MusicRowProps[]}> = ({x})=>{
    return(
        <div className="flex flex-col">
            {
                x.map((value: MusicRowProps, index: Key | null | undefined)=>(
                    <MusicRow  x={value} key={index}/>
                ))
            }

        </div>
    )
}