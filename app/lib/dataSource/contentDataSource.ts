import { audioFormats, Content, ContentFile, ContentItem, ContentType, Folder, LicenseType, LikedContent, Movie, Music, MusicFolderItem, MusicFolderType, PurchasedContent, User, UserWallet, VideoFolderItem, VideoFolderType, videoFormats, zathuPath,Comment, FilteredContent, MusicRowProps, Promotion, MockPromotionData, SliderPromotion, MusicRow, AlbumPromotion, VideoFolderPromotion, VideoPromotionAdvert, VideoFolderCollection, Ticket, ArtistPromotion, Series, Season, Episode } from "../types"
import axios from "axios"
import { maiPath } from "./global"
import { UploadTask, ref, uploadBytesResumable, UploadTaskSnapshot, getDownloadURL } from "firebase/storage"
import { db, storage } from "../config/firebase"
import {v4 as uuidv4} from 'uuid'
import { collection, deleteDoc, doc, DocumentChangeType, DocumentData, getDoc, getDocs, onSnapshot, orderBy, query, QueryDocumentSnapshot, QuerySnapshot, setDoc, where } from "firebase/firestore"
import { firestoreTimestampToDate } from "../config/timestamp"
// export const dbPath = "mstream/all"


export async function downloadFileWithProgress(
  url: string,
  onProgress: (progress: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error(`Download failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send();
  });
}

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
                views: 0
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

   export const purchase = async(user : User, content : MusicFolderItem | VideoFolderItem,onSuccess : ()=> void, onFailure : ()=> void)=>{
           const res = await axios.post(`${maiPath}/purchase`,{user,content})
           if(res.status == 200){
            return onSuccess()
           }
           onFailure()
       
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
            const myDoc = doc(db,`${zathuPath}/balance/${userId}`)
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
        isPoster: true,
        total: 0
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

export const getFolders = async(user : User,type : "audio" | "video" | undefined = undefined)=>{
    try {
        const y : VideoFolderType [] = ["Movie","Music-Video","Series"]
        const x : MusicFolderType[] = ["Album","Default","Playlist"]
       

        const myCollection = collection(db,`${zathuPath}/folders/${user.userId}/folder`)
        let myQuery = query(myCollection,where("isPoster","==",true))
        if(type){
            myQuery = query(myQuery,where("type","in", type == "video" ? y : x))
        }
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
export const listenToFolderChanges = async(user : User,onResult : (type : DocumentChangeType, data : VideoFolderItem | MusicFolderItem)=> void )=>{
    try {
        const myCollection = collection(db,`${zathuPath}/folders/${user.userId}/folder`)
        const myQuery = query(myCollection,where("isPoster","==",true))
        onSnapshot(myQuery,(snapshot)=>{
            snapshot.docChanges().forEach(change =>{
                const type = change.type
                const doc = change.doc.data() as VideoFolderItem | MusicFolderItem
                onResult(type,doc)


            })
        })
    } catch (error) {
        console.log(error);
        
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

export const getFileContent = async(item : MusicFolderItem | VideoFolderItem,user : User)=>{
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


export const getMusicAlbum = async (item : MusicFolderItem, user : User)=>{
    try {
        const res = await axios.post(`${maiPath}/get-music-album`,{item,user})
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

export const search = async(text : string)=>{
    try {
        const res = await axios.post(`${maiPath}/search`,{text})
        if(res.status == 200){
            return res.data.items as MusicFolderItem[]
        }
    } catch (error) {
        console.log(error);
    }
    return []
}


export const deleteFolderItem = async(item : MusicFolderItem, user : User, onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
        const res = await axios.post(`${maiPath}/delete-folder-item`,{item,user})
        if(res.status == 200){
            return onSuccess()
        }
        onFailure()
    } catch (error) {
        console.log(error);
        onFailure()
        
    }

}
export const deleteMoreFolderItem = async(items : MusicFolderItem[], user : User, onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
        const res = await axios.post(`${maiPath}/delete-more-folder-items`,{items,user})
        if(res.status == 200){
            return onSuccess()
        }
        onFailure()
    } catch (error) {
        console.log(error);
        onFailure()
        
    }

}
export const moveFolderItem = async(item : MusicFolderItem, destinationFolder : MusicFolderItem, onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
        const res = await axios.post(`${maiPath}/move-folder-item`,{item,destinationFolder})
        if(res.status == 200){
            return onSuccess()
        }
        onFailure()
    } catch (error) {
        console.log(error);
        onFailure()
        
    }

}
export const moveMoreFolderItem = async(items : MusicFolderItem[], destinationFolder : MusicFolderItem, onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
        const res = await axios.post(`${maiPath}/move-more-folder-items`,{items,destinationFolder})
        if(res.status == 200){
            return onSuccess()
        }
        onFailure()
    } catch (error) {
        console.log(error);
        onFailure()
        
    }

}


export const getItemById = async(userId : string, itemId : string)=>{
    const res = await axios.post(`${maiPath}/get-item-by-id`,{userId,itemId})
    if(res.status == 200){
        return res.data.item as MusicFolderItem
    }
    return null
}


export const getVideos = async(lastDoc : VideoFolderItem | undefined = undefined,lastDoc1 : VideoFolderItem | undefined = undefined) : Promise<VideoFolderItem[]>=>{
    try {
        const res = await axios.post(`${maiPath}/get-videos`,{lastDoc,lastDoc1})
        if(res.status == 200){
            return res.data.items as VideoFolderItem[]
        }
        return []
    } catch (error) {
        console.log(error);
        return []
        
    }
}
export const getVideoAlbum = async(item : VideoFolderItem, user : User) : Promise<VideoFolderItem[]>=>{
    try {
        const res = await axios.post(`${maiPath}/get-video-album`,{item,user})
        if(res.status == 200){
            return res.data.items as VideoFolderItem[]
        }
        return []
    } catch (error) {
        console.log(error);
        return []
    }
}


export const getVideoFolderItems = async(user : User)=>{
    try {
        const res = await axios.post(`${maiPath}/get-video-folder-album`,{user})
        if(res.status== 200){
            return res.data.items as VideoFolderItem[]
        }
        return []
    } catch (error) {
        console.log(error);
        return []
        
    }
}

export const getVideoItem = async(id : string,_user : User | null = null)=>{
    try {
        const user : User =_user || {
            userId: "",
            name: "",
            email: "",
        } as User
        const res = await axios.post(`${maiPath}/get-video-item`,{id,user})
        if(res.status == 200){
            return res.data.item as VideoFolderItem
        }
        return null
    } catch (error) {
        console.log(error);
        return null
        
    }
}


export const getVideoFolderItemsbyId = async(id : string, user : User)=>{
   try {
        const res = await axios.post(`${maiPath}/get-video-folder-items`,{id,user})
        if(res.status == 200){
            return res.data.items as VideoFolderItem[]
        }
        return []
    } catch (error) {
        console.log(error);
        return []
        
    }
}
export const getRelatedVideos = async(item : VideoFolderItem, user : User)=>{
   try {
        const res = await axios.post(`${maiPath}/get-related-videos`,{item,user})
        if(res.status == 200){
            return res.data.items as VideoFolderItem[]
        }
        return []
    } catch (error) {
        console.log(error);
        return []
        
    }
}

export const getPromotionAdvert = async()=>{
    try {
        const res = await axios.post(`${maiPath}/get-promotion-advert`)
        if(res.status == 200){
            return res.data.mock as MockPromotionData
        }
        return null
    } catch (error) {
        console.log(error);
        return null
        
    }
}

export const purchasePromotionSlider = async(user : User, slider : SliderPromotion,onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
        const res = await axios.post(`${maiPath}/purchase-promotion-slider`,{user,slider})
        if(res.status == 200){
           return onSuccess();
        }
    } catch (error) {
        console.log(error);        
    }
    onFailure()

}
export const purchasePromotionRow = async(user : User, row : MusicRow,onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
        const res = await axios.post(`${maiPath}/purchase-promotion-row`,{user,row})
        if(res.status == 200){
           return onSuccess();
        }else{
                onFailure()

        }
    } catch (error) {
        console.log(error);      
            onFailure()
  
    }

}
export const purchasePromotionArtist = async(user : User,onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
        const res = await axios.post(`${maiPath}/purchase-promotion-artist`,{user})
        if(res.status == 200){
           return onSuccess();
        }else{
                onFailure()

        }
    } catch (error) {
        console.log(error);      
            onFailure()
  
    }

}
export const purchasePromotionAlbum = async(user : User,item : MusicFolderItem,onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
        const res = await axios.post(`${maiPath}/purchase-promotion-album`,{user,item})
        if(res.status == 200){
           return onSuccess();
        }else{
                onFailure()

        }
    } catch (error) {
        console.log(error);      
            onFailure()
  
    }

}

export const getPromotedMusic = async (_user : User )=>{
    try {
        const user : User = (_user && _user.userId && _user.userId.length > 5) ? _user : {userId : "__"} as User
        const res = await axios.post(`${maiPath}/get-promoted-music`,{user})
        if(res.status == 200){
            return res.data.data as {
            sliders: MusicFolderItem[];
            albums: AlbumPromotion[];
            artists: User[];
            rowGroups: {
                [key: string]: MusicFolderItem[];
            };
                }
    }
    return null
        
    } catch (error) {
        console.log(error);
        return  null
        
    }
}


export const getVideoPromotionAdvert = async()=>{
    try {
        const res = await axios.post(`${maiPath}/get-video-promotion-advert`)
        if(res.status == 200){
            return res.data.advert as VideoPromotionAdvert
        }

    } catch (error) {
        console.log(error);        
        return null;
    }
}

export const onVerifyPaidContent= async(item : VideoFolderItem,user : User, onSuccess : (x : boolean)=> void, onFailure : ()=> void)=>{
    try {
        const res = await axios.post(`${maiPath}/verify-paid-content`,{item,user})
        if(res.status == 200){
           return onSuccess(res.data.success as boolean)
        }
    } catch (error) {
        console.log(error);        
    }
    return onFailure();
}

export const listenToViews = async(item : VideoFolderItem | MusicFolderItem, onResult : (count : number)=> void)=>{
    try {
      const myDoc = doc(db,`${zathuPath}/folders/${item.owner.userId}/folder/${item.content.contentId}`)
      onSnapshot(myDoc,(snapshot)=>{
        if(snapshot.exists()){
            const data = snapshot.data() 
            onResult(data.listens)
        }
      })

    } catch (error) {
        console.log(error);
        
    }
}
export const getViews = async(item : VideoFolderItem | MusicFolderItem)=>{
    try {
      const myDoc = doc(db,`${zathuPath}/folders/${item.owner.userId}/folder/${item.content.contentId}`)
      const snapshot = await getDoc(myDoc)
      if(snapshot.exists()){
        
        return snapshot.data().content.listens as number
      }     

    } catch (error) {
        console.log(error);
        
    }
    return 0
}


export const createVideoPromotionAdvert = async(user : User, videoFolderPromotion : VideoFolderPromotion, onSuccess : ()=> void, onFailure : ()=> void )=>{
    try {
        const res = await axios.post(`${maiPath}/create-video-folder-promotion`,{user,videoFolderPromotion})
        if(res.status == 200){
           return onSuccess()
        }
        onFailure()
    } catch (error) {
        console.log(error);
        onFailure()
    }
}


export const getUserVideoPromotions = async(user : User)=>{
    try {
        const res = await axios.post(`${maiPath}/get-user-video-promotions`,{user})
        if(res.status == 200){
            const items = res.data.items as VideoFolderPromotion[]
            return items.map(x=>({...x,endDate : new Date(x.endDate),startDate : new Date(x.startDate)})) as VideoFolderPromotion[]
            
        }
        
    } catch (error) {
        console.log(error);
        
    }
    return []
}

export const getVideoCollection = async (userId : string)=>{
    try {
        const res = await axios.post(`${maiPath}/get-video-collection`,{user : {userId}})
    if(res.status == 200){
        return res.data.items as VideoFolderCollection[]
    }
    } catch (error) {
        console.log(error);
        
    }
    return []
}


export const subscribe = async (user : User, userId : string)=>{
    try {
    const res = await axios.post(`${maiPath}/subscribe`,{user,userId})
    if(res.status == 200) return true;
    } catch (error) {
        console.log(error);
        
    }
    return false
}

export const checkIfSubscribed = async(user : User, userId : string)=>{
        try {
    const res = await axios.post(`${maiPath}/is-subscribed`,{user,userId})
    if(res.status == 200) return res.data.check as boolean;
    } catch (error) {
        console.log(error);
    }
    return false
}

export const getSubscriptions = async(user : User)=>{
    try {
    const res = await axios.post(`${maiPath}/get-subscriptions`,{user})
    if(res.status == 200) return res.data.items as User[];
    } catch (error) {
        console.log(error);
    }
    return []
}


export const getSeries = async(lastDoc : VideoFolderItem | undefined = undefined) : Promise<VideoFolderItem[]>=>{
    try {
        const res = await axios.post(`${maiPath}/get-series`,{lastDoc})
        if(res.status == 200){
            return res.data.items as VideoFolderItem[]
        }
        return []
    } catch (error) {
        console.log(error);
        return []
        
    }
}

export const getTickets = async():Promise<Ticket[]>=>{
    try {
        const res = await axios.post(`${maiPath}/get-tickets`)
        if(res.status == 200){
            return res.data.tickets as Ticket[]
        }
    } catch (error) {
        console.log(error);        
    }
    return []
}
export const getUserTickets = async(user : User):Promise<Ticket[]>=>{
    try {
        const res = await axios.post(`${maiPath}/get-user-tickets`,{user})
        if(res.status == 200){
            return res.data.tickets as Ticket[]
        }
    } catch (error) {
        console.log(error);        
    }
    return []
}
export const getTicketbyId = async(id : string):Promise<Ticket | null>=>{
    try {
        const res = await axios.post(`${maiPath}/get-ticket-by-id`,{id})
        if(res.status == 200){
            return res.data.ticket as Ticket
        }
    } catch (error) {
        console.log(error);        
    }
    return null
}

export const createTicket = async(ticket : Ticket,onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
            const res = await axios.post(`${maiPath}/generate-ticket`,{ticket})
            if(res.status==200) return onSuccess();

    } catch (error) {
        console.log();
        
    }
    onFailure()
}
export const updateTicket = async(ticket : Ticket,user : User,onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
            const res = await axios.post(`${maiPath}/update-ticket`,{ticket,user})
            if(res.status==200) return onSuccess();

    } catch (error) {
        console.log();
        
    }
    onFailure()
}
export const replicateTicket = async(ticket : Ticket,user : User,count : number,onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
            const res = await axios.post(`${maiPath}/replicate-ticket`,{ticket,user,count})
            if(res.status==200) return onSuccess();

    } catch (error) {
        console.log();
        
    }
    onFailure()
}
export const deleteTicket = async(ticket : Ticket,user : User,onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
            const res = await axios.post(`${maiPath}/delete-ticket`,{ticket,user})
            if(res.status==200) return onSuccess();

    } catch (error) {
        console.log();
        
    }
    onFailure()
}

3


export const listenToTicketChange = async(ticket : Ticket,user : User,onResult : (ticket : Ticket)=> void) =>{
    try {
          const docRef = doc(db, `${zathuPath}/tickets/all/${user.userId}/${ticket.parentId}/tickets/${ticket.parentId}`);
          onSnapshot(docRef,(change)=>{
            if(change.exists()){
                onResult(change.data() as Ticket)
            }
          })

    } catch (error) {
        console.log(error);
    }
}

export const payForTicket = async(ticket : Ticket, user : User, amount : number, categoryName : string,onSuccess : ()=> void,onFailure : ()=> void)=>{
    try {
        const res = await axios.post(`${maiPath}/pay-for-ticket`,{ticket,user,amount,categoryName})
        if(res.status == 200){
            return onSuccess()
        }
    } catch (error) {
        console.log(error);
        
    }
    onFailure()
  
}

export const getUserTicketCount = async(parentId : string, user : User)=>{
    try {
        const res = await axios.post(`${maiPath}/get-user-purchased-tickets-by-ticket-id-count`,{parentId,user})
        if(res.status == 200){
            return res.data.tickets.count as number
        }
    } catch (error) {
        console.log(error);
        
    }
    return 0
}
export const getUserTicketsByTicketId = async(parentId : string, user : User)=>{
    try {
        const res = await axios.post(`${maiPath}/get-user-purchased-tickets-by-ticket-id`,{parentId,user})
        if(res.status == 200){
            return res.data.tickets as Ticket[]
        }
    } catch (error) {
        console.log(error);
        
    }
    return []
}
export const getUserPurchasedItems = async (user : User, lastDoc : MusicFolderItem | VideoFolderItem | undefined  = undefined)=>{
    try {
         const res = await axios.post(`${maiPath}/get-user-purchased-contents`,{user,lastDoc})
        if(res.status == 200){
            return res.data.items as {items : (MusicFolderItem | VideoFolderItem)[], lastDoc : any}
        }
        
    } catch (error) {
        console.log(error);
        
    }
    return {} as {items : (MusicFolderItem | VideoFolderItem)[], lastDoc : any}
}



export const getUserMusicPromotions = async(user : User) =>{
    try {
    const res = await axios.post(`${maiPath}/get-user-music-promotion`,{user})
    if(res.status == 200){
        const data = res.data.items
        const items : (MusicRow | ArtistPromotion | SliderPromotion)[] = [...data.row,...data.slider,...data.artist,...data.album]
        return items
    }
     
    } catch (error) {
        console.log(error);
        
    }
    return []
}

export const deletePromotedMusic = async(user : User, promotion : (MusicRow | ArtistPromotion | SliderPromotion | AlbumPromotion),onSuccess : ()=> void, onFailure : ()=> void)=>{
    try {
        const res = await axios.post(`${maiPath}/delete-user-music-promotion`,{user,promotion})
    if(res.status == 200){
        return onSuccess()
    }
    } catch (error) {
        console.log(error);
        
    }
    onFailure()
}


export const createNewSeriesFolder = async (user : User, series : Series)=>{
    try {
    const res = await axios.post(`${maiPath}/create-new-series-folder`,{user,series})
    if(res.status == 200){
        return true;
    }

    } catch (error) {
        console.log(error);
        
    }
    return false
}
export const createSeason = async (user : User, season : Season)=>{
    try {
    const res = await axios.post(`${maiPath}/create-new-season-folder`,{user,season})
    if(res.status == 200){
        return true;
    }

    } catch (error) {
        console.log(error);
        
    }
    return false
}
export const createEpisode = async (user : User, episode : Episode,contentFile : ContentFile)=>{
    try {
    const res = await axios.post(`${maiPath}/create-new-folder-episode`,{user,episode,contentFile})
    if(res.status == 200){
        return true;
    }

    } catch (error) {
        console.log(error);
        
    }
    return false
}

export const getUserSeries = async (user : User)=>{
    try {
        const res = await axios.post(`${maiPath}/get-user-series`,{user})
    if(res.status == 200){
        return res.data.items as Series[];
    }        
    } catch (error) {
        console.log(error);
        
    }
    return []
}
export const getUserSeasonsById = async (user : User, seriesId : string)=>{
    try {
        const res = await axios.post(`${maiPath}/get-user-seasons-by-id`,{user,seriesId})
    if(res.status == 200){
        return res.data.items as Season[];
    }        
    } catch (error) {
        console.log(error);
        
    }
    return []
}
export const getEpisodesBySeasonId = async (user : User, seriesId : string, seasonId : string)=>{
    try {
        const res = await axios.post(`${maiPath}/get-user-seasons-episodes-by-id`,{user,seriesId,seasonId})
    if(res.status == 200){
        return res.data.items as Episode[];
    }        
    } catch (error) {
        console.log(error);
        
    }
    return []
}
export const getEpisodesAlbum = async (episode : Episode,user : User, lastDoc : QuerySnapshot<DocumentData,DocumentData> | undefined = undefined)=>{
    try {
        const res = await axios.post(`${maiPath}/get-episode-album`,{episode,user,lastDoc})
    if(res.status == 200){
        return res.data.items as VideoFolderItem[];
    }        
    } catch (error) {
        console.log(error);
        
    }
    return []
}
export const getEpisodeById = async (episodeId : string, user : User)=>{
    try {
        const res = await axios.post(`${maiPath}/get-episode-by-id`,{episodeId,user})
    if(res.status == 200){
        return res.data.item as Episode;
    }        
    } catch (error) {
        console.log(error);
        
    }
    return null
}
export const getUserSeriesById = async (user : User,seriesId : string)=>{
    try {
        const res = await axios.post(`${maiPath}/get-user-series-by-id`,{user,seriesId})
    if(res.status == 200){
        return res.data.item as Series;
    }        
    } catch (error) {
        console.log(error);
        
    }
    return null
}
export const getSeriesById = async (seriesId : string)=>{
    try {
        const res = await axios.post(`${maiPath}/get-series-by-id`,{seriesId})
    if(res.status == 200){
        return res.data.item as Series;
    }        
    } catch (error) {
        console.log(error);
        
    }
    return null
}
export const getSeriesSeasonById = async (seriesId : string)=>{
    try {
        const res = await axios.post(`${maiPath}/get-series-seasons-by-id`,{seriesId})
    if(res.status == 200){
        return res.data.items as Season[];
    }        
    } catch (error) {
        console.log(error);
        
    }
    return []
}
export const getSeriesSeasonEpisodesById = async (seasonId : string)=>{
    try {
        const res = await axios.post(`${maiPath}/get-series-seasons-season-by-id`,{seasonId})
    if(res.status == 200){
        return res.data.items as Episode[];
    }        
    } catch (error) {
        console.log(error);
        
    }
    return []
}
export const getUserSeasonById = async (user : User,seasonId : string)=>{
    try {
        const res = await axios.post(`${maiPath}/get-user-season-by-id`,{user,seasonId})
    if(res.status == 200){
        return res.data.item as Season;
    }        
    } catch (error) {
        console.log(error);
        
    }
    return null
}
export const getFolderSeries = async (lastDoc : QueryDocumentSnapshot<DocumentData,DocumentData> | undefined = undefined)=>{
    try {
        const res = await axios.post(`${maiPath}/get-folder-series`,{lastDoc})
    if(res.status == 200){
        return res.data.items as Series[];
    }        
    } catch (error) {
        console.log(error);
        
    }
    return null
}
export const getFolderSeriesSeasonCount = async (series : Series)=>{
    try {
        const res = await axios.post(`${maiPath}/get-folder-series-count`,{series})
    if(res.status == 200){
        return res.data.item as number;
    }        
    } catch (error) {
        console.log(error);
        
    }
    return null
}
export const updateEpisodePrice = async (user : User,episode : Episode, amount : number)=>{
    try {
        const res = await axios.post(`${maiPath}/update-episode-price`,{user,episode,amount})
    if(res.status == 200){
        return res.data.item as Episode;
    }        
    } catch (error) {
        console.log(error);
        
    }
    return null
}