import { audioFormats, Content, ContentFile, ContentItem, ContentType, Folder, LicenseType, LikedContent, Movie, Music, MusicFolderItem, MusicFolderType, PurchasedContent, User, UserWallet, VideoFolderItem, VideoFolderType, videoFormats, zathuPath,Comment, FilteredContent, MusicRowProps, Promotion } from "../types"
import axios from "axios"
import { maiPath } from "./global"
import { UploadTask, ref, uploadBytesResumable, UploadTaskSnapshot, getDownloadURL } from "firebase/storage"
import { db, storage } from "../config/firebase"
import {v4 as uuidv4, v4} from 'uuid'
import { collection, deleteDoc, doc, DocumentChangeType, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, where } from "firebase/firestore"
import { firestoreTimestampToDate } from "../config/timestamp"

// export const dbPath = "mstream/all"
export const getContentType = (fileName : string) :  ContentType.MOVIE | ContentType.MUSIC_TRACK | null=>{
    const format = fileName.split(".")
    const extension = format[format.length-1]
    if(videoFormats.includes(extension)){
        return ContentType.MOVIE
    }
    else if(audioFormats.includes(extension)){
        return ContentType.MUSIC_TRACK
    }
    return null
}


export const onGenerateDefaultContent = (fileName : string, id : string):  Movie | Music | null=>{
  

    const format = getContentType(fileName)
    if(format){
          const content : Content = {
              ownerId: "",
              contentId: id,
              description: "",
              genres: [],
              license: {
                  licenseId: "",
                  type: LicenseType.STREAM_ONLY,
                  terms: "",
                  allowsStreaming: false,
                  allowsDownload: false,
                  allowsPurchase: false
              },
              title: fileName,
              releaseDate: new Date(),
              type: format,
              pricing: {
                  basePrice: 0,
                  currency: "",
                  isPublic: false,
                  price: 0
              },
              thumbnail: "",
              genre: "Soundtrack"
          }
        if(format == ContentType.MOVIE){
            const movie : Movie  = {
                ...content,
                director: "",
                cast: [],
                duration: 0,
                rating: "",
            }
            return movie
        }

        const music : Music = {
            ...content,
            artists: [],
            album: "",
            duration: 0,
            genre: "Soundtrack"
        }
        return music
    }

    return null
}

export const onSetNewContent = async(content : Movie | Music,onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
        const res = await axios.post(maiPath + "/setcontent/",content)
        if(res.status == 200){
            if(res.data.success)
          return  onSuccess()
        }
        onFailure()
    } catch (error) {
        console.log(error);
        onFailure()
    }
}
export const onSetNewFile = async(file : ContentFile)=>{
        const myDoc = doc(db,`${zathuPath}/files/${file.ownerId}/all/${file.id}`)
        await setDoc(myDoc,file)
}
export const setContent = async(file : ContentFile,data : Movie | Music, onSuccess : () => void, onFailure : ()=> void)=>{
    try {
        const id = uuidv4()
        data.contentId = id
        const myDoc =doc(db,`${zathuPath}/contents/${data.contentId}`)
        await setDoc(myDoc,data)
        file.id = id
        await onSetNewFile(file)
        onSuccess()
    } catch (error) {
        console.log(error);
        onFailure()
    }
}
export async function onGenerateFile(
  uri: string,
  content: File,
  ownerId: string,
  type: ContentType.MOVIE | ContentType.MUSIC_TRACK
): Promise<ContentFile> {
  const durationInSeconds = await getMediaDuration(content, type)

  const file: ContentFile = {
    uri,
    size: content.size,
    duration: durationInSeconds.toFixed(2), 
    id: "",
    ownerId,
    name: content.name,
  }

  return file
}

function getMediaDuration(file: File, type: ContentType): Promise<number> {
  return new Promise((resolve, reject) => {
    const myType = type === ContentType.MOVIE ? "video" : "audio"
    const media = document.createElement(myType)
    media.preload = "metadata"

    const url = URL.createObjectURL(file)
    media.src = url

    media.onloadedmetadata = () => {
      URL.revokeObjectURL(url) 
      resolve(media.duration)
    }

    media.onerror = () => {
      reject(new Error("Failed to load media"))
    }
  })
}


export const uploadFile = async  (
       
        file: File,
        onProgressChange: (progress: number) => void,
        onPause: (isPaused: boolean) => void,
        onRun: (isRunning: boolean) => void,
        onCancel: (isCanceled: boolean) => void,
        onTask: (task: UploadTask) => void,
        onFinish: (downloadUri: string | null) => void,
        contentId : string,
        format : string,
        type : ContentType
    )  => {
        if (typeof window === "undefined") {
            console.error("Firebase storage cannot be used on the server.");
            return;
        }
    
        try {
            
            const imageRef = ref(
                storage,
                `mstream/images/contents/${type}/${contentId}.${format}`
            );
    
            const uploadTask = uploadBytesResumable(imageRef, file);
            onTask(uploadTask);
    
            uploadTask.on(
                "state_changed",
                (snapshot: UploadTaskSnapshot) => {
                    const progress = snapshot.bytesTransferred / snapshot.totalBytes;
                    onProgressChange(progress * 100);
                    console.log(`Upload is ${Math.round(progress * 100)}% done`);
            
                    const newState = snapshot.state;
            
                    onPause(newState === "paused");
                    onRun(newState === "running");
                    onCancel(false);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    onCancel(true);
                    onPause(false);
                    onRun(false);
                    onFinish(null);
                },
                async () => {
                    try {
                        const uri = await getDownloadURL(uploadTask.snapshot.ref);
                        onFinish(uri);
                        console.log("Download URI:", uri);
                    } catch (error) {
                        console.error("Failed to get download URL:", error);
                        onFinish(null);
                    }
                }
            );
            
        } catch (error) {
            console.error("Upload error:", error);
            onCancel(true);
            onPause(false);
            onRun(false);
            onFinish(null);
        }
    };

    export const getContentFiles = async(user : User) :  Promise<ContentFile[]>=>{
        try {
            const myCollection = collection(db,`${zathuPath}/files/${user.userId}/all`)
            const myDocs = await getDocs(myCollection)
            if(myDocs.empty){
                return []
            }
            return myDocs.docs.map(x=> x.data() as ContentFile)
        } catch (error) {
            console.log(error);
            return[]
            
        }
    }

    const onGetContent = async(contentId : string,onResult : (data : Movie | Music)=> void)=>{
        const myDoc =doc(db,`${zathuPath}/contents/${contentId}`)
        const contentDoc = await getDoc(myDoc)
        if(contentDoc.exists()){
            onResult(contentDoc.data() as (Movie | Music))
        }
    }

    const onGetContents = async(contentFiles : ContentFile[]) :  Promise<(Movie | Music)[]>=>{
        try {
            const contents : (Movie | Music)[] = []
            const onUpdateCOntents = (content : Music | Movie)=>{
                contents.push(content)
            }
            await Promise.all(contentFiles.map(x=> onGetContent(x.id,onUpdateCOntents)))
            return contents;
        } catch (error) {
            console.log(error);
            return[]
            
        }

    }

    export const getContents = async(user : User, onSuccess : (contents : (Movie | Music)[])=> void, onFailure : ()=> void)=>{
       try {
         const contentFiles = await getContentFiles(user)
        const contents = await onGetContents(contentFiles)
        onSuccess(contents)
       } catch (error) {
        console.log(error);
        onFailure()
       }
    }

    export const getMusic = async()=>{
        try {
           
            const myCollection = collection(db,`${zathuPath}/contents`)
            const myQuery = query(myCollection, where("type","==", ContentType.MUSIC_TRACK))
            const myDocs = await getDocs(myQuery)
            if(myDocs.empty){
                return []
            }
            return myDocs.docs.map(x=> x.data() as Music)

            
        } catch (error) {
            console.log(error);
            return []
            
        }
    }

    export const getContentById = async(contentId : string)=>{
        const myDoc =doc(db,`${zathuPath}/contents/${contentId}`)
        const contentDoc = await getDoc(myDoc)
        
        const myContent = contentDoc.data() as Movie | Music 
        return myContent

    }

    export const updateContent = async(contentId : string ,content : Movie | Music)=>{
        const myDoc =doc(db,`${zathuPath}/contents/${contentId}`)
        await setDoc(myDoc,content)

    }

    export const onGetExploreContents = async() :  Promise<(Movie | Music)[]>=>{
        try {
            const myCollection = collection(db,`${zathuPath}/contents`)
            const docs = await getDocs(myCollection)
            if(docs.empty){
                return []
            }
            return docs.docs.map(x=> x.data() as (Movie | Music))
        } catch (error) {
            console.log(error);
            return []
            
        }
    }


    export const onGetContentItems = async()=>{
        const data = await onGetExploreContents()
        const items = data.map(contentToItem)
        return items
    }



  export  const contentToItem = (content : Movie | Music) : ContentItem=>{
        const {contentId,title,type,thumbnail,duration,releaseDate,artists,pricing,ownerId} = content
        const item : ContentItem = {
            id: contentId,
            title,
            artist: artists?.join(", ") || "",
            type : type == ContentType.MUSIC_TRACK ? "music" : "movie",
            image: thumbnail,
            duration: duration.toString() || "",
            year: firestoreTimestampToDate(releaseDate as any).toLocaleDateString(),
            price : pricing.price || 0,
            ownerId
        }
        return item
    }


    export const onGetFile = async(content : Movie | Music)=>{
        try {
            const {contentId,ownerId} = content
            const myDoc = doc(db,`${zathuPath}/files/${ownerId}/all/${contentId}`)
            const data = await getDoc(myDoc)
            return data.data() as ContentFile
        } catch (error) {
            console.log(error);
            
        }
    }


    export const onLikeContent  = async(userId : string, content : ContentItem,onSuccess : ()=> void, onFailure : ()=> void)=>{
        try {
            const {id : contentId,type,title,image : thumbnail} = content
            
            const likedcontent : LikedContent = {
                id : contentId,
                date: new Date(),
                type : type == "movie" ? ContentType.MOVIE : ContentType.MUSIC_TRACK ,
                name: title,
                thumbNail : thumbnail
            }
            const myDoc = doc(db,`${zathuPath}/likedcontent/${userId}/all/${likedcontent.id}`)
            await setDoc(myDoc,likedcontent)
            onSuccess()
        } catch (error) {
            console.log(error);
            onFailure()
        }
    }

    export const onRemoveLikedContent = async(userId : string, contentId : string,onSuccess : ()=> void =()=>{console.log("deleted")}, onFailure : ()=> void =()=>console.log("Failed")
    )=>{
        try {
            const myDoc = doc(db,`${zathuPath}/likedcontent/${userId}/all/${contentId}`)
            await deleteDoc(myDoc)
            onSuccess()
        } catch (error) {
            console.log(error);
            onFailure()
        }
    }


    export const getLikedContents = async(userId : string) : Promise<LikedContent[]> =>{
        try {
            const myCollection = collection(db,`${zathuPath}/likedcontent/${userId}/all`)
            const myDocs = await getDocs(myCollection)
            if(myDocs.empty){
                return []
            }
            return myDocs.docs.map(x=> x.data() as LikedContent)

        } catch (error) {
            console.log(error);
            return []
        }
    }


    export const onListentToLikedContents = async(userId : string, onResult : (data : {type : DocumentChangeType,data : LikedContent})=> void)=>{
        try {
            const myCollection = collection(db,`${zathuPath}/likedcontent/${userId}/all`)
            onSnapshot(myCollection, (snapshot) => {
                snapshot.docChanges().forEach(change => {
                    const {type,doc} = change
                    const data = {type, data : doc.data() as LikedContent}
                    onResult(data)
                })
            })

        } catch (error) {
            console.log(error);
            
        }
    }


    // export const buyContent = async(userId : string,contentId : string,name : string,price : number,txnId : string,ownerId : string,onSuccess : ()=> void, onFailure : ()=>void,status : "pending" | "processed" = "pending")=>{
    //     try {
    //         const purchasedcontent : PurchasedContent = {
    //             id: contentId,
    //             date: new Date(),
    //             type: ContentType.MOVIE,
    //             name,
    //             txnId,
    //             status,
    //             price,
    //             ownerId
    //         }
    //         const myDoc = doc(db,`${zathuPath}/purchasedcontents/${userId}/all/${contentId}`)
    //         await setDoc(myDoc,purchasedcontent)
    //         // if(purchasedcontent.name !== "deposit"){
    //         //     await purchase(userId,purchasedcontent)
    //         // }
    //        return onSuccess()

    //     } catch (error) {
    //         console.log(error);
    //         onFailure()
            
    //     }
    // }

    export const deposit = async(user : User, amount : number,onSuccess : (id : string)=> void, onFailure : ()=> void)=>{
        try {
            const res = await axios.post(`${maiPath}/deposit`,{user,amount})
            if(res.status == 200 && res.data.success && res.data.txnId){
               return onSuccess(res.data.txnId)

            }
        } catch (error) {
            console.log(error);
            
        }
        onFailure()
    }

    export const checkIfContentIsPaid = async(userId : string, contentId : string) : Promise<boolean | undefined>=>{
        try {
            const myDoc = doc(db,`${zathuPath}/purchasedcontents/${userId}/all/${contentId}`)
            const userDoc = await getDoc(myDoc)
            if(userDoc.exists()){
                const data = userDoc.data() as PurchasedContent
                return data.status == "processed"
            }
        } catch (error) {
            console.log(error);
            
        }
    }


//     export const onListentToPurchasedContents = async(userId : string)=>{
//         try {
//             const myCollection = collection(db,`${zathuPath}/purchasedcontents/${userId}/all`)
//             onSnapshot(myCollection, (snapshot) => {
//                 snapshot.docChanges().forEach(async change => {
//                     if(change.type == "added"){
//                         const item = change.doc.data() as PurchasedContent
//                         if(item.name == "Deposit"){
//                         await refreshBalance(userId)
//                     }else{     
//                         const item = change.doc.data() as PurchasedContent
//                         if(item.status == "pending"){
//                             await purchase(userId,item)
// }
//                         }
                        
//                     }
//                 })
//             })

//         } catch (error) {
//             console.log(error);
            
//         }
//     }

   
    const onUpdatePurchaseContent = async(userId : string,purchasedContent : {type : DocumentChangeType,data : PurchasedContent})=>{
        try {
            const {data,type} = purchasedContent
            switch(type){
                case "added": await requestUpdateBalance(userId, data);break;
            }
        } catch (error) {
            console.log(error);
            
        }
    }

    const requestUpdateBalance = async(userId : string, purchasedContent : PurchasedContent)=>{
        try {
            await axios.post(`${maiPath}/veryfy_and_update_balance`,{userId,purchasedContent})
        } catch (error) {
            console.log(error);
        }
    }

   export const purchase = async(user : User, content : MusicFolderItem,onSuccess : ()=> void, onFailure : ()=> void)=>{
           const res = await axios.post(`${maiPath}/purchase`,{user,content})
           if(!res.data.success ) {
            onFailure()
            throw new Error("Failed")
           }
           onSuccess()
       
    }

    export const refreshBalance = async(user : User)=>{
        try {
             await axios.post(`${maiPath}/refreshbalance`,{user})
        } catch (error) {
            console.log(error);
        }
    }

    export const onListenToBalanceChanges = async(userId : string,onResult : (data : UserWallet)=> void)=>{
        try {
            const myDoc = doc(db,`${zathuPath}/balance/${userId}`)
            onSnapshot(myDoc,(snapshot)=>{
                if(snapshot.exists()){
                    onResult(snapshot.data() as UserWallet)
                }
            })
        } catch (error) {
            console.log(error);
            
        }
    }

export const getBalance = async(userId : string)=>{
    try {
            const myDoc = doc(db,`${zathuPath}/wallets/${userId}`)
            const walletDoc = await getDoc(myDoc)
            if(walletDoc.exists()){
                return walletDoc.data() as UserWallet
            }
    } catch (error) {
        console.log(error);
        
    }
}

export const createDefaultFolder = (user : User, folderType : MusicFolderType | VideoFolderType)=>{
    const folder : Folder = {
        folderName: `New Folder (${folderType})`,
        folderId: "",
        owner: user,
        folderPoster: "",
        isPoster: true
    }
    const x : MusicFolderType[] = ["Album","Default","Playlist"]
    const y : VideoFolderType[] = ["Movie","Music-Video","Podcast","Series"]
    if(x.includes(folderType as MusicFolderType)){
        const musicFolder : MusicFolderItem = {
            ...folder, artistName: user.name,
            featuredArtists: [],
            type: folderType as MusicFolderType,
            content: {} as Music
        }
        return musicFolder;
    }else if(y.includes(folderType as VideoFolderType)){
        const videoFolder : VideoFolderItem = {
            ...folder,
            actorName: user.name,
            featuredActors: [],
            name: "",
            content: {} as Movie,
            type: folderType as VideoFolderType
        }
        return videoFolder
    }
    return null
}

const onAddFolderElement = async ()=>{
    try {
        
    } catch (error) {
        console.log(error);
        
    }
}


export const createNewFolder = async (user : User, newFolder : MusicFolderItem | VideoFolderItem,onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
        const res = await axios.post(`${maiPath}/new-folder/`,{user,newFolder})
        if(res.status == 200 && res.data.success){
            return onSuccess()
        }
        onFailure()

    } catch (error) {
        console.log(error);
        onFailure()
        
    }
}

export const getFolders = async(user : User)=>{
    try {
        const myCollection = collection(db,`${zathuPath}/folders/${user.userId}/folder`)
        const myQuery = query(myCollection,where("isPoster","==",true))
        const snapshot = await getDocs(myQuery)
        if(snapshot.empty){
            return []
        }
        return snapshot.docs.map(x=> x.data() as MusicFolderItem | VideoFolderItem)

    } catch (error) {
        console.log(error);
        return[]
    }
}

export const onUpdateFolderItem = async(user : User, item : MusicFolderItem | VideoFolderItem, onSuccess : ()=> void, onFailure : ()=> void,file : ContentFile | null = null)=>{
    try {
        const res = await axios.post(`${maiPath}/update-folder-item`,{user,item,file})
        if(res.status == 200 && res.data.success){
            return onSuccess()
        }
        onFailure()
    } catch (error) {
        console.log(error);        
        onFailure()
    }
}

export const listenToFolderItemChanges =async (user : User, item : MusicFolderItem | VideoFolderItem,onResult : (item : MusicFolderItem | VideoFolderItem)=> void)=>{
    try {
        const myDoc = doc(db,`${zathuPath}/folders/${user.userId}/folder/${item.content.contentId}`)
        onSnapshot(myDoc,(snapshot)=>{
          snapshot.exists() && onResult(snapshot.data() as MusicFolderItem | VideoFolderItem)
        })

    } catch (error) {
        console.log(error);
        
    }

}
export const listenToFolderPosterItemChanges = async (user : User, item : MusicFolderItem | VideoFolderItem,onResult : (item : MusicFolderItem | VideoFolderItem)=> void)=>{
    try {
        const myDoc = doc(db,`${zathuPath}/folders/${user.userId}/folder/${item.folderId}`)
        onSnapshot(myDoc,(snapshot)=>{
          snapshot.exists() && onResult(snapshot.data() as MusicFolderItem | VideoFolderItem)
        })

    } catch (error) {
        console.log(error);
        
    }

}

export const onGetFolderItems = async (user : User, item : VideoFolderItem | MusicFolderItem, _customer ? : User): Promise<(MusicFolderItem | VideoFolderItem)[]>=>{
    try {
        const customer : User = _customer? _customer : {userId : "123"} as User
        const res = await axios.post(`${maiPath}/get-folder-items`,{user,item,customer})
        if(res.status == 200 && res.data.success){
            return res.data.items as (MusicFolderItem | VideoFolderItem)[]
        }
        return []
    } catch (error) {
        console.log(error);
        return []
        
    }
}

export const getFolderItems = async(user : User) :  Promise<(MusicFolderItem | VideoFolderItem)[]>=>{
    try {
        const res = await axios.post(`${maiPath}/get-folder-view-items`,{user})
        if(res.status == 200 && res.data.success){
            const data : (MusicFolderItem | VideoFolderItem) [] = res.data.items
            return data
        }
        return []
    } catch (error) {
        console.log(error);
        return []        
    }
}

export const getFolderItem = async (id : string) : Promise<MusicFolderItem | null>=>{
    try {
        const res = await axios.post(`${maiPath}/get-folder-item`,{id})
        if(res.status == 200 && res.data.success){
            return res.data.item as MusicFolderItem
        }else{
            return null
        }
    } catch (error) {
        console.log(error);
        return null
        
    }
}

export const getFileContent = async(item : MusicFolderItem,user : User)=>{
    try {
        const res = await axios.post(`${maiPath}/get-file-content`,{item,user})
        if(res.status == 200 && res.data.success){
            return res.data.file as ContentFile
        }
        return null
    } catch (error) {
        console.log(error);
        return null
        
    }
}


export const getMusicAlbum = async (item : MusicFolderItem)=>{
    try {
        const res = await axios.post(`${maiPath}/get-music-album`,{item})
        return res.data.album as MusicFolderItem[]
    } catch (error) {
        console.log(error);
        return []
        
    }
}
const generatePaidContentIdFromItemAndUser = (item : MusicFolderItem, user : User)=>{
    return user.userId+"_"+item.content.contentId
}
export const onGetPaidContent = async(item : MusicFolderItem, user : User,onResult : (isPaid : boolean)=>void)=>{
 const id = generatePaidContentIdFromItemAndUser(item,user)
 if(!item.isPaid){
    const paidContentDoc = doc(db,`${zathuPath}/paidContents/${id}`)
    const snapshot = await getDoc(paidContentDoc)
    return onResult(snapshot.exists())

    
 }

}


export const likeMusic = async(item : MusicFolderItem, user : User)=>{
    try {
        const res = await axios.post(`${maiPath}/like`,{item,user})
        if(res.status == 200 && res.data.success){
            return true
        }
    } catch (error) {
        console.log(error);
        
    }
    return false
}

export const getLikeCount = async (item : MusicFolderItem)=>{
    try {
        const res = await axios.post(`${maiPath}/like-count`,{item})
        if(res.status == 200 && res.data.success){
            return res.data.count as number
        }

    } catch (error) {
        console.log(error);
        
    }
    return 0
}
export const getUserLike = async (item : MusicFolderItem,user : User)=>{
    try {
        const res = await axios.post(`${maiPath}/get-user-like`,{item,user})
        if(res.status == 200 && res.data.success){
            return res.data.like 
        }

    } catch (error) {
        console.log(error);
        
    }
}

export const comment = async(comment : Comment, followComment : Comment | null = null)=>{
    try {
        const length = followComment ? followComment.id : false
        await axios.post(`${maiPath}/comment`,{comment : {...comment,length}})
        
    } catch (error) {
        console.log(error);
        
    }
}

export const getComments = async(item : MusicFolderItem, comment : Comment | null = null)=>{
    try {
        const length = comment ? comment.id : false
    const res = await axios.post(`${maiPath}/get-comments`,{item,length})
    if(res.status == 200 ){
        return res.data.comments as Comment[]
    }
    } catch (error) {
        console.log(error);
        
    }
    return []
}


export const onListenViewIncrement = async (item : MusicFolderItem | VideoFolderItem)=>{
    try {
        await axios.post(`${maiPath}/listen-view-increment`,{item})
    } catch (error) {
        console.log(error);
        
    }

}

export const onListeToItemChanges = async(item : MusicFolderItem,onResult : (item : MusicFolderItem) => void) =>{
    try {
        const myDoc = doc(db,`${zathuPath}/folders/${item.owner.userId}/folder/${item.folderId}`)
        onSnapshot(myDoc,(snapshot)=>{
            if(snapshot.exists()){
                onResult(snapshot.data() as MusicFolderItem)
            }
        })
    } catch (error) {
        console.log(error);
        
    }
}


export const getFilteredItems = async(user : User)=>{
    const res = await axios.post(`${maiPath}/get-filtered-items`,{user})
    if(res.status == 200){
        return res.data.items as MusicRowProps[]
    }
    return []
}

export const getCommentsCount = async(item : MusicFolderItem) : Promise<number>=>{
    try {
        const res = await axios.post(`${maiPath}/get-comments-count`,{item})
        if(res.status == 200){
            return res.data.count
        }
    } catch (error) {
        console.log(error);
        
    }
    return 0
}

export const getPromotions = async(user : User)=>{
    try {
        const res = await axios.post(`${maiPath}/get-promotions`,{user})
        if(res.status == 200){
            return res.data.promotions as Promotion[]
        }
    } catch (error) {
        console.log(error);
        
    }
    return []
}