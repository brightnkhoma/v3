export const zathuPath = "zathu/play" as const


export enum AccountType {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
  FAMILY = "FAMILY",
}

export enum ContentType {
  MOVIE = "MOVIE",
  MUSIC_TRACK = "MUSIC_TRACK",
  MUSIC_ALBUM = "MUSIC_ALBUM",
  PODCAST = "PODCAST",

}

export enum LicenseType {
  STREAM_ONLY = "STREAM_ONLY",
  DOWNLOADABLE = "DOWNLOADABLE",
  PURCHASABLE = "PURCHASABLE",
  STANDARD = "STANDARD",
  CREATIVE_COMMONS = "CREATIVE_COMMONS",
  CUSTOM = "CUSTOM",
}

export enum TransactionType {
  STREAMING_ACCESS = "STREAMING_ACCESS",
  DOWNLOAD_PURCHASE = "DOWNLOAD_PURCHASE",
  OWNERSHIP_PURCHASE = "OWNERSHIP_PURCHASE",
  SUBSCRIPTION_FEE = "SUBSCRIPTION_FEE",
}

export interface User {
  userId: string;
  name: string;
  email: string;
  joinDate: Date;
  accountType: AccountType;
  paymentMethods: PaymentMethod[];
  library: Library;
}

export interface Content {
    genre : Genre;
  contentId: string;
  ownerId : string;
  title: string;
  description: string;
  releaseDate: Date;
  genres: string[];
  type: ContentType;
  license: License;
  pricing: Pricing;
  thumbnail : string;
  director ? : string;
  cast ? : string[];
  rating ? : string;
  artists ? : string[];
  album ? : string;
  trackNumber? : number;
}

export interface Movie extends Content {
  director: string;
  cast: string[];
  duration: number; // in seconds
  rating: string; // "PG-13", "R", etc.
}

export interface Music extends Content {
  artists: string[];
  album: string;
  duration: number; 
  trackNumber?: number; 
  listens ? : number

}

export interface License {
  licenseId: string;
  type: LicenseType;
  terms: string;
  allowsStreaming: boolean;
  allowsDownload: boolean;
  allowsPurchase: boolean;
}

export interface Transaction {
  transactionId: string;
  user: User | string; // Can be a reference (ID) or populated object
  content: Content | string;
  transactionDate: Date;
  type: TransactionType;
  amount: number;
  paymentMethod: string;
}

export interface Library {
  libraryId: string;
  owner: User | string;
  purchasedContent: Content[] | string[]; 
  downloadedContent: Content[] | string[];
}

export interface Pricing {
  isPublic: any;
  price: number;
  basePrice: number;
  rentalPrice?: number;
  subscriptionDiscount?: number;
  currency: string; 
}

export interface PaymentMethod {
  methodId: string;
  type: "credit_card" | "paypal" | "crypto";
  details: Record<string, unknown>; 
}

export const videoFormats: string[] = [
  "mp4",   // MPEG-4
  "mkv",   // Matroska
  "webm",  // Web Media
  "avi",   // Audio Video Interleave
  "mov",   // Apple QuickTime
  "flv",   // Flash Video
  "wmv",   // Windows Media Video
  "m4v",   // MPEG-4 Video
  "3gp",   // 3GPP multimedia
  "mpeg",  // MPEG Video
  "ts",    // MPEG Transport Stream
  "ogv"    // Ogg Video
] as const

export const audioFormats: string[] = [
  "mp3",   // MPEG Audio Layer III
  "wav",   // Waveform Audio
  "aac",   // Advanced Audio Coding
  "ogg",   // Ogg Vorbis
  "flac",  // Free Lossless Audio Codec
  "alac",  // Apple Lossless
  "wma",   // Windows Media Audio
  "m4a",   // MPEG-4 Audio
  "aiff",  // Audio Interchange File Format
  "opus",  // Opus Audio
  "amr"    // Adaptive Multi-Rate
] as const


export interface ContentFile{
  uri : string,
  size : number;
  duration : string;
  id : string,
  ownerId : string;
  name : string
}

export interface ContentItem {
  id: string 
  title: string
  artist: string
  type: 'music' | 'movie'
  image: string
  plays?: string
  views?: string
  duration: string
  year: string
  genre?: string
  description?: string
  tags ? : string[]
  price ? : number,
  ownerId : string
}

export interface LikedContent{
  id : string,
  date : Date,
  type : ContentType;
  name : string;
  thumbNail ? : string
}

export interface PurchasedContent extends LikedContent{
  txnId : string,
  status : 'pending' | 'processed';
  price : number;
  ownerId : string
}

export interface UserWallet{
  balance : number;
  lastUpdatedDate : Date;
  userId : string;
}

export type MusicRowNames = "Hotlist" | "Local" | "Gospel" | "Hip-Hop" | "RNB" | "Weekly-Best" | "Monthly-Best" | "Yearly-Best" | "Artists" | "Albums"
export interface MusicRowItemProps extends MusicFolderItem{}

export interface MusicRowProps{
      name : MusicRowNames,
      items : MusicRowItemProps[]
}

export type MusicFolderType = "Album" | "Playlist" | "Default"

export interface Folder{
  folderName : string;
  folderId : string;
  owner : User;
  folderPoster : string; 
  price ? : Pricing;
  isPoster : boolean;
  dateCreated ? : Date;
  isPaid ? : boolean

}


export interface MusicFolderItem extends Folder{
    artistName : string;
    featuredArtists : string[];
    type : MusicFolderType;
    content : Music;

}

export type VideoFolderType = "Movie" | "Series" | "Music-Video" | "Podcast"

export interface VideoFolderItem extends Folder{
  actorName : string;
  featuredActors : string[];
  name : string;
  content : Movie;
  type : VideoFolderType

}

export const musicGenres: string[] = [
  "Pop",
  "Rock",
  "Hip Hop",
  "Rap",
  "R&B",
  "Soul",
  "Jazz",
  "Classical",
  "Country",
  "Reggae",
  "Dancehall",
  "Afrobeats",
  "House",
  "Gospel",
  "Trap",
  "Soundtrack",
] as const;

export type Genre =  "Pop"|
  "Rock"|
  "Hip Hop"|
  "Rap"|
  "R&B"|
  "Soul"|
  "Jazz"|
  "Classical"|
  "Country"|
  "Reggae"|
  "Dancehall"|
  "Afrobeats"|
  "House"|
  "Gospel"|
  "Trap"|
  "Soundtrack"


export interface Comment{
  user : User;
  content : string;
  id : string;
  date : Date;
  followUpComments : Comment[];
  contentId : string;
  likes : number;
  dislikes : number;
  length ? : string | boolean
}
// export interface FileToPlay {
//   file : ContentFile,
//   item : MusicFolderItem
// }

export interface FilteredContent{
  name : string;
  items : MusicFolderItem[]
}