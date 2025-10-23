import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ContentFile, MusicFolderItem, Series, User, UserWallet, VideoFolderItem } from "../../types";

export interface AppState {
  authState: boolean;
  user : User;
  currentFile : string;
  wallet : UserWallet;
  folder : MusicFolderItem | VideoFolderItem | null,
  meta : MusicFolderItem | VideoFolderItem  | null,
  meta2 : Series | null;
  showPreview : boolean,
  folderMusicViewMode : "grid" | "list",
  audioFile : ContentFile | null,
  


}

const initialState: AppState = {
  currentFile: "",
  authState: false,
  user: {} as User,
  wallet: {
    balance: 0,
    lastUpdatedDate: new Date(),
    userId: ""
  },
  folder: null,
  meta: null,
  showPreview: false,
  folderMusicViewMode: "grid",
  audioFile: null,
  meta2: null
};

export const authSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<boolean>) => {
      state.authState = action.payload;
    },
    login : (state, action : PayloadAction<User>)=>{
        state.user = action.payload
        state.wallet =  {
        balance: 0,
        lastUpdatedDate: new Date(),
        userId: action.payload.userId
      } 
    },
    setWallet : (state, action: PayloadAction<UserWallet>)=>{
      state.wallet = action.payload
    },
   
    
    setCurrentFile : (state, payload : PayloadAction<string>)=>{
      state.currentFile = payload.payload
    },
    setFolder : (state, payload : PayloadAction<MusicFolderItem | VideoFolderItem | null>)=>{
      state.folder = payload.payload
    },
  
    setMeta : (state, payload : PayloadAction<MusicFolderItem | VideoFolderItem  | null>)=>{
      state.meta = payload.payload
    },
    setMeta2 : (state, payload : PayloadAction<Series  | null>)=>{

      state.meta2 = payload.payload
    }
    ,
    setPreview : (state, payload : PayloadAction<boolean>)=>{
      state.showPreview = payload.payload
    },
    setFolderMusicViewMode : (state, payload : PayloadAction<"grid" | "list">)=>{
      state.folderMusicViewMode = payload.payload
    },
    setAudioFile : (state, payload : PayloadAction<ContentFile | null>)=>{
      state.audioFile = payload.payload
    },
    logout : (state)=>{
      state.user = {} as User;
      state.wallet = {} as UserWallet;
      state.meta = null
      
    }
  
    
  }
});

export const { setAuthState,login,setCurrentFile,setWallet,setFolder,setMeta,setPreview,setFolderMusicViewMode,setAudioFile,logout,setMeta2} = authSlice.actions;
export const authReducer = authSlice.reducer;