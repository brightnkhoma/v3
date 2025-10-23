import { RootState, useAppSelector } from "@/app/lib/local/redux/store"
import { MusicFolderType, VideoFolderType } from "@/app/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlusCircle, ChevronDown } from "lucide-react"
import { Music2, LucideVideo, FolderPlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { DropzoneInputProps } from "react-dropzone"

interface MenuItemProps {
    name: string;
    icon: React.JSX.Element
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, name }) => {
    return (
        <div className="flex flex-row items-center gap-4">
            {icon}
            <span>{name}</span>
        </div>
    )
}

interface DropdownMenuProps {
    onCreateDefaultFolder: (type: MusicFolderType | VideoFolderType) => void,
    pathName: string,
    audioInputRef: React.RefObject<HTMLInputElement>,
    videoInputRef: React.RefObject<HTMLInputElement>
}

export const NewDropDownMenu: React.FC<DropdownMenuProps> = ({ 
    onCreateDefaultFolder, 
    pathName,
    audioInputRef,
    videoInputRef
}) => {
    const { meta } = useAppSelector((state: RootState) => state.auth)
    const a = pathName == "/media/studio"
    const router = useRouter()

    const handleNewMusicClick = () => {
        if (audioInputRef.current) {
            audioInputRef.current.click()
        }
    }

    const handleNewVideoClick = () => {
        if (videoInputRef.current) {
            videoInputRef.current.click()
        }
    }
    const handleClickNewSeries = ()=>{
        router.push("/media/studio/series/create")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex flex-row items-center gap-1 p-1 hover:bg-gray-300 rounded-sm cursor-pointer hover:opacity-80 active:opacity-30">
                    <PlusCircle size={18} className="text-gray-500" />
                    <span>New</span>
                    <ChevronDown size={16} />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger disabled={!a}>
                        <MenuItem icon={<FolderPlusIcon size={18} />} name="New Folder" />
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onCreateDefaultFolder("Movie")}
                            >
                                <MenuItem icon={<LucideVideo size={16} />} name="Movie Folder" />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={handleClickNewSeries}
                            >
                                <MenuItem icon={<LucideVideo size={16} />} name="Series Folder" />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onCreateDefaultFolder("Playlist")}
                            >
                                <MenuItem icon={<Music2 size={16} />} name="Music Folder" />
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuItem
                    disabled={!meta || meta.type === "Playlist"}
                    className="cursor-pointer"
                    onClick={handleNewVideoClick}
                >
                    <MenuItem icon={<LucideVideo size={18} />} name="New Video" />
                </DropdownMenuItem>

                <DropdownMenuItem
                    disabled={!meta || meta.type !== "Playlist"}
                    className="cursor-pointer"
                    onClick={handleNewMusicClick}
                >
                    <MenuItem icon={<Music2 size={18} />} name="New Music" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}