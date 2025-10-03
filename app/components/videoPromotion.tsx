"use client"
import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useCallback } from 'react';
import { NextPage } from 'next';
import { User, VideoFolderItem, VideoFolderPromotion, VideoPromotionAdvert, VideoPromotionSlot } from '../lib/types';
import { useAppSelector, RootState } from '../lib/local/redux/store';
import { createVideoPromotionAdvert, getUserVideoPromotions, getVideoFolderItemsbyId, getVideoPromotionAdvert } from '../lib/dataSource/contentDataSource';
import { showToast } from '../lib/dataSource/toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Separator } from '@radix-ui/react-select';
import { Calendar, Minus, Plus, CreditCard } from 'lucide-react';


const VideoPromotionPage: NextPage = () => {
  const [userVideos, setUserVideos] = useState<VideoFolderItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoFolderItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<VideoPromotionSlot | null>(null);
  const [promotionDuration, setPromotionDuration] = useState<number>(7);
  const [promotions, setPromotions] = useState<VideoFolderPromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {meta,user} = useAppSelector((state : RootState)=> state.auth)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [advert, setAdvert] = useState<VideoPromotionAdvert>()

  

  const onGetAdvert = async()=>{
    const _advert = await getVideoPromotionAdvert()
    if(_advert){
      setAdvert(_advert)

    }
  }




    const onGetFolderVideos =async ()=>{
          const _videos = await getVideoFolderItemsbyId(meta?.folderId || "__",user)
          setUserVideos(_videos)
          setIsLoading(false)
  
      }
      useEffect(()=>{
          onGetFolderVideos()
          onGetAdvert()
          onGetVideoFolderPromotions()
      },[])

   
 

  const handleVideoSelect = (video: VideoFolderItem) => {
    setSelectedVideo(video);
  };

  const handleSlotSelect = (slot: VideoPromotionSlot) => {
    setSelectedSlot(slot);
    setPromotionDuration(slot.duration);
  };

  const calculateTotalCost = (): number => {
    if (!selectedSlot) return 0;
    return selectedSlot.price * (promotionDuration / selectedSlot.duration);
  };

  const onPurchase = async(item : VideoFolderPromotion)=>{
    await createVideoPromotionAdvert(user,item,onPurchaseSuccess,onPurchaseFailure)
  }


  const onGetVideoFolderPromotions  = useCallback(async()=>{
    const items = await getUserVideoPromotions(user)
    setPromotions(items)
  },[])

  const onPurchaseSuccess = ()=>{
    setIsLoading(false)
    showToast('Promotion purchased successfully!')
  }
  const onPurchaseFailure = ()=>{
    setIsLoading(false)
    showToast('Failed to purchase promotion')
  }

  const handlePurchase = async () => {
    if (!selectedVideo || !selectedSlot) return;

    setIsLoading(true);
    
      const newPromotion: VideoFolderPromotion = {
        id: `promo-${Date.now()}`,
        item: selectedVideo,
        startDate: new Date(),
        endDate: new Date(Date.now() + promotionDuration * 24 * 60 * 60 * 1000),
        durationCount: promotionDuration,
        durationUnit: 'days',
        amountPaid: calculateTotalCost(),
        status: 'active',
        promotionType: selectedSlot.type,
        priority: selectedSlot.visibility === 'high' ? 1 : selectedSlot.visibility === 'medium' ? 2 : 3,
        impressions: 0,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.userId,
        slotId: selectedSlot.id
      };

      await onPurchase(newPromotion)
      await onGetVideoFolderPromotions()


      setShowPurchaseDialog(false);
      setSelectedVideo(null);
      setSelectedSlot(null);
      setIsLoading(false);
      
  };

  if (isLoading && userVideos.length === 0) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-xl">Loading your videos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Promote Your Videos</h1>
          <p className=" mt-2">
            Boost your video visibility and reach more viewers
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Video Selection */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Select Video to Promote</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userVideos.map(video => (
              <div
                key={video.folderId}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedVideo?.content.contentId === video.content.contentId
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
                onClick={() => handleVideoSelect(video)}
              >
                <img
                  src={video.content.thumbnail || video.folderPoster}
                  alt={video.folderName}
                  className="w-full h-32 object-cover rounded mb-3"
                />
                <h3 className="font-semibold">{video.folderName}</h3>
                <p className="text-sm text-gray-400">{video.content.title}</p>
                <p className="text-xs text-gray-500 capitalize">{video.type}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Promotion Slots */}
        {selectedVideo && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Choose Promotion Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {advert?.slots.map(slot => (
                <div
                  key={slot.id}
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
                    selectedSlot?.id === slot.id
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-gray-700 hover:border-gray-500'
                  } ${slot.availableSlots === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => slot.availableSlots > 0 && handleSlotSelect(slot)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold">{slot.title}</h3>
                    <span className="bg-blue-600 text-xs px-2 py-1 rounded">
                      {slot.availableSlots}/{slot.totalSlots} slots
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-4">{slot.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-2xl font-bold">MK{slot.price}</span>
                    <span className="text-gray-400 ml-2">
                      for {slot.duration} {slot.durationUnit}
                    </span>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    {slot.features.map((feature: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, index: Key | null | undefined) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {slot.availableSlots === 0 && (
                    <div className="text-red-400 text-sm">Sold out</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Duration Customization */}
       {selectedVideo && selectedSlot && (
  <section className="mb-8">
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          Promotion Duration
        </CardTitle>
        <CardDescription>
          Configure how long you want to promote your video
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="promotion-duration" className="text-sm font-medium">
            Duration ({selectedSlot.durationUnit})
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="promotion-duration"
              type="number"
              min={1}
              max={90}
              value={promotionDuration}
              onChange={(e) => setPromotionDuration(Number(e.target.value))}
              className="bg-background border-input"
            />
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPromotionDuration(prev => Math.max(1, prev - 1))}
                className="h-9 w-9 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPromotionDuration(prev => Math.min(90, prev + 1))}
                className="h-9 w-9 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Choose between 1 and 90 {selectedSlot.durationUnit}
          </p>
        </div>

        <Separator />

        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Cost</p>
              <p className="text-xs text-muted-foreground">
                {promotionDuration} {selectedSlot.durationUnit} × MK{(calculateTotalCost() / promotionDuration).toFixed(2)}/{selectedSlot.durationUnit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                ${calculateTotalCost().toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Including all fees
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={() => setShowPurchaseDialog(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 h-auto text-base"
          size="lg"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Purchase Promotion
        </Button>
      </CardFooter>
    </Card>
  </section>
)}

        {/* Active Promotions */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Your Active Promotions</h2>
          {promotions.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No active promotions. Promote your first video to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotions.map(promotion => (
                <div key={promotion.id} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold">{promotion.item.content.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      promotion.status === 'active' ? 'bg-green-600' :
                      promotion.status === 'pending' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}>
                      {promotion.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Type: {promotion.promotionType}</span>
                    <span>Cost: MK{promotion.amountPaid?.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    <div>Impressions: {promotion.impressions}</div>
                    <div>Clicks: {promotion.clicks}</div>
                    <div>Ends: {promotion.endDate.toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Purchase Dialog */}
      {showPurchaseDialog && selectedVideo && selectedSlot && (
        <div className="fixed text-white inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirm Promotion Purchase</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Video:</span>
                <span className="font-semibold">{selectedVideo.content.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Promotion Type:</span>
                <span className="font-semibold">{selectedSlot.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-semibold">
                  {promotionDuration} {selectedSlot.durationUnit}
                </span>
              </div>
              <div className="flex justify-between text-lg border-t border-gray-700 pt-3">
                <span>Total Cost:</span>
                <span className="font-bold text-green-400">
                  ${calculateTotalCost().toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPurchaseDialog(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPromotionPage;