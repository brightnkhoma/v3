'use cient'
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';


interface InViewProps{
    onView : ()=>Promise<any>;
}
export const InView : React.FC<InViewProps> = ({onView})=>{
    const {ref,inView} = useInView()
    const [wasHidden, setWasHidden] = useState<boolean>(true)

    useEffect(()=>{
        if(inView && wasHidden){
            onView()
            setWasHidden(false)
        }
        if(!inView){
            setWasHidden(true)
        }

    },[inView,ref])
    return(
        <div ref={ref}/>
    )
}