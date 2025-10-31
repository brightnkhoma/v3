import { AccountType, ContentFile, Episode, Library, MusicFolderItem, Series, User, VideoFolderItem } from "../../types";
import { checkIfSubscribed, downloadFileWithProgress, getEpisodesAlbum, getFileContent, getLikeCount, getRelatedVideos, getUserLike, getVideoAlbum,getViews, likeMusic, onListenViewIncrement, purchase, subscribe } from "../../dataSource/contentDataSource";
import { RefObject } from "react";
import { showToast } from "../../dataSource/toast";


export class VideoManager {
    user : User = {
        userId: "__",
        name: "",
        email: "",
        joinDate: new Date(),
        accountType: AccountType.FREE,
        paymentMethods: [],
        library: {
            libraryId: "",
            owner: "",
            purchasedContent: [],
            downloadedContent: []
        }
    } 
    videoCollection : VideoFolderItem[] = []
    currentPlayingVideo : VideoFolderItem | null = null
    isVideoLoading : string | null = null
    videoRef : RefObject<HTMLVideoElement | null>
    updateui : (()=> void) | null = null
    _updateui : (()=> void) | null = null
    onItemLoaded : (()=> void) | null = null
    onStartPlay : ((item : VideoFolderItem)=> void) | null = null
    currentTime : number = 0
    duration : number = 0
    progress : number = 0
    likes : number = 0
    isLiked : boolean = false
    views : number = 0
    commentsCount : number = 0
    isMusicLoading : string | null = null    
    album : VideoFolderItem[] = []
    isPurchasing : boolean = false
    relatedVideos : VideoFolderItem[] = []
    price : number = 0;
    currency : string=  'MK';
    requiresPayment : boolean = this.price > 0;
    downloadProgress : number = 0
    isPaidContent = this.currentPlayingVideo?.isPaid;
    isDownloading : boolean = false
    isSubscribed : boolean  = false
    isSubscribing : boolean = false
    defaultUser : User = {
        userId: "__",
        name: "Uknown User",
        email: "__",
        joinDate: new Date(),
        accountType: AccountType.FREE,
        paymentMethods: [],
        library: {} as Library
    }
    volume : number = 0.1

    constructor (
        user : User | null = null,
        videoRef : RefObject<HTMLVideoElement | null>
        
    ){
        if(user){
            this.user = user
        }
        this.videoRef = videoRef
        this.listenToVideoPlay = this.listenToVideoPlay.bind(this)
        this.onSeek = this.onSeek.bind(this)
        this.onToglePlayPause = this.onToglePlayPause.bind(this)
        this.onToggleMute = this.onToggleMute.bind(this)
        this.next = this.next.bind(this)
        this.onChangeVolume = this.onChangeVolume.bind(this)
        this.onGetLikeCount = this.onGetLikeCount.bind(this)
        this.handleLike = this.handleLike.bind(this)
        this.checkIfContentIsLiked = this.checkIfContentIsLiked.bind(this)
        this.download = this.download.bind(this)
        this.incrementView = this.incrementView.bind(this)
        this.onGgetViews = this.onGgetViews.bind(this)
        this.onSubscribe = this.onSubscribe.bind(this)
        this.checkSubscription = this.checkSubscription.bind(this)
    }

    onUpdateUi (){
        if(this.updateui){
            this.updateui()
        }
        if(this._updateui){
            this._updateui()
        }
    }
     
    async purchaseCurrentPlayingVideo( onFailure : ()=>void = ()=> {
        showToast("Failed to purchase video")}
    ){
        try {

            this.isPurchasing = true
            if(this.currentPlayingVideo && this.user){
                await purchase(this.user,this.currentPlayingVideo,async ()=>{
                    await this.directPlay({...this.currentPlayingVideo!,isPaid : true})
                },()=>{
                       onFailure()
                })
            }
            
        } catch (error) {
            console.log(error);
            onFailure()
            
        }finally{
            this.isPurchasing = false
        }
    }

    async checkIfContentIsLiked() {
  if (!this.currentPlayingVideo || !this.user) {
    this.isLiked = false;
    return;
  }
  
  try {
    const res = await getUserLike(this.currentPlayingVideo as any, this.user);
    this.isLiked = !!res;
  } catch (error) {
    console.error('Error checking like status:', error);
    this.isLiked = false;
  }
}

async onGgetViews (){
    if(!this.currentPlayingVideo) return;
    const count = await getViews(this.currentPlayingVideo)
    this.views = count
}

async incrementView (){
    try {
        if(this.currentPlayingVideo)
       await onListenViewIncrement(this.currentPlayingVideo)
    } catch (error) {
        console.log(error);
        
    }finally{
        this.onUpdateUi()
    }
}

async handleLike(myItem: VideoFolderItem, user: User) {
  if (!myItem || !user) return;
  
  try {
    const wasLiked = this.isLiked;
    this.isLiked = !wasLiked;
    this.likes = wasLiked ? this.likes - 1 : this.likes + 1;
    
    await likeMusic(myItem as any, user);
    
    const [count, res] = await Promise.all([
      getLikeCount(myItem as any),
      getUserLike(myItem as any, user)
    ]);
    
    this.likes = count || 0;
    this.isLiked = !!res;
    this.onUpdateUi();
    
  } catch (error) {
    console.error('Error handling like:', error);
    await this.onGetLikeCount();
  }
}

private saveBlobToFile(blob: Blob, filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const blobUrl = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.style.display = 'none';
            
            link.addEventListener('click', () => {
                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl);
                    resolve();
                }, 100);
            });
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
                resolve();
            }, 1000);
            
        } catch (error) {
            reject(new Error(`Failed to save file: ${error}`));
        }
    });
}

async download() {
    try {
        if (!this.currentPlayingVideo) return;
        this.isDownloading = true;
        this.downloadProgress = 0;
        this.onUpdateUi(); 

        const file = await getFileContent(this.currentPlayingVideo, this.user);
        if (!file) throw new Error("File not found");
        
        const updateDownloadProgress = async (progress: number) => {
            this.downloadProgress = progress;
            this.onUpdateUi();
        };

        const blob: Blob = await downloadFileWithProgress(file.uri, updateDownloadProgress);
        
        await this.saveBlobToFile(blob, this.currentPlayingVideo.content.title);
        
        
    } catch (error) {
        console.error('Download failed:', error);
    } finally {
        this.isDownloading = false;
        this.downloadProgress = 0;
        this.onUpdateUi();
    }
}

async onGetLikeCount() {
  if (!this.currentPlayingVideo || !this.user) {
    this.likes = 0;
    this.isLiked = false;
    return;
  }
  
  try {
    const [count, res] = await Promise.all([
      getLikeCount(this.currentPlayingVideo as any),
      getUserLike(this.currentPlayingVideo as any, this.user)
    ]);
    
    this.likes = count || 0;
    this.isLiked = !!res;
    
  } catch (error) {
    console.error('Error getting like count:', error);
    this.likes = 0;
    this.isLiked = false;
  }
}

    async play(file : ContentFile){
        try {
            if(this.videoRef.current){
                
                const target = this.videoRef.current
                target.pause()
                target.src = file.uri
                target.load()
                await target.play()
                await this.onGgetViews()
                if(this.onItemLoaded){
                    this.onItemLoaded()
                }
                if(this.onStartPlay && this.currentPlayingVideo){
                    this.onStartPlay(this.currentPlayingVideo)
                }
            }
        } catch (error) {
            console.log(error);
        }finally{
            this.onUpdateUi()
        }
    }

    detectFile (file : Episode | VideoFolderItem){
        if((file as VideoFolderItem).folderId){
            return "item"
        }
        return "episode"
    }

    getItemFromSeries (file : Episode){
        return file.content
    }

    async directPlay (_myItem : VideoFolderItem | Episode){
        try {
            const type = this.detectFile(_myItem)
            const myItem = type == "item" ? _myItem as VideoFolderItem: this.getItemFromSeries(_myItem as Episode)
            this.currentPlayingVideo = myItem
            this.price =this.currentPlayingVideo.total || this.currentPlayingVideo.content.pricing.price || this.currentPlayingVideo.price?.price || 0
            this.requiresPayment = this.price > 0
            this.isPaidContent = this.currentPlayingVideo.isPaid
            this.onUpdateUi()
             if(this.onItemLoaded){
                    this.onItemLoaded()
                }
            if(this.videoRef.current)
                {
                    this.videoRef.current.poster = myItem.content.thumbnail || myItem.folderPoster || "/images/f.jpg"
                }
            this.isVideoLoading = myItem.content.contentId
            const play = async ()=>{
                const file = await this.getFile(myItem)
            if(file){
                await this.play(file)
            }
            }
            const fetchAlbum = async ()=>{
                if(type == "item")
                await this.fetchAlbum(myItem)
            else this.fetchEpisodeAlbum(_myItem as Episode)
            }
            await Promise.all([play(), fetchAlbum(),this.onGetLikeCount(),this.incrementView(),this.checkSubscription(myItem.owner,this.user.userId)
])
        } catch (error) {
            console.log(error);
            
        }finally{
            this.onUpdateUi()
            this.isVideoLoading = null
        }
    }

    async fetchAlbum(item : VideoFolderItem){
        const isAlbumAlreadyFetched = this.album.length > 0 && this.album[0].folderId == item.folderId
        if(isAlbumAlreadyFetched) return;
        const x = async()=>{
            this.album = await getVideoAlbum(item,this.user)
        }
        const y = async()=>{
            await this.fetchRelatedVideos(item)
        }
        await Promise.all([x(),y()])
    }

    async fetchRelatedVideos(item : VideoFolderItem){
                const items = await getRelatedVideos(item,this.user)
                this.relatedVideos = items
        }

    async fetchEpisodeAlbum (episode : Episode){
        const x = async()=>{
            const items = await getEpisodesAlbum(episode,this.user)
        this.album = items
        }
         const y = async()=>{
            await this.fetchRelatedVideos(episode.content)
        }
        await Promise.all([x(),y()])
    }

    async next(){
        try {
            const index = this.album.findIndex(x=> x.content.contentId == this.currentPlayingVideo?.content.contentId)
            if(index != -1 && index < this.album.length - 1){
                await this.directPlay(this.album[index + 1])
            }else{
                this.repeat()
            }
        } catch (error) {
            console.log(error);
            
        }finally{
            this.onUpdateUi()
        }
    }

    async prev(){
                try {
            const index = this.album.findIndex(x=> x.content.contentId == this.currentPlayingVideo?.content.contentId)
            if(index != -1 && index > 0){
                await this.directPlay(this.album[index - 1])
            }else{
                this.repeat()
            }
        } catch (error) {
            console.log(error);
            
        }finally{
            this.onUpdateUi()
        }
    }

    async onSubscribe (){
        try{
        if(this.isSubscribing || !this.currentPlayingVideo) return;
        this.isSubscribing = true
        this.onUpdateUi()
        const user = this.currentPlayingVideo.owner
        const userId = this.user.userId
        const success = await subscribe(user,userId)
        if(success)  showToast("You have " + (this.isSubscribed ? "Un" : "") + "subscribed to " + user.name);
         else showToast("Failed to subscribe")
        } catch (error) {
            console.log(error);
            
        }finally{
            this.isSubscribing = false
            this.onUpdateUi()
            await this.checkSubscription(this.currentPlayingVideo?.owner!, this.user.userId)

        }
    }

    async checkSubscription(user : User, userId : string){
            const success = await checkIfSubscribed(user,userId)
            this.isSubscribed = success
            this.onUpdateUi()
        }

    onSeek(position : number){
        try {
            if(this.videoRef.current){
                this.videoRef.current.currentTime = position
            }
        } catch (error) {
            console.log(error);
            
        }finally{
            this.onUpdateUi()
        }
    }

onChangeVolume (volume : number){
try {
    if(this.videoRef.current){
             this.videoRef.current.volume = volume/100
             this.volume = volume/100
             this.onUpdateUi()
            }
       } catch (error) {
            console.log(error);
       }finally{
            this.onUpdateUi()
     }
}

onToggleMute() {
    try {
        const video = this.videoRef.current;
        if (video) {
            if (video.muted || video.volume === 0) {
                video.volume = this.volume ?? 1;
                video.muted = false;
            } else {
                this.volume = video.volume;
                video.muted = true;         
            }
        }
    } catch (error) {
        console.log(error);
    } finally {
        this.onUpdateUi();
    }
}




async repeat(){
        try {
            if(this.videoRef.current){
                const target = this.videoRef.current
                target.load()
                await target.play()
            }
        } catch (error) {
            console.log(error);
        }
}

    async onToglePlayPause (){
        try {
            if(this.videoRef.current){
                const target = this.videoRef.current
                if(target.paused){
                   await target.play()
                }else{
                    target.pause()
                }
            }
        } catch (error) {
            console.log(error);
        }finally{
            this.onUpdateUi()
        }
    }

async listenToVideoPlay(){
        try {
            if(this.videoRef.current){
                const target = this.videoRef.current
                this.duration = target.duration
                this.currentTime = target.currentTime
                this.progress = (this.currentTime / this.duration) * 100;
            } 
        } catch (error) {
            console.log(error);
        }finally{
            this.onUpdateUi()
        }
    }

     async getFile (myItem : VideoFolderItem){
        try {
            this.isVideoLoading = myItem.content.contentId
            const file =  await getFileContent(myItem,this.user || this.defaultUser)
            return file
            
        } catch (error) {
            console.log(error);
             this.isVideoLoading = null
             return null
        }
     }
}