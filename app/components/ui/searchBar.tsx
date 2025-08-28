import {Search,ArrowLeft} from 'lucide-react'

export const SearchBar = ()=>{
    return(
        <div className="hidden max-w-[7%] w-full rounded-2xl sm:max-w-[30%] lg:max-w-[40%] mx-auto  border-0 lg:border border-gray-400 sm:border sm:flex lg:flex flex-row items-center pl-2 bg-white dark:bg-black">
            <input className=" w-full border-none focus:outline-0 flex-1" type="text" placeholder="Search" />
            <SeachButton/>
        </div>
    )
}

const SeachButton = ()=>{
    return(
        <div className='w-[4rem] cursor-pointer active:opacity-80 flex items-center justify-center rounded-r-2xl h-[2.5rem] '>
            <Search size={25} className='text-xs font-light' />

        </div>
    )
}
const SeachButton2 = ()=>{
    return(
        <div className='w-[4rem] cursor-pointer active:opacity-80 flex items-center justify-center bg-gray-900 rounded-r-2xl h-[2.5rem] '>
            <Search />

        </div>
    )
}

export const SearchField2 : React.FC<SearchTriggerButtonProps> = ({setShow,show})=>{
    if(!show) return null;
    return(
        <div className='flex absolute sm:hidden lg:hidden flex-row items-center w-full h-max gap-8 px-4 bg-white'>
                <BackButton setShow={setShow} show={show}/>
                <div className='flex flex-row border flex-1   rounded-2xl pl-2 z-50'>
                    <input className=' w-full border-none focus:outline-0 flex-1 ' placeholder='Search' type="text" />
                    <SeachButton2/>
                </div>


        </div>
    )
}

interface SearchTriggerButtonProps{
    show : boolean;
    setShow : (shown : boolean) => void
}
export const SearchTriggerButton : React.FC<SearchTriggerButtonProps>= ({setShow,show})=>{
    if(show) return null;
    return(
        <button onClick={()=> setShow(!show)} className='sm:hidden lg:hidden mx-auto'>
            <Search/>
        </button>
    )
}

const BackButton  : React.FC<SearchTriggerButtonProps>= ({setShow,show})=>{
    return(
        <button onClick={()=> setShow(!show)}>
            <ArrowLeft/>
        </button>
    )
}