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
  SERIES = "SERIES",
  VIDEO = "VIDEO"

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
  avatar ? : string
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
  views: number | undefined;
  listens ?: number;
  director: string;
  cast: string[];
  duration: number; // in seconds
  rating: string; // "PG-13", "R", etc.
}



export interface Series {
  name : string;
  id : string;
  owner : User;
  uploadDate : Date;
  numberOfSeasons ? : number;
  isTranslated : boolean;
  actors : string[];
  description : Description;
  licence : LicenseType;
  pricing : Pricing;
  thumbnail : string;
  isPublished : boolean;

}

export interface Season{
  seasonNumber : number;
  seriesId : string;
  seasonName : string;
  numberOfEpisodes : number;
  description : Description;
  seasonId : string;
  thumbNail ? : string;
  isPublished : boolean
}

export interface Episode{
  episodeNumber: number;
  id : string;
  name : string;
  seasonId : string;
  seriesId : string;
  description : Description;
  content : VideoFolderItem;
  isPublished : boolean
}

export interface Description{
  heading : string;
  content : string;
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
  isPaid ? : boolean;
  commission ?: number;
  tax ?: number;
  total : number;
  isPublished : boolean;
  isTranslated : boolean;


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


// Types based on the provided interfaces
export enum MyPromotionType {
  SLIDER = "SLIDER",
  ROW_ITEM = "ROW_ITEM",
  ARTIST_ROW = "ARTIST_ROW",
  CUSTOM_GROUP = "CUSTOM_GROUP",
  ALBUM = "ALBUM"
}

export enum PromotionStatus {
  ACTIVE = "ACTIVE",
  FROZEN = "FROZEN",
  EXPIRED = "EXPIRED",
  DELETED = "DELETED",
  SCHEDULED = "SCHEDULED"
}

export interface Promotion {
  id: string;
  musicItem: MusicFolderItem;
  type: PromotionType;
  groupName?: string;
  startDate: Date;
  endDate: Date;
  onExpiry: 'freeze' | 'delete';
  priority: number;
  status: PromotionStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}




export interface PromotionSummary {
  totalPromotions: number;
  activePromotions: number;
  scheduledPromotions: number;
  expiredPromotions: number;
  frozenPromotions: number;
  
  existingPromotionGroups: string[];
  promotionsByGroup: {
    groupName: string;
    count: number;
    activeCount: number;
  }[];
  
  promotionsByType: {
    type: PromotionType;
    count: number;
    activeCount: number;
  }[];
  
  upcomingExpirations: {
    promotionId: string;
    promotionName: string;
    endDate: Date;
    daysUntilExpiry: number;
  }[];
  
  recentlyAdded: {
    promotionId: string;
    promotionName: string;
    startDate: Date;
    type: PromotionType;
  }[];
  
  performanceMetrics?: {
    totalImpressions: number;
    averageClickThroughRate: number;
    bestPerformingPromotion?: {
      id: string;
      name: string;
      clickThroughRate: number;
    };
  };
  
  highPriorityPromotions: number;
  mediumPriorityPromotions: number;
  lowPriorityPromotions: number;
  
  promotionsByContentType: {
    contentType: 'Album' | 'Playlist' | 'Track' | 'Artist';
    count: number;
  }[];
  
  dateRange: {
    earliestStart: Date;
    latestEnd: Date;
  };
}


// export const getDefaultPromotionSummary = (): PromotionSummary => {
//   const now = new Date();
//   const thirtyDaysFromNow = new Date();
//   thirtyDaysFromNow.setDate(now.getDate() + 30);
  
//   return {
//     totalPromotions: 0,
//     activePromotions: 0,
//     scheduledPromotions: 0,
//     expiredPromotions: 0,
//     frozenPromotions: 0,
    
//     existingPromotionGroups: [],
//     promotionsByGroup: [],
    
//     promotionsByType: [
//       { type: PromotionType.SLIDER, count: 0, activeCount: 0 },
//       { type: PromotionType.ROW_ITEM, count: 0, activeCount: 0 },
//       { type: PromotionType.ARTIST_ROW, count: 0, activeCount: 0 },
//       { type: PromotionType.CUSTOM_GROUP, count: 0, activeCount: 0 }
//     ],
    
//     upcomingExpirations: [],
//     recentlyAdded: [],
    
//     performanceMetrics: {
//       totalImpressions: 0,
//       averageClickThroughRate: 0,
//       bestPerformingPromotion: {
//         id: "",
//         name: "",
//         clickThroughRate: 0
//       }
//     },
    
//     highPriorityPromotions: 0,
//     mediumPriorityPromotions: 0,
//     lowPriorityPromotions: 0,
    
//     promotionsByContentType: [
//       { contentType: 'Album', count: 0 },
//       { contentType: 'Playlist', count: 0 },
//       { contentType: 'Track', count: 0 },
//       { contentType: 'Artist', count: 0 }
//     ],
    
//     dateRange: {
//       earliestStart: now,
//       latestEnd: thirtyDaysFromNow
//     }
//   };
// };

// export const getDefaultDetailedPromotionSummary = (): DetailedPromotionSummary => {
//   const baseSummary = getDefaultPromotionSummary();
  
//   return {
//     ...baseSummary,
    
//     promotionsByGenre: [],
    
//     promotionsByOwner: [],
    
//     averagePromotionDuration: 0,
//     shortestActivePromotion: 0,
//     longestActivePromotion: 0,
    
//     recentlyModified: [],
    
//     conversionMetrics: {
//       totalConversions: 0,
//       conversionRate: 0,
//       revenueGenerated: 0
//     }
//   };
// };
export interface DetailedPromotionSummary extends PromotionSummary {
  promotionsByGenre: {
    genre: string;
    count: number;
  }[];
  
  promotionsByOwner: {
    ownerId: string;
    ownerName: string;
    count: number;
  }[];
  
  averagePromotionDuration: number; 
  shortestActivePromotion: number; 
  longestActivePromotion: number; 
  recentlyModified: {
    promotionId: string;
    promotionName: string;
    modifiedDate: Date;
    modifiedBy: string;
    changeType: 'created' | 'updated' | 'statusChanged';
  }[];
  
  conversionMetrics?: {
    totalConversions: number;
    conversionRate: number;
    revenueGenerated: number;
  };
}

export  interface PromotionGroup {
  items: MusicFolderItem[];
  name: string;
  type: PromotionType;
  groupName?: string;
}



export interface PromotionSlotBase {
  type: MyPromotionType;
  title: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  groupName: string;
  availableSlots: number;
  totalSlots: number;
}

export interface SliderPromotion extends PromotionSlotBase {
  type: MyPromotionType.SLIDER;
  id : string;
  startDate  : Date
}

export interface RowPromotion extends PromotionSlotBase {
  type: MyPromotionType.ROW_ITEM;
  rows: MusicRow[];
}

export interface ArtistPromotion extends PromotionSlotBase {
  type: MyPromotionType.ARTIST_ROW;
  startDate  : Date
}

export interface AlbumPromotion extends PromotionSlotBase {
  type: MyPromotionType.ALBUM,
  startDate  : Date
}

export type PromotionType = 'Slider' | 'Row' | 'Artist' | 'Album';
export type PromotionSlot = SliderPromotion | RowPromotion | ArtistPromotion | AlbumPromotion;

export interface MusicRow {
  id: string;
  name: string;
  price: number;
  availableSlots: number;
  totalSlots: number;
  duration: string;
  description?: string;
  features?: string[];
  type : any;
  startDate  : Date
}

export interface Artist {
  id: string;
  name: string;
  songs: string[];
  albums: string[];
  avatar?: string;
  bio?: string;
  genres?: string[];
}

export interface UserContent {
  song: string;
  artist: string;
  album: string;
  duration: string;
}

export interface PromotionSlotProps {
  type: PromotionType;
  title: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  groupName: string;
  availableSlots: number;
  totalSlots: number;
  rows?: MusicRow[];
  isSelected: boolean;
  onSelect: () => void;
}

export interface RowPromotionSlotProps {
  id: string;
  name: string;
  price: number;
  availableSlots: number;
  totalSlots: number;
  duration: string;
  isSelected: boolean;
  onSelect: () => void;
  description?: string;
  features?: string[];
}

export interface PurchaseDialogProps {
  selectedSlot: string;
  selectedRow: MusicRow | null;
  userContent: UserContent;
  setUserContent: (content: UserContent) => void;
  onPurchase: () => void;
  onCancel: () => void;
  artist: Artist;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PromotionPurchaseRequest {
  promotionType: PromotionType;
  rowId?: string;
  content: UserContent;
  artistId: string;
  duration: string;
}

export interface PromotionPurchaseResponse {
  purchaseId: string;
  promotionType: PromotionType;
  rowName?: string;
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expired';
}

export interface PromotionFormData {
  promotionType: PromotionType;
  rowId?: string;
  songId?: string;
  albumId?: string;
  duration: string;
  agreeToTerms: boolean;
}

export interface Toast {
  id: string;
  title: string;
  description: string;
  variant: 'default' | 'destructive' | 'success';
}

export interface PromotionFilters {
  type?: PromotionType;
  minPrice?: number;
  maxPrice?: number;
  availableOnly: boolean;
}

export interface MockPromotionData {
  slider: SliderPromotion;
  rows: MusicRow[];
  artist: ArtistPromotion;
  album: AlbumPromotion;
}





export interface VideoPromotionAdvert{
  price : number;
  per :  "Day" ,
  availableSlots : number;
  totalSlots : number;
  slots : VideoPromotionSlot[]
}

export interface VideoFolderPromotion {
  id: string;
  item: VideoFolderItem;
  startDate: Date;
  endDate: Date;
  durationCount: number;
  durationUnit: 'days' | 'weeks' | 'months';
  amountPaid?: number;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  promotionType: 'featured' | 'spotlight' | 'trending' | 'premium';
  priority: number;
  impressions: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  slotId : string
}

export interface VideoPromotionSlot {
  id: string;
  type: 'featured' | 'spotlight' | 'trending' | 'premium';
  title: string;
  description: string;
  price: number;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months';
  features: string[];
  availableSlots: number;
  totalSlots: number;
  position: string;
  visibility: 'high' | 'medium' | 'low';
}

export interface VideoFolderCollection{
  item : VideoFolderItem,
  count : number,
}


export interface Ticket{
  name : string;
  description : string;
  categories : TicketCategory[];
  id : string;
  parentId : string;
  creator : User;
  ticketPoster : string;
  count : TicketCount;
  isPurchased : boolean;
  isPoster : boolean;
  eventStartDate : Date;
  eventEndDate ? : Date;
  location ? : TicketLocation;
  whatToExpect ? : TicketWhatToExpect;
  purchasedBy ? : string;
  datePurchased ? : Date;
  purchasedCategory ? : TicketCategory

}
export interface TicketLocation{
  name : string,
  description : string
}
export interface TicketWhatToExpect{
  expectations : string[]
}
export interface TicketCount{
  total : number;
  purchased : number;
  available : number;
}

export interface TicketCategory{
  name : string;
  price : number;
  commission ? : CommissionProp

}
export interface CommissionProp {
    commission: number;
    tax: number;
    total: number;
}