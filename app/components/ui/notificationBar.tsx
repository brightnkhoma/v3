import {Bell} from 'lucide-react'
export const NotificationBar = ()=>{
    return(
        <div className='relative pt-2 pr-1'>
            <span className='absolute top-0 right-0 text-sm  text-red-600 font-black'>
                1
            </span>
            <Bell size={18}/>
        </div>
    )
}