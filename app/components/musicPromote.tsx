"use client"
import { useState, useContext, useEffect } from "react";
import { Plus, X, Music, Disc, Users, Sliders, Check, Info, Crown, Calendar, Clock, User, LogOut, FileEdit, Megaphone, Receipt, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { RootState, useAppSelector } from "../lib/local/redux/store";
import { MockPromotionData, MusicRow, PromotionType, UserContent as UserContentType, Artist, MusicFolderItem, SliderPromotion } from "../lib/types";
import { getPromotionAdvert, purchasePromotionAlbum, purchasePromotionArtist, purchasePromotionRow, purchasePromotionSlider } from "../lib/dataSource/contentDataSource";
import { AppContext } from "../appContext";



export const Promote = () => {
  const [selectedSlot, setSelectedSlot] = useState<PromotionType | null>(null);
  const [selectedRow, setSelectedRow] = useState<MusicRow | null>(null);
  const [mockPromotionData, setMockData] = useState<MockPromotionData>()
  const [loading, setLoading] = useState<boolean>(true)
  const {user} = useAppSelector((state : RootState)=> state.auth)
  const {global} = useContext(AppContext)!
  const {selectedMusicFolderItems} = global

  const mockArtist = {
    id : user.userId,
    name : user.name,
    songs : selectedMusicFolderItems,
    albums : [...new Set(selectedMusicFolderItems.map(y=> ({name : y.folderName, id : y.folderId})))]
  }
  const [userContent, setUserContent] = useState<UserContentType>({
    song: "",
    artist: mockArtist.name,
    album: "",
    duration: "24"
  });
  const isArtist = true
  const login = ()=>{}
  const logout = ()=>{}

  const getPData = async()=>{
    const x = await getPromotionAdvert()
    if(x){
      setMockData(x)
    }
    setLoading(false)
  }


  const handlePurchase = () => {
    const promotionType = selectedRow ? `${selectedRow.name} Row` : selectedSlot;
    toast(`Your content will be promoted in the ${promotionType} section.`,
    );
    setSelectedSlot(null);
    setSelectedRow(null);
  };


  useEffect(()=>{
    getPData()
  },[])


  if(loading){
    return(
      <div className="flex size-full justify-center items-center">
        <span className="text-4xl">Loading...</span>
      </div>
    )
  }


  if(!mockPromotionData){
    return(
      <div className="flex size-full justify-center items-center">
        <span className="text-4xl">Advert not available...</span>
      </div>
    )
  }

  const promotionSlots = [
    {
      type: "Slider" as PromotionType,
      title: mockPromotionData.slider.title,
      description: mockPromotionData.slider.description,
      price: mockPromotionData.slider.price,
      duration: mockPromotionData.slider.duration,
      features: mockPromotionData.slider.features,
      groupName: mockPromotionData.slider.groupName,
      availableSlots: mockPromotionData.slider.availableSlots,
      totalSlots: mockPromotionData.slider.totalSlots,
    },
    {
      type: "Row" as PromotionType,
      title: "Music Rows",
      description: "Promote your content in dedicated music rows",
      price: 0, 
      duration: "Variable",
      features: ["Targeted audience", "Medium visibility", "Various durations"],
      groupName: "Music Rows",
      availableSlots: mockPromotionData.rows.reduce((sum, row) => sum + row.availableSlots, 0),
      totalSlots: mockPromotionData.rows.reduce((sum, row) => sum + row.totalSlots, 0),
      rows: mockPromotionData.rows
    },
    {
      type: "Artist" as PromotionType,
      title: mockPromotionData.artist.title,
      description: mockPromotionData.artist.description,
      price: mockPromotionData.artist.price,
      duration: mockPromotionData.artist.duration,
      features: mockPromotionData.artist.features,
      groupName: mockPromotionData.artist.groupName,
      availableSlots: mockPromotionData.artist.availableSlots,
      totalSlots: mockPromotionData.artist.totalSlots,
    },
    {
      type: "Album" as PromotionType,
      title: mockPromotionData.album.title,
      description: mockPromotionData.album.description,
      price: mockPromotionData.album.price,
      duration: mockPromotionData.album.duration,
      features: mockPromotionData.album.features,
      groupName: mockPromotionData.album.groupName,
      availableSlots: mockPromotionData.album.availableSlots,
      totalSlots: mockPromotionData.album.totalSlots,
    }
  ];


  if (!isArtist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Artist Access Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in as an artist to promote your music.
          </p>
          <Button onClick={login} className="flex items-center gap-2 mx-auto">
            <User className="h-4 w-4" /> Login as Artist
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Promote Your Music</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Logged in as {mockArtist.name}</span>
          <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground max-w-2xl mb-8">
        Increase your visibility and reach more listeners by featuring your content across our platform.
        Limited slots available for each section.
      </p>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid grid-cols-5 w-full max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="slider">Slider</TabsTrigger>
          <TabsTrigger value="row">Rows</TabsTrigger>
          <TabsTrigger value="artist">Artist</TabsTrigger>
          <TabsTrigger value="album">Album</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {promotionSlots.map((slot) => (
            <PromotionSlot 
              key={slot.type} 
              {...slot} 
              isSelected={selectedSlot === slot.type} 
              onSelect={() => {
                setSelectedSlot(slot.type);
                if (slot.type === "Row") {
                  setSelectedRow(slot.rows?.[0] || null);
                }
              }} 
            />
          ))}
        </TabsContent>
        
        <TabsContent value="slider" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PromotionSlot {...promotionSlots[0]} isSelected={selectedSlot === "Slider"} onSelect={() => setSelectedSlot("Slider")} />
          </div>
        </TabsContent>
        
        <TabsContent value="row" className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Available Music Rows</h2>
            <p className="text-muted-foreground">Select a row to promote your content in a specific section</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {mockPromotionData.rows.map((row) => (
              <RowPromotionSlot 
                key={row.id} 
                {...row} 
                isSelected={selectedRow?.id === row.id} 
                onSelect={() => {
                  setSelectedSlot("Row");
                  setSelectedRow(row);
                }} 
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="artist" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PromotionSlot {...promotionSlots[2]} isSelected={selectedSlot === "Artist"} onSelect={() => setSelectedSlot("Artist")} />
          </div>
        </TabsContent>
        
        <TabsContent value="album" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PromotionSlot {...promotionSlots[3]} isSelected={selectedSlot === "Album"} onSelect={() => setSelectedSlot("Album")} />
          </div>
        </TabsContent>
      </Tabs>

      {selectedSlot && (
        <PurchaseDialog 
          selectedSlot={selectedSlot} 
          selectedRow={selectedRow}
          userContent={userContent}
          setUserContent={setUserContent}
          onPurchase={handlePurchase}
          onCancel={() => {
            setSelectedSlot(null);
            setSelectedRow(null);
          }}
          artist={mockArtist}
          slider={mockPromotionData.slider}
        />
      )}
    </div>
  );
};

interface PromotionSlotProps {
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

const PromotionSlot: React.FC<PromotionSlotProps> = ({
  type,
  title,
  description,
  price,
  duration,
  features,
  groupName,
  availableSlots,
  totalSlots,
  isSelected,
  onSelect
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const slotPercentage = (availableSlots / totalSlots) * 100;
  
  const getIcon = () => {
    switch (type) {
      case "Slider": return <Sliders className="h-10 w-10" />;
      case "Row": return <Music className="h-10 w-10" />;
      case "Artist": return <Users className="h-10 w-10" />;
      case "Album": return <Disc className="h-10 w-10" />;
      default: return <Plus className="h-10 w-10" />;
    }
  };

  return (
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <Card className={`h-full flex flex-col transition-all ${isSelected ? "border-primary ring-2 ring-primary" : ""} ${availableSlots === 0 ? "opacity-70" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{groupName}</CardDescription>
            </div>
            <Badge variant="secondary" className="ml-2">
              <Clock className="h-3 w-3 mr-1" /> {duration}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex justify-center items-center h-32 mb-4 bg-muted rounded-md relative">
            {availableSlots === 0 && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                <Badge variant="destructive" className="text-lg py-1">
                  Sold Out
                </Badge>
              </div>
            )}
            {getIcon()}
          </div>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Available Slots</span>
              <span>{availableSlots}/{totalSlots}</span>
            </div>
            <Progress value={slotPercentage} className="h-2" />
          </div>
          
          <ul className="space-y-2 mb-4">
            {features.slice(0, 2).map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
            {features.length > 2 && (
              <li className="text-sm text-muted-foreground">+{features.length - 2} more features</li>
            )}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">MK {price.toLocaleString()}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Payment is one-time for the promotion period</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex space-x-2">
            <Button 
              className="flex-1" 
              onClick={onSelect}
              disabled={availableSlots === 0}
            >
              {isSelected ? "Selected" : "Select"}
            </Button>
            <DialogTrigger asChild>
              <Button variant="outline">
                Details
              </Button>
            </DialogTrigger>
          </div>
        </CardFooter>
      </Card>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title} Promotion</DialogTitle>
          <DialogDescription>
            {description} - {groupName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center items-center h-40 bg-muted rounded-md">
            {getIcon()}
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">MK {price.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Duration: {duration}</p>
            </div>
            <Badge variant="outline" className="text-lg">{type}</Badge>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <div className="flex justify-between text-sm mb-2">
              <span>Available Slots</span>
              <span>{availableSlots}/{totalSlots}</span>
            </div>
            <Progress value={slotPercentage} className="h-2" />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Features included:</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">How it works:</h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Select your content to promote</li>
              <li>Choose your promotion duration</li>
              <li>Complete payment</li>
              <li>Your content goes live immediately</li>
            </ol>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowDetails(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            onSelect();
            setShowDetails(false);
          }} disabled={availableSlots === 0}>
            Select This Promotion
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface RowPromotionSlotProps {
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

const RowPromotionSlot: React.FC<RowPromotionSlotProps> = ({
  name,
  price,
  availableSlots,
  totalSlots,
  duration,
  isSelected,
  onSelect,
  description,
  features
}) => {
  const slotPercentage = (availableSlots / totalSlots) * 100;

  return (
    <Card className={`h-full flex flex-col transition-all ${isSelected ? "border-primary ring-2 ring-primary" : ""} ${availableSlots === 0 ? "opacity-70" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{name} Row</CardTitle>
            <CardDescription>Music Row Promotion</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            <Clock className="h-3 w-3 mr-1" /> {duration}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-center items-center h-32 mb-4 bg-muted rounded-md relative">
          {availableSlots === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
              <Badge variant="destructive" className="text-lg py-1">
                Sold Out
              </Badge>
            </div>
          )}
          <Music className="h-10 w-10" />
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {description || `Promote your music in the ${name} section of our platform.`}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Available Slots</span>
            <span>{availableSlots}/{totalSlots}</span>
          </div>
          <Progress value={slotPercentage} className="h-2" />
        </div>
        
        <ul className="space-y-2 mb-4">
          {(features || [
            "Targeted audience engagement",
            "Medium visibility placement"
          ]).slice(0, 2).map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
          <li className="text-sm text-muted-foreground">+3 more features</li>
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">MK {price.toLocaleString()}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Payment is one-time for the promotion period</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button 
          onClick={onSelect}
          disabled={availableSlots === 0}
        >
          {isSelected ? "Selected" : "Select This Row"}
        </Button>
      </CardFooter>
    </Card>
  );
};

interface PurchaseDialogProps {
  selectedSlot: PromotionType;
  selectedRow: MusicRow | null;
  userContent: UserContentType;
  setUserContent: (content: UserContentType) => void;
  onPurchase: () => void;
  onCancel: () => void;
  artist: {id: string, name: string, songs: MusicFolderItem[], albums: {name: string, id: string}[]};
  slider : SliderPromotion
}

const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  selectedSlot,
  selectedRow,
  userContent,
  setUserContent,
  onPurchase,
  onCancel,
  slider,
  artist
}) => {

  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [item, setItem] = useState<MusicFolderItem>()
  const [loading, setLoading] = useState<boolean>(false)
  const {user} = useAppSelector((state : RootState)=> state.auth)



  const getPrice = () => {
    if (selectedSlot === "Row" && selectedRow) {
      return selectedRow.price;
    }
    
    const prices: Record<PromotionType, number> = {
      "Slider": 10000,
      "Artist": 12000,
      "Album": 8000,
      "Row": 0 
    };
    
    return prices[selectedSlot] || 0;
  };

  const getTitle = () => {
    if (selectedSlot === "Row" && selectedRow) {
      return `${selectedRow.name} Row Promotion`;
    }
    
    const titles: Record<PromotionType, string> = {
      "Slider": "Featured Slider Promotion",
      "Artist": "Artist Spotlight Promotion",
      "Album": "Album Feature Promotion",
      "Row": "Row Promotion"
    };
    
    return titles[selectedSlot] || "Promotion";
  };

  const handlePurchaseSlider = async()=>{
      if(loading || selectedItemId.length == 0) return;
      setLoading(true)

    if(selectedSlot == "Slider"){
      const y : SliderPromotion = {...slider,id : selectedItemId}
        await purchasePromotionSlider(user,y, ()=>{
        setLoading(false)
        toast.success("Success")

      },()=>{
        setLoading(false)
        toast.error("Failed")
      })


    }
  }


  const handleOnPurchaseRow = async()=>{
    if(loading || selectedItemId.length == 0) return;

  
    
    setLoading(true)
    if(selectedRow && selectedItemId){
      const x : MusicRow = {...selectedRow,id : selectedItemId}
      await purchasePromotionRow(user,x, ()=>{
        setLoading(false)
        toast.success("Success")

      },()=>{
        setLoading(false)
        toast.error("Failed")
      })
    }


  }

  const handleOnPurchaseAlbum = async()=>{
    if(loading || !item) return;
    setLoading(true)
    await purchasePromotionAlbum(user,item, ()=>{
        setLoading(false)
        toast.success("Success")

      },()=>{
        setLoading(false)
        toast.error("Failed")
      })
  }

  const handleOnPurchaseArtist = async()=>{
    if(loading || !user) return;
    setLoading(true)
        await purchasePromotionArtist(user, ()=>{
        setLoading(false)
        toast.success("Success")

      },()=>{
        setLoading(false)
        toast.error("Failed")
      }) 
  }

  const handleOnPurchase = async()=>{
    if(selectedSlot == "Row"){
      await handleOnPurchaseRow()
    }
    if(selectedSlot == "Slider"){
      await handlePurchaseSlider()
    }
    if(selectedSlot == "Album"){
      await handleOnPurchaseAlbum()
    }
    if(selectedSlot == "Artist"){
      await handleOnPurchaseArtist()
    }
  }

  const getDescription = () => {
    if (selectedSlot === "Row" && selectedRow) {
      return `Your content will be featured in the ${selectedRow.name} row for ${selectedRow.duration}`;
    }
    
    const descriptions: Record<PromotionType, string> = {
      "Slider": "Your content will be prominently displayed at the top of the homepage for 24 hours",
      "Artist": "Your artist profile will be highlighted across the platform for 72 hours",
      "Album": "Your album will be featured in dedicated album sections for 48 hours",
      "Row": "Your content will be featured in a music row"
    };
    
    return descriptions[selectedSlot] || "Promote your content across our platform";
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 py-4 grid gap-5">
          {/* Promotion Details Card */}
          <div className="bg-muted/40 p-5 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Promotion Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Promotion Type:</span>
                <span className="font-medium">{getTitle()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-bold text-primary">MK {getPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>
                  {selectedSlot === "Row" && selectedRow ? selectedRow.duration : 
                  selectedSlot === "Slider" ? "24 hours" :
                  selectedSlot === "Artist" ? "72 hours" :
                  selectedSlot === "Album" ? "48 hours" : "Variable"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Content Details Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileEdit className="h-4 w-4" />
              Your Content Details
            </h3>
            
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="artist" className="text-sm font-medium">Artist Name</Label>
                <Input
                  id="artist"
                  value={userContent.artist}
                  onChange={(e) => setUserContent({...userContent, artist: e.target.value})}
                  placeholder="Enter artist name"
                  className="py-2"
                />
              </div>
              
              {selectedSlot !== "Artist" && (
                <div className="grid gap-2">
                  <Label htmlFor="content" className="text-sm font-medium">
                    {selectedSlot === "Slider" || selectedSlot === "Row" ? "Song Title" : "Album Name"}
                  </Label>
<Select
  value={selectedSlot === "Album" ? userContent.album : userContent.song}
  onValueChange={(value) => {
    if (selectedSlot === "Album") {
      setUserContent({ ...userContent, album: value });
       const selectedSong = artist.songs.find(s => s.content.title === value);
      if (selectedSong) {
        setItem(selectedSong);
      }
    } else {
      setUserContent({ ...userContent, song: value });

      const selectedSong = artist.songs.find(s => s.content.title === value);
      if (selectedSong) {
        setSelectedItemId(selectedSong.content.contentId);
      }
    }
  }}
>
  <SelectTrigger className="py-2">
    <SelectValue placeholder={`Select ${selectedSlot === "Album" ? "album" : "song"}`} />
  </SelectTrigger>
  <SelectContent className="max-h-[200px] overflow-y-auto">
    {selectedSlot === "Album"
      ? artist.albums.map((album, index) => (
          <SelectItem key={index} value={album.name}>
            {album.name}
          </SelectItem>
        ))
      : artist.songs.map((song, index) => (
          <SelectItem
            key={index}
            value={song.content.title}
          >
            {song.content.title}
          </SelectItem>
        ))}
  </SelectContent>
</Select>

                </div>
              )}
              
          
            </div>
          </div>
          
          {/* Order Summary Card */}
          <div className="bg-primary/5 p-5 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Promotion Fee:</span>
                <span>MK {getPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{userContent.duration} hours</span>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t font-semibold">
                <span>Total:</span>
                <span className="text-primary text-lg">MK {getPrice().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-background">
          <Button variant="outline" onClick={onCancel} className="px-5">
            Cancel
          </Button>
          <Button disabled={loading} onClick={handleOnPurchase} className="px-5 bg-primary hover:bg-primary/90">
            Complete Purchase {loading && <Loader size={18} className="animate-spin"/>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

