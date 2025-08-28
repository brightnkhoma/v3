import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {ArrowDown,ArrowUp,ChevronDown} from "lucide-react"

export const SortButton = ()=>{
    return(
        <div className="flex flex-row items-center p-1 hover:bg-gray-300 rounded-sm cursor-pointer hover:opacity-80 active:opacity-30">
            <ArrowUp className="text-slate-700" size={18}/>
            <ArrowDown className="text-blue-600" size={18}/>
            <span>
                sort
            </span>
            <ChevronDown size={14} className="ml-2"/>


        </div>
    )
}

export const SortMenuButton = ()=>{
    return(
        <DropdownMenu>
            <DropdownMenuTrigger>
                <SortButton/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <span className="mx-auto">
                        Name
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <span className="mx-auto">
                        Date
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <span className="mx-auto">
                        Type
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}