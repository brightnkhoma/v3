'use client';

import { useState } from 'react';
import { Ticket } from '../lib/types';
import TicketSnippet from './TickSnippet';
import { TicketIcon } from 'lucide-react';

interface TicketListingProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
  onPurchaseClick?: (ticket: Ticket) => void;
}

export default function TicketListing({ tickets, onTicketClick, onPurchaseClick }: TicketListingProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleFavoriteClick = (ticketId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(ticketId)) {
        newFavorites.delete(ticketId);
      } else {
        newFavorites.add(ticketId);
      }
      return newFavorites;
    });
  };

  // Sort tickets: live events first, then upcoming, then by date
  const sortedTickets = [...tickets].sort((a, b) => {
    const now = new Date();
    const aStart = new Date(a.eventStartDate);
    const bStart = new Date(b.eventStartDate);
    
    const aIsLive = now >= aStart && (!a.eventEndDate || now <= new Date(a.eventEndDate));
    const bIsLive = now >= bStart && (!b.eventEndDate || now <= new Date(b.eventEndDate));
    
    if (aIsLive && !bIsLive) return -1;
    if (!aIsLive && bIsLive) return 1;
    
    return aStart.getTime() - bStart.getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8 w-full px-4">
      <div className="max-w-4xl   ">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Events & Tickets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tickets.length} events • {favorites.size} saved
          </p>
        </div>

        {/* Tickets Grid */}
        <div className="space-y-3 flex flex-row items-center gap-4 flex-wrap">
          {sortedTickets.map((ticket) => (
            <TicketSnippet
              key={ticket.id}
              ticket={ticket}
              onTicketClick={onTicketClick}
              onPurchaseClick={onPurchaseClick}
              onFavoriteClick={handleFavoriteClick}
              isFavorite={favorites.has(ticket.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {tickets.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <TicketIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No events available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Check back later for new events
            </p>
          </div>
        )}
      </div>
    </div>
  );
}