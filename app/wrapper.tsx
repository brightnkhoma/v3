'use client'

import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner"
import { NavigationBar } from "./components/navigationBar";
import { AudioPlayer } from "./components/audioPlayer";
import { AppContext } from "./appContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioManager } from "./lib/local/redux/audioManager";
import { AccountType, MusicFolderItem, User } from "./lib/types";
import ReduxProvider from "./components/redux/provider";
import { VideoManager } from "./lib/local/redux/videoManager";


// const ReduxProvider = dynamic(() => import("@/app/components/redux/provider"), {
//   ssr: false
// });

export default function Wrapper({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {

    const x : User = {
      userId: "",
      name: "",
      email: "",
      joinDate: {} as Date,
      accountType: AccountType.FREE,
      paymentMethods: [],
      library: {
        libraryId: "",
        owner: "",
        purchasedContent: [],
        downloadedContent: []
      } 
    }

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const audioManager = useMemo(()=> new AudioManager(audioRef,x,null),[])
    const videoManager = useMemo(()=> new VideoManager(null,videoRef),[])
    const [deletingFolder, setDeletingFolder] = useState<string[] | null>(null)
    const [selectedMusicFolderItems,setSelectedMusicFolderItems] = useState<MusicFolderItem[]>([])
    const [cut, setCut] = useState<MusicFolderItem[]>([])
    const [isPasting, setIsPasting] = useState<boolean>(false)

  

    


    
 


    
    return(
        <ReduxProvider >
           <AppContext value={{videoManager,audioManager, global : {deletingFolder,setDeletingFolder,selectedMusicFolderItems,setSelectedMusicFolderItems,cut,setCut,isPasting,setIsPasting}}}>

            <NavigationBar/>

            {children}
              <div id="wrapper" className="wrapper"></div>
            <Toaster/>
            <div className="fixed w-full bottom-0 z-50">

                  <AudioPlayer/>

            </div>
            </AppContext>
             <audio 
                className="hidden" 
                ref={audioRef} 
                preload="metadata"
                onTimeUpdate={audioManager.onTimeUpdate}
                onEnded={audioManager.onPlayEndedEvent}
                onPlay={audioManager.onPlayStart}
                onLoadedMetadata={audioManager.onLoadedMetaDataevent}
                onLoad={audioManager.onLoading}
                onPlaying={audioManager.onPlayStart}
            />
        </ReduxProvider>
    )
}


