'use client'

import { getTicketbyId, getUserTicketCount, listenToTicketChange, payForTicket } from "@/app/lib/dataSource/contentDataSource"
import { Ticket, TicketCategory } from "@/app/lib/types"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  MapPin, 
  Clock,
  Heart,
  Share2,
  Users,
  Ticket as TicketIcon,
  ArrowLeft,
  Star,
  Check,
  Shield,
  Clock4,
  Loader2,
  Loader,
  Eye,
  AlertTriangle,
  Download,
  Sparkles
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { RootState, useAppSelector } from "@/app/lib/local/redux/store"
import { showToast } from "@/app/lib/dataSource/toast"

const TicketDetails = () => {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null)
  const [isFavorite, setIsFavorite] = useState<boolean>(false)
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAppSelector((state: RootState) => state.auth)
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false)
  const [numberOfTicketsAlreadyPurchased, setNumberOfTicketAlreadyPurchased] = useState<number>(0)
  const [imageLoading, setImageLoading] = useState<boolean>(true)
  const [showAllExpectations, setShowAllExpectations] = useState<boolean>(false)

  const onGetAlreadyPurchasedTicketsCount = useCallback(async () => {
    if (!ticket || !user) return;
    try {
      const count = await getUserTicketCount(ticket.id, user)
      setNumberOfTicketAlreadyPurchased(count || 0)
    } catch (error) {
      console.error('Failed to fetch purchased tickets count:', error)
    }
  }, [ticket, user])

  const onGetTicketById = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const _ticket = await getTicketbyId(id as string)
      setTicket(_ticket)
      if (_ticket && _ticket?.categories?.length > 0) {
        setSelectedCategory(_ticket.categories[0])
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error)
      setTicket(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  const onListenToTicketChanges = useCallback(async () => {
    if (!ticket) return;
    await listenToTicketChange(ticket, ticket?.creator, setTicket)
  }, [ticket])

  useEffect(() => {
    onGetTicketById()
  }, [onGetTicketById])

  

  useEffect(()=>{
    if(numberOfTicketsAlreadyPurchased > 0) return;
      onGetAlreadyPurchasedTicketsCount()

  },[ticket,user])

  useEffect(() => {
    if (ticket) {
      onListenToTicketChanges()
    }
  }, [ticket, onListenToTicketChanges, onGetAlreadyPurchasedTicketsCount])

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM dd, yyyy')
  }

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a')
  }

  const formatDateTimeRange = (start: Date, end?: Date) => {
    if (!end) return `${formatDate(start)} • ${formatTime(start)}`
    return `${formatDate(start)} • ${formatTime(start)} - ${formatTime(end)}`
  }

  const getEventStatus = () => {
    if (!ticket) return 'upcoming'
    
    const now = new Date()
    const start = new Date(ticket.eventStartDate)
    const end = ticket.eventEndDate ? new Date(ticket.eventEndDate) : null

    if (end && now > end) return 'ended'
    if (now >= start && (!end || now <= end)) return 'live'
    return 'upcoming'
  }

  const getAvailableTickets = () => {
    return ticket?.count?.available || 0
  }

  const handlePurchase = async () => {
    if (!ticket || !selectedCategory || !user) {
      showToast("Please log in to purchase tickets.")
      return
    }

    if (ticket.count?.available === 0) {
      showToast("Sorry, this ticket category is sold out!")
      return
    }

    setIsPurchasing(true)
    try {
      await payForTicket(
        ticket,
        user,
        selectedCategory.commission?.total || selectedCategory.price,
        selectedCategory.name,
        () => {
          setIsPurchasing(false)
          showToast(`Successfully purchased ${ticket.name} ticket!`, {type : "success"})
          onGetAlreadyPurchasedTicketsCount() 
        },
        () => {
          setIsPurchasing(false)
          showToast("Failed to purchase ticket. Please check your balance and try again.", {type : "error"})
        }
      )
    } catch (error) {
      setIsPurchasing(false)
      showToast("An error occurred during purchase. Please try again.",  {type : "error"})
    }
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    showToast(isFavorite ? "Removed from favorites" : "Added to favorites",  {type : "success"})
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: ticket?.name,
          text: ticket?.description,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        showToast("Event link copied to clipboard!",  {type : "success"})
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleViewPurchasedTickets = () => {
    if (!ticket) return
    router.push(`/my-tickets?eventId=${ticket.id}`)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
  }

  const getExpectationsToShow = () => {
    if (!ticket?.whatToExpect?.expectations) return []
    return showAllExpectations 
      ? ticket.whatToExpect.expectations 
      : ticket.whatToExpect.expectations.slice(0, 3)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
            <Sparkles className="w-6 h-6 text-blue-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="relative">
            <TicketIcon className="w-20 h-20 text-gray-400 mx-auto mb-2" />
            <AlertTriangle className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Event Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            The event you're looking for doesn't exist or may have been removed.
          </p>
          <Button onClick={() => router.back()} size="lg" className="gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  const status = getEventStatus()
  const isLive = status === 'live'
  const isEnded = status === 'ended'
  const availableTickets = getAvailableTickets()
  const isLowAvailability = availableTickets > 0 && availableTickets < 10
  const isSoldOut = availableTickets === 0
  const expectations = getExpectationsToShow()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900">
      {/* Enhanced Header */}
      <div className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to events
            </Button>
            
            <div className="flex items-center gap-2">
              {numberOfTicketsAlreadyPurchased > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewPurchasedTickets}
                  className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                >
                  <Eye className="w-4 h-4" />
                  <span>My Tickets ({numberOfTicketsAlreadyPurchased})</span>
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className="flex items-center gap-2 transition-all hover:scale-105"
              >
                <Heart 
                  className={cn(
                    "w-5 h-5 transition-all",
                    isFavorite 
                      ? "fill-red-500 text-red-500 animate-pulse" 
                      : "text-gray-400 hover:text-red-500 hover:fill-red-500/20"
                  )} 
                />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2 transition-all hover:scale-105"
              >
                <Share2 className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Enhanced Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Event Image */}
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 shadow-2xl">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              )}
              
              {ticket.ticketPoster ? (
                <img 
                  src={ticket.ticketPoster} 
                  alt={ticket.name}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-500",
                    imageLoading ? "opacity-0" : "opacity-100"
                  )}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <TicketIcon className="w-20 h-20 text-gray-400 dark:text-gray-600" />
                </div>
              )}
              
              {/* Enhanced Status Badge */}
              <div className="absolute top-6 left-6 flex gap-3">
                <Badge className={cn(
                  "px-4 py-2 text-sm font-semibold backdrop-blur-sm border-0",
                  isEnded 
                    ? "bg-gray-600 text-white" 
                    : isLive 
                    ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg animate-pulse" 
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                )}>
                  {isEnded ? 'EVENT ENDED' : isLive ? 'LIVE NOW' : 'UPCOMING'}
                </Badge>
                
                {isSoldOut && (
                  <Badge className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg backdrop-blur-sm border-0">
                    SOLD OUT
                  </Badge>
                )}
              </div>

              {/* Image Overlay Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {ticket.name}
                </h1>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm">
                    <Users className="w-4 h-4" />
                    <span className={cn(
                      "font-medium",
                      isSoldOut ? "text-red-500" : isLowAvailability ? "text-orange-500" : "text-gray-600 dark:text-gray-400"
                    )}>
                      {isSoldOut ? "Sold Out" : `${availableTickets} tickets available`}
                    </span>
                  </div>
                </div>

                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl">
                  {ticket.description || "Join us for an unforgettable experience featuring amazing performances, guest speakers, and networking opportunities. Don't miss out on this exclusive event!"}
                </p>
              </div>

              {/* Enhanced Info Cards */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Date & Time Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3 text-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Date & Time
                  </h3>
                  <div className="space-y-3">
                    <div className="text-gray-700 dark:text-gray-300 font-medium">
                      {formatDateTimeRange(
                        new Date(ticket.eventStartDate),
                        ticket.eventEndDate ? new Date(ticket.eventEndDate) : undefined
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock4 className="w-4 h-4" />
                      <span>Doors open 30 minutes before start time</span>
                    </div>
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3 text-lg">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    Location
                  </h3>
                  <div className="space-y-3">
                    <div className="text-gray-700 dark:text-gray-300 font-medium">
                      {ticket.location?.name}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {ticket.location?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced What to Expect */}
              {ticket.whatToExpect?.expectations && ticket.whatToExpect.expectations.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
                    What to expect
                  </h3>
                  <div className="space-y-3">
                    {expectations.map((exp, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-full">
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{exp}</span>
                      </div>
                    ))}
                    
                    {ticket.whatToExpect.expectations.length > 3 && (
                      <Button
                        variant="ghost"
                        onClick={() => setShowAllExpectations(!showAllExpectations)}
                        className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        {showAllExpectations ? 'Show Less' : `Show ${ticket.whatToExpect.expectations.length - 3} More`}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Right Column - Ticket Purchase */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Enhanced Ticket Selection */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                    Select Tickets
                  </h3>
                  {numberOfTicketsAlreadyPurchased > 0 && (
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                      You have {numberOfTicketsAlreadyPurchased}
                    </Badge>
                  )}
                </div>

                {ticket.categories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No ticket categories available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ticket.categories.map((category, index) => {
                      const isCategorySoldOut = ticket.count?.available === 0
                      const isSelected = selectedCategory?.name === category.name
                      
                      return (
                        <div
                          key={index}
                          className={cn(
                            "border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]",
                            isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                              : isCategorySoldOut
                              ? "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                          )}
                          onClick={() => !isCategorySoldOut && setSelectedCategory(category)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white text-lg">
                                {category.name}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                General admission
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                MK{category.commission?.total || category.price}
                              </div>
                              {category.commission?.commission && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  +MK{category.commission.commission} fee
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            {isCategorySoldOut ? (
                              <Badge variant="destructive" className="text-xs">
                                Sold Out
                              </Badge>
                            ) : isLowAvailability ? (
                              <div className="text-xs font-medium text-orange-600 dark:text-orange-400">
                                Only {ticket.count?.available} left
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {ticket.count?.available} available
                              </div>
                            )}
                            
                            {isSelected && (
                              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                                <Check className="w-4 h-4" />
                                <span>Selected</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <Separator className="my-6" />

                {/* Enhanced Order Summary */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Price</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {selectedCategory ? `MK${selectedCategory.commission?.total || selectedCategory.price}` : 'Select a ticket'}
                    </span>
                  </div>
                  {selectedCategory?.commission && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                        <span className="text-gray-900 dark:text-white">
                          MK{selectedCategory.commission.commission || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Tax</span>
                        <span className="text-gray-900 dark:text-white">
                          MK{selectedCategory.commission.tax || 0}
                        </span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedCategory ? `MK${(selectedCategory.commission?.total || selectedCategory.price).toFixed(2)}` : '-'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={!selectedCategory || isEnded || isPurchasing || ticket.count?.available === 0}
                  size="lg"
                  className={cn(
                    "w-full mt-6 font-bold text-lg py-6 transition-all duration-300",
                    isEnded || ticket?.count?.available === 0
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  )}
                >
                  {isEnded ? (
                    'Event Ended'
                  ) : ticket?.count?.available === 0 ? (
                    'Sold Out'
                  ) : isPurchasing ? (
                    <div className="flex items-center gap-3">
                      <Loader className="animate-spin" size={20} />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Get Tickets Now'
                  )}
                </Button>

                {/* Enhanced Security Badge */}
                <div className="flex items-center justify-center gap-3 mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Secure checkout</span>
                </div>
              </div>

              {/* Enhanced Event Stats */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
                  Event Statistics
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Available</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{availableTickets} tickets</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Sold</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{ticket.count?.purchased || 0} tickets</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">Total Capacity</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{ticket.count?.total || 0} tickets</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Need Help */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
                  Need help?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  Our support team is here to help you with any questions about your purchase or the event.
                </p>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Download Info
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetails