import { RefObject } from "react";
import { ContentFile, MusicFolderItem, User } from "../../types";
import { getCommentsCount, getFileContent, getLikeCount, getMusicAlbum, getUserLike, likeMusic, onListenViewIncrement } from "../../dataSource/contentDataSource";


export class AudioManager {
    audioRef: RefObject<HTMLAudioElement | null> 
    item : MusicFolderItem | null = null
    album : MusicFolderItem[] 
    albumCopy : MusicFolderItem[] 
    playOrder : 'sequential' | 'shuffle' | 'repeat' 
    user : User
    isPlaying : boolean = false
    currentTime : number = 0
    duration : number = 0
    progress : number = 0
    updateUi :( ()=> void) | null
    _updateUi : (()=> void) | null = null
    _updateUi_ : (()=> void) | null = null
    loading : boolean = false
    dispatch : ((file : ContentFile) => void )| null = null
    like : number = 0
    isLiked : boolean = false
    commentsCount : number = 0
    isMusicLoading : string | null = null

    constructor (audioRef: RefObject<HTMLAudioElement | null>, user : User,updateUi : (()=> void) | null = null){
        this.updateUi = updateUi
        this.playOrder =  "sequential"
        this.audioRef = audioRef
        this.user = user
        this.onPlayStartEvent = this.onPlayStartEvent.bind(this);
        this.onLoadedMetaDataevent = this.onLoadedMetaDataevent.bind(this);
        this.onPlayEndedEvent = this.onPlayEndedEvent.bind(this);
        this.next = this.next.bind(this)
        this.prev = this.prev.bind(this)
        this.init = this.init.bind(this)
        this.onTimeUpdate = this.onTimeUpdate.bind(this)
        this.togglePlayOrder = this.togglePlayOrder.bind(this)
        this.onPlayNext = this.onPlayNext.bind(this)
        this.onChangeVolume = this.onChangeVolume.bind(this)
        this.togleMute = this.togleMute.bind(this)

        this.album = []
        this.albumCopy = []
    }
    
 async play(file : ContentFile){
    this.isMusicLoading = file.id


      if(this.audioRef.current){
        this.audioRef.current.pause()
        this.audioRef.current.src=(file.uri)
        this.audioRef.current.load()
        await this.audioRef.current.play()
        this.duration = Number(file.duration)
        this.currentTime = 0
        if(this.dispatch){
            this.dispatch(file)
        }
      }
      await this.onGetLikeCount()
      if(this.item)
      await onListenViewIncrement(this.item)
      await this.onGetCommentsCount()
      if(this.updateUi)
      this.updateUi()
      if(this._updateUi)
      this._updateUi()
      if(this._updateUi_)
        this._updateUi_()

      this.isMusicLoading = null
 }
    shuffleArray<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); 
            [result[i], result[j]] = [result[j], result[i]]; 
        }
        return result;
        }
        

       shuffle() {
            if (this.album.length === 0) return;
            
            if (this.item) {
                const remaining = this.album.filter(
                    x => x.content.contentId !== this.item?.content.contentId
                );
                const shuffled = this.shuffleArray(remaining);
                this.albumCopy = [this.item, ...shuffled];
            } else {
                this.albumCopy = this.shuffleArray(this.album);
            }
            if(this.updateUi)
            this.updateUi();
            }

            togleMute(){
                const target = this.audioRef.current
                if(target){
                    if(target.muted){
                        target.muted = false
                    }else{
                        target.muted = true
                    }
                }
                if(this.updateUi)
                    this.updateUi()
                if(this._updateUi)
                    this._updateUi()
            }


        resetShuffle(){
            this.albumCopy = [...this.album]
            if(this.updateUi)
            this.updateUi()
        }

            onChangeVolume (volume : number){
               try {
            if(this.audioRef.current){
                this.audioRef.current.volume = volume/100
            }
        } catch (error) {
            console.log(error);
            
        }finally{
            if(this.updateUi)
            this.updateUi()
        if(this._updateUi)
            this._updateUi()
        }
    }

        
        async next() {
            switch(this.playOrder){
                case "sequential":
                case "shuffle": await this.onPlayNext();break;
                case "repeat": this.onRepeat()
            }
            if(this.updateUi)
            this.updateUi()

            }

  getNextOf(x : MusicFolderItem){
        const currentIndex = this.albumCopy.findIndex(c=> c.content.contentId == x.content.contentId)
        if(currentIndex != -1 && this.albumCopy.length > currentIndex){
            return this.albumCopy[currentIndex + 1]
        }
        return this.albumCopy[0]

  }

  async onRepeat (){
    try {
        if(this.item){
            const file = await getFileContent(this.item,this.user)
            if(file)
            await this.play(file)
        }

    } catch (error) {
        console.log(error);
        
    }
  }

  async onPlayNext (){
    try {
        if(this.item){
        this.audioRef.current?.pause()
        const nextItem = this.getNextOf(this.item)
        const file = await this.getFile(nextItem)
        if(file){
            await this.play(file).then(()=>{
                this.item = nextItem
            })
        }
    }
    // await this.onGetLikeCount()
    } catch (error) {
        console.log(error);
    }
  }
    async onGetCommentsCount  (){
        if(this.item){
    const count = await getCommentsCount(this.item)
    this.commentsCount = count
}
  }


 
        async prev() {
            const index = this.albumCopy.findIndex(
                (x) => x.content.contentId === this.item?.content.contentId
            )

            if (this.albumCopy[index - 1]) {
                this.item = this.albumCopy[index - 1]
            } else {
                this.item = this.albumCopy[this.albumCopy.length - 1] 
            }

            const file = await this.getFile(this.item)
            if (file) {
                await this.play(file)
            }
            if(this.updateUi)
            this.updateUi()
            }

        togglePlayPause = async ()=>{
            if(this.audioRef.current){
                if(this.audioRef.current.paused){
                  await this.audioRef.current.play()
                }else{
                    this.audioRef.current.pause()
                }
            }
            if(this.updateUi)
            this.updateUi()
        }
       togglePlayOrder() {
        switch (this.playOrder) {
            case "sequential":
            this.playOrder = "shuffle"
            this.shuffle()
            break
            case "shuffle":
            this.playOrder = "repeat"
            break
            case "repeat":
            this.playOrder = "sequential"
            this.resetShuffle()
            break
        }
        if(this.updateUi)
        this.updateUi()
}

   async fetchAlbum (myItem : MusicFolderItem,shouldFetch : boolean){
    if(shouldFetch){
            const myAlbum = await getMusicAlbum(myItem,this.user)
    this.album = myAlbum
    if(this.playOrder == 'shuffle'){
        this.albumCopy = this.shuffleArray(myAlbum)
    }else{
        this.albumCopy = myAlbum
    }
    }
          if(this.updateUi)
      this.updateUi()
      if(this._updateUi)
      this._updateUi()
      if(this._updateUi_)
        this._updateUi_()

   }


        onPlayStart (){
            try {
                if(typeof(this.audioRef) && this.audioRef.current){
                this.audioRef.current.addEventListener("play",this.onPlayStartEvent)
            }
            } catch (error) {
                console.log(error);
                
            }
            
        }
        onPlayStartEvent(){
            if(!this.isPlaying){
                        this.isPlaying = true
                        if(this.updateUi)
                        this.updateUi()
                    }
        }
        onTimeUpdate() {
        if (this.audioRef.current) {
            this.currentTime = this.audioRef.current.currentTime;
            this.duration = this.audioRef.current.duration;
            this.progress = (this.currentTime / this.duration) * 100;
        }
        if(this.updateUi)
        this.updateUi()

        if(this._updateUi)
      this._updateUi()

        if(this._updateUi_)
        this._updateUi_()
        }
        async onPlayEndedEvent() {
            await this.next()
            if(this.updateUi)
            this.updateUi();
        }

        listenTimeUpdate() {
        if (this.audioRef.current) {
            this.audioRef.current.addEventListener("timeupdate", this.onTimeUpdate.bind(this));
        }
        }


        onLoadedMetaData (){
            if(this.audioRef.current){
                this.audioRef.current.addEventListener("loadedmetadata",this.onLoadedMetaDataevent)
            }
        }
        onLoadedMetaDataevent(){
            this.currentTime = this.audioRef.current?.currentTime || 0.1
            this.duration = this.audioRef.current?.duration || 100
            this.progress = (this.currentTime / this.duration) * 100
            if(this.updateUi)
            this.updateUi()
        }
        onPlayEnded(){
            if(this.audioRef.current){
                this.audioRef.current.addEventListener("ended",this.onPlayEndedEvent.bind(this))
            }
        }

        onLoading (){
            this.loading = true
        }

      
        //  onRemoveListeners() {
        // if (this.audioRef.current) {
        //     this.audioRef.current.removeEventListener("loadedmetadata", this.onLoadedMetaDataevent);
        //     this.audioRef.current.removeEventListener("play", this.onPlayStartEvent);
        //     this.audioRef.current.removeEventListener("ended", this.onPlayEndedEvent);
        //     this.audioRef.current.removeEventListener("timeupdate", this.onTimeUpdate);
        // }
        // }

        // async onListen(){
        //     try {
        //         this.onPlayEnded()
        //         this.onPlayStart()
        //         this.onLoadedMetaData()
        //         this.listenTimeUpdate()
        //     } catch (error) {
        //         console.log(error);
                
        //     }
        // }
        
 async getFile (myItem : MusicFolderItem){
    try {
        this.isMusicLoading = myItem.content.contentId
        const file =  await getFileContent(myItem,this.user)
        return file
        
    } catch (error) {
        console.log(error);
         this.isMusicLoading = null
        
         return null
    }
 }

  async onGetLikeCount (){
    if(!this.item) return;
     const count = await getLikeCount(this.item)
       this.like = count || 0
    await this.checkIfContentIsLiked()

   }

  async checkIfContentIsLiked  (){
    if(!this.item) return;
      const res = await getUserLike(this.item,this.user)
      if(res){
       this.isLiked = true
      }else{
        this.isLiked = false
      }
     }
      async handleLike  (myItem : MusicFolderItem){
        if(myItem)
         await likeMusic(myItem,this.user)
         await this.onGetLikeCount()
      
       }
 


  async setItem (myItem : MusicFolderItem ) {
    const shouldFetch = myItem.folderId != this.item?.folderId
    
      this.item = myItem
      if(this.updateUi)
          this.updateUi()
      const play = async()=>{
              const file = await this.getFile(myItem)
      if(file){
          await this.play(file)
          if(this.updateUi)
          this.updateUi()
            
        
    }
      }

      const fetchAlbum = async()=>{
        await this.fetchAlbum(myItem,shouldFetch)
        if(this.updateUi)
          this.updateUi()
      }

      await Promise.all([play(),fetchAlbum()])

    if(this.updateUi)
    this.updateUi()
if(this._updateUi_)
        this._updateUi_()
  }
  
  async init(myFile : ContentFile ){
    try {
        if(this.item){
       if(myFile && this.audioRef.current){
        await this.play(myFile)
        
       }
    }
    if(this.updateUi)
    this.updateUi()
    } catch (error) {
        console.log(error);
        if(this.updateUi)
        this.updateUi()
        
        
    }
  }
}