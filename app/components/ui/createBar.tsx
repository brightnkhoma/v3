"use client"
import {Plus} from 'lucide-react'
import { useRouter } from 'next/navigation'

export const CreateBar = () => {
    const router = useRouter()
    const onNavigate = ()=>{
        router.push("/media/studio")
    }
    return(
        <div onClick={onNavigate} className="flex flex-row items-center cursor-pointer px-2 py-1 rounded-2xl gap-2">
            <Plus size={20} className='text-slate-600'/>
            <span className='hidden sm:flex lg:flex'>Create</span>
        </div>
    )
}