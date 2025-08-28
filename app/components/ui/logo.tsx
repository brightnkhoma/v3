
import {Play} from 'lucide-react'
export const Logo = ()=>{
    return(
        <div className='flex flex-row items-center-safe gap-1 cursor-pointer'>
            <div className='bg-black rounded-2xl p-1 '>

            <Play color='red' className='text-white '/>
            </div>
            <div  className='flex flex-row items-baseline-last'>
                <span className='text-lg font-bold text-green-900'>
                    Zathu
                </span>
                <span className='text-red-500 text-xs font-black'>
                    play
                </span>
            </div>
        </div>
    )
}