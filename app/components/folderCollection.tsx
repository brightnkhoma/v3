import { RootState, useAppSelector } from "../lib/local/redux/store"
import { ContentFolder, ContentFolderProps } from "./ui/folder"
import { FolderInput } from "./ui/folderInput"


export const FolderCollection : React.FC<{x : ContentFolderProps[]}> = ({x})=>{
    const {folder} = useAppSelector((state : RootState)=> state.auth)
    return(
        <div className="flex flex-col gap-2">
            {folder && <FolderInput/>}
            {
                x.map((value, index)=>(
                    <ContentFolder data={value.data} id={value.id} type={value.type} key={index} name={value.name}/>
                ))
            }
        </div>
    )
}