import { createContext, RefObject } from "react";
import { MusicFolderItem } from "./lib/types";
import { AudioManager } from "./lib/local/redux/audioManager";



interface MusicPlayInfo {
    isPlaying : boolean;
    progress : number;
    duration : number;
    currentTime : number;
    loading : boolean;
    item : MusicFolderItem | null,
    currentAlbum : MusicFolderItem[],
    currentPlayinMusic : MusicFolderItem | undefined
    
}
export interface AppContextProps {
  music: MusicPlayInfo;
}

export interface AppContextType {
  audioManager : AudioManager
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
