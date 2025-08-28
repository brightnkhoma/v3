import {Menu} from 'lucide-react'
export const MenuBar  = ({onOpen } : {onOpen : ()=> void})=>{
    return(
        <div className='cursor-pointer' onClick={onOpen}>
            <Menu className='cursor-pointer'/>

        </div>
    )
}