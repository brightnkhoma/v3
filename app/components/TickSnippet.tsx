'use client';

import { Ticket } from '../lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Clock,
  Heart,
  Ticket as TicketIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TicketSnippetProps {
  ticket: Ticket;
  onTicketClick?: (ticket: Ticket) => void;
  onPurchaseClick?: (ticket: Ticket) => void;
  onFavoriteClick?: (ticketId: string) => void;
  isFavorite?: boolean;
  className?: string;
}

export default function TicketSnippet({ 
  ticket, 
  onTicketClick,
  onPurchaseClick,
  onFavoriteClick,
  isFavorite = false,
  className 
}: TicketSnippetProps) {
  
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd');
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const getEventStatus = (ticket: Ticket) => {
    const now = new Date();
    const start = new Date(ticket.eventStartDate);
    const end = ticket.eventEndDate ? new Date(ticket.eventEndDate) : null;

    if (end && now > end) return 'ended';
    if (now >= start && (!end || now <= end)) return 'live';
    return 'upcoming';
  };

  const getPriceRange = (ticket: Ticket) => {
    if (ticket.categories.length === 0) return 'Free';
    
    const prices = ticket.categories.map(cat => cat.price);
    const minPrice = Math.min(...prices);
    
    return `From MK${minPrice}`;
  };

  const getAvailableTickets = (ticket: Ticket) => {
    return ticket.count?.available || 0;
  };

  const status = getEventStatus(ticket);
  const isLive = status === 'live';
  const isEnded = status === 'ended';
  const availableTickets = getAvailableTickets(ticket);
  const isLowAvailability = availableTickets > 0 && availableTickets < 20;

  return (
    <Card 
      className={cn(
        "group w-max cursor-pointer border-0 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
        "hover:scale-[1.02] active:scale-[0.99]",
        isEnded && "opacity-70 grayscale",
        className
      )}
      onClick={() => onTicketClick?.(ticket)}
    >
      <div className="flex h-32">
        {/* Image Section */}
        <div className="relative w-32 flex-shrink-0">
          {ticket.ticketPoster ? (
            <img 
              src={ticket.ticketPoster} 
              alt={ticket.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
              <TicketIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          
          {/* Status Badge */}
          {!isEnded && (
            <div className="absolute top-2 left-2">
              <Badge className={cn(
                "px-2 py-1 text-xs font-medium border-0",
                isLive 
                  ? "bg-red-500 text-white" 
                  : "bg-blue-500 text-white"
              )}>
                {isLive ? 'LIVE' : 'UPCOMING'}
              </Badge>
            </div>
          )}

          {/* Favorite Button */}
          {onFavoriteClick && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteClick(ticket.id);
              }}
              className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Heart 
                className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  isFavorite 
                    ? "fill-red-500 text-red-500" 
                    : "text-gray-400 hover:text-red-500"
                )} 
              />
            </button>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="flex-1 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Event Title */}
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {ticket.name}
            </h3>

            {/* Event Date & Time */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(new Date(ticket.eventStartDate))}</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{formatTime(new Date(ticket.eventStartDate))}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <MapPin className="w-3 h-3" />
              <span>Online Event</span>
            </div>
          </div>

          {/* Bottom Section - Price & Action */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              {/* Price */}
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {getPriceRange(ticket)}
              </div>
              
              {/* Availability */}
              {!isEnded && availableTickets > 0 && (
                <div className={cn(
                  "text-xs",
                  isLowAvailability 
                    ? "text-orange-600 dark:text-orange-400 font-medium" 
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {isLowAvailability ? 'Few tickets left' : `${availableTickets} available`}
                </div>
              )}
            </div>
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPurchaseClick?.(ticket);
              }}
              variant={isEnded ? "outline" : "default"}
              size="sm"
              disabled={isEnded}
              className={cn(
                "text-xs font-medium px-3 py-1.5 h-auto min-w-20",
                isEnded 
                  ? "text-gray-400 border-gray-300 dark:border-gray-600" 
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              )}
            >
              {isEnded ? 'Ended' : 'Tickets'}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}