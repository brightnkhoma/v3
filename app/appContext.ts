import { createContext, RefObject } from "react";
import { MusicFolderItem } from "./lib/types";
import { AudioManager } from "./lib/local/redux/audioManager";
import { VideoManager } from "./lib/local/redux/videoManager";



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

interface GlobalState{
  deletingFolder : string[] | null;
  setDeletingFolder : (deletingFolder : string[] | null)=> void,
  selectedMusicFolderItems : MusicFolderItem[],
  setSelectedMusicFolderItems : (items : MusicFolderItem[])=> void,
  cut : MusicFolderItem[],
  setCut : (data : MusicFolderItem[]) => void,
  isPasting : boolean;
  setIsPasting : (x : boolean)=> void
}

export interface AppContextType {
  audioManager : AudioManager,
  videoManager : VideoManager,
  global : GlobalState
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
