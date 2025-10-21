'use client';

import { useState, useEffect, useCallback } from 'react';
import { Ticket, TicketCategory, User, TicketWhatToExpect, TicketLocation } from '../lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  MoreVertical, 
  Loader2, 
  Save, 
  X, 
  Edit, 
  Copy, 
  Trash2, 
  Plus, 
  Upload, 
  Image, 
  Users, 
  Clock,
  CheckCircle,
  Image as ImageIcon,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { listenToTicketChange } from '../lib/dataSource/contentDataSource';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface UploadTask {
  id: string
  progress: number
  isPaused: boolean
  isRunning: boolean
  isCanceled: boolean
}

interface TicketCardProps {
  ticket: Ticket;
  user: User;
  editingTicket: Ticket | null;
  setEditingTicket: (x: Ticket | null) => void;
  handleSaveTicket: (x: Ticket) => void;
  onDeleteTicket: (x: Ticket) => void;
  setTicket: (x: Ticket) => void;
  setSelectedTicket: (x: Ticket) => void;
  handleRemoveCategory: (x: Ticket, index: number) => void;
  handleAddCategory: (x: Ticket) => void;
  setIsReplicateDialogOpen: (x: boolean) => void;
  actionLoading: string | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>, ticketId: string) => void;
  uploadTasks: { [key: string]: UploadTask };
  uploadProgress: { [key: string]: number };
  handleUpdateCategory: (ticket: Ticket, categoryIndex: number, field: keyof TicketCategory, value: any) => void;
}

export default function TicketCard({ 
  ticket, 
  editingTicket, 
  setEditingTicket, 
  handleSaveTicket, 
  actionLoading, 
  handleAddCategory, 
  setSelectedTicket, 
  handleRemoveCategory, 
  handleUpdateCategory, 
  onDeleteTicket, 
  setIsReplicateDialogOpen, 
  handleFileSelect, 
  uploadTasks, 
  uploadProgress, 
  user, 
  setTicket 
}: TicketCardProps) {

  const [startDate, setStartDate] = useState<Date>(() => {
    return ticket.eventStartDate ? new Date(ticket.eventStartDate) : new Date();
  });
  
  const [endDate, setEndDate] = useState<Date | null>(() => {
    return ticket.eventEndDate ? new Date(ticket.eventEndDate) : null;
  });

  const listenToTicketChanges = useCallback(async () => {
    await listenToTicketChange(ticket, user, (updatedTicket) => {
      setTicket(updatedTicket);
    });
  }, [user, ticket, setTicket]);

  useEffect(() => {
    listenToTicketChanges();
  }, [listenToTicketChanges]);

  // Update local state when ticket changes (only when not editing)
  useEffect(() => {
    if (editingTicket?.id !== ticket.id) {
      setStartDate(ticket.eventStartDate ? new Date(ticket.eventStartDate) : new Date());
      setEndDate(ticket.eventEndDate ? new Date(ticket.eventEndDate) : null);
    }
  }, [ticket.eventStartDate, ticket.eventEndDate, editingTicket?.id, ticket.id]);

  // Initialize editing ticket with whatToExpect if it doesn't exist
  const handleEditTicket = useCallback((ticket: Ticket) => {
    const ticketWithDefaults = {
      ...ticket,
      whatToExpect: ticket.whatToExpect || { expectations: [''] }
    };
    setEditingTicket(ticketWithDefaults);
  }, [setEditingTicket]);

  const formatDate = (date: Date | undefined | null) => {
    if (!date) return 'Not set';
    return format(date, 'PPP');
  };

  const formatDateTime = (date: Date | undefined | null) => {
    if (!date) return 'Not set';
    return format(date, 'PPpp');
  };

  const isEventActive = () => {
    const now = new Date();
    if (!ticket.eventStartDate) return false;
    
    const start = new Date(ticket.eventStartDate);
    const end = ticket.eventEndDate ? new Date(ticket.eventEndDate) : undefined;
    
    return now >= start && (!end || now <= end);
  };

  const isEventUpcoming = () => {
    if (!ticket.eventStartDate) return false;
    return new Date() < new Date(ticket.eventStartDate);
  };

  const isEventEnded = () => {
    if (!ticket.eventEndDate) return false;
    return new Date() > new Date(ticket.eventEndDate);
  };

  const getEventStatus = () => {
    if (!ticket.eventStartDate) return 'unscheduled';
    if (isEventEnded()) return 'ended';
    if (isEventActive()) return 'active';
    return 'upcoming';
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800';
      case 'ended': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
      case 'unscheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const getEventStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'ACTIVE';
      case 'upcoming': return 'UPCOMING';
      case 'ended': return 'ENDED';
      case 'unscheduled': return 'UNSCHEDULED';
      default: return 'UNKNOWN';
    }
  };

  // Helper function to get location display text
  const getLocationDisplay = () => {
    if (ticket.location) {
      return ticket.location.name || 'Location details available';
    }
    return 'Online Event';
  };

  // Helper function to get what to expect items for display
  const getWhatToExpectItems = () => {
    if ((ticket.whatToExpect?.expectations || [])?.length > 0) {
      return ticket.whatToExpect?.expectations || [];
    }
    return [];
  };

  // Handler for updating whatToExpect expectations
  const handleUpdateExpectation = (index: number, value: string) => {
    if (!editingTicket) return;
    
    const currentExpectations = editingTicket.whatToExpect?.expectations || [''];
    const newExpectations = [...currentExpectations];
    newExpectations[index] = value;
    
    setEditingTicket({
      ...editingTicket,
      whatToExpect: {
        expectations: newExpectations
      }
    });
  };

  // Handler for adding a new expectation
  const handleAddExpectation = () => {
    if (!editingTicket) return;
    
    const currentExpectations = editingTicket.whatToExpect?.expectations || [''];
    const newExpectations = [...currentExpectations, ''];
    
    setEditingTicket({
      ...editingTicket,
      whatToExpect: {
        expectations: newExpectations
      }
    });
  };

  // Handler for removing an expectation
  const handleRemoveExpectation = (index: number) => {
    if (!editingTicket) return;
    
    const currentExpectations = editingTicket.whatToExpect?.expectations || [''];
    const newExpectations = [...currentExpectations];
    newExpectations.splice(index, 1);
    
    // Ensure we always have at least one empty expectation
    if (newExpectations.length === 0) {
      newExpectations.push('');
    }
    
    setEditingTicket({
      ...editingTicket,
      whatToExpect: {
        expectations: newExpectations
      }
    });
  };

  return (
    <Card className="group border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Ticket Poster with Stats Overlay */}
      {ticket.ticketPoster ? (
        <div className="h-48 bg-muted overflow-hidden relative">
          <img 
            src={ticket.ticketPoster} 
            alt={ticket.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Stats Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <div className="absolute top-3 left-3">
              <Badge className={`${getEventStatusColor(getEventStatus())} border`}>
                {getEventStatusText(getEventStatus())}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-black/60 text-white border-0 text-xs dark:bg-white/20">
                <Users className="w-3 h-3 mr-1" />
                {ticket.count?.total || 0} total
              </Badge>
              <Badge variant="secondary" className="bg-green-600/80 text-white border-0 text-xs dark:bg-green-500/80">
                {ticket.count?.purchased || 0} sold
              </Badge>
              <Badge variant="secondary" className="bg-blue-600/80 text-white border-0 text-xs dark:bg-blue-500/80">
                {ticket.count?.available || 0} available
              </Badge>
              {ticket.isPurchased && (
                <Badge variant="secondary" className="bg-purple-600/80 text-white border-0 text-xs dark:bg-purple-500/80">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Purchased
                </Badge>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center relative dark:from-muted/30 dark:to-muted/20">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2 dark:text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No poster</p>
          </div>
          {/* Stats for tickets without poster */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getEventStatusColor(getEventStatus())} border`}>
              {getEventStatusText(getEventStatus())}
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {ticket.count?.total || 0} total
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {ticket.count?.purchased || 0} sold
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {ticket.count?.available || 0} available
            </Badge>
            {ticket.isPurchased && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Purchased
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Card Header */}
      <CardHeader className="p-6 pb-4">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-3 flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-1 text-card-foreground">
              {editingTicket?.id === ticket.id ? (
                <Input
                  value={editingTicket.name}
                  onChange={(e) => setEditingTicket({ ...editingTicket, name: e.target.value })}
                  className="h-8 text-base font-semibold"
                  placeholder="Ticket name"
                />
              ) : (
                ticket.name
              )}
            </CardTitle>
            
            <CardDescription className="line-clamp-2 min-h-[40px]">
              {editingTicket?.id === ticket.id ? (
                <Textarea
                  value={editingTicket.description}
                  onChange={(e) => setEditingTicket({ ...editingTicket, description: e.target.value })}
                  className="min-h-[60px] resize-none text-sm"
                  placeholder="Ticket description"
                />
              ) : (
                ticket.description || "No description provided"
              )}
            </CardDescription>

            {/* Event Dates */}
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <div>
                  <span className="font-medium">Starts:</span> {formatDateTime(ticket.eventStartDate ? new Date(ticket.eventStartDate) : undefined)}
                </div>
              </div>
              {ticket.eventEndDate && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <div>
                    <span className="font-medium">Ends:</span> {formatDateTime(new Date(ticket.eventEndDate))}
                  </div>
                </div>
              )}
            </div>

            {/* Location Display */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <div>
                <span className="font-medium">Location:</span> {getLocationDisplay()}
              </div>
            </div>

            {/* What to Expect Display (when not editing) */}
            {!editingTicket && getWhatToExpectItems().length > 0 && (
              <div className="pt-2">
                <div className="text-sm font-medium text-muted-foreground mb-1">What to expect:</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {getWhatToExpectItems().slice(0, 3).map((expectation, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span>{expectation}</span>
                    </li>
                  ))}
                  {getWhatToExpectItems().length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      +{getWhatToExpectItems().length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-background border shadow-lg"
              sideOffset={5}
            >
              {editingTicket?.id === ticket.id ? (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleSaveTicket(editingTicket)}
                    disabled={actionLoading === `update-${ticket.id}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {actionLoading === `update-${ticket.id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setEditingTicket(null)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Cancel Edit
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleEditTicket(ticket)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setIsReplicateDialogOpen(true);
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    Replicate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteTicket(ticket)}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {/* Categories Section */}
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Ticket Categories</Label>
            {editingTicket?.id === ticket.id && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => handleAddCategory(editingTicket)}
              >
                <Plus className="w-3 h-3" />
                Add Category
              </Button>
            )}
          </div>

          {ticket.categories.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-muted-foreground/20 rounded-lg">
              <p className="text-sm text-muted-foreground">No categories added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(editingTicket?.id === ticket.id ? editingTicket.categories : ticket.categories).map((category, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30 dark:bg-muted/20">
                  {editingTicket?.id === ticket.id ? (
                    <>
                      <Input
                        value={category.name}
                        onChange={(e) => handleUpdateCategory(editingTicket, index, 'name', e.target.value)}
                        placeholder="Category name"
                        className="flex-1 h-8 text-sm"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">MK</span>
                        <Input
                          type="number"
                          value={category.price}
                          onChange={(e) => handleUpdateCategory(editingTicket, index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-20 h-8 text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveCategory(editingTicket, index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium truncate">{category.name}</span>
                      <Badge variant="secondary" className="font-normal shrink-0">
                        MK{category.price}
                      </Badge>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Additional Ticket Properties - Only show when editing */}
          {editingTicket?.id === ticket.id && (
            <div className="space-y-4 pt-4 border-t">
              {/* Event Dates Editing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Event Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={new Date(editingTicket.eventStartDate).toISOString().slice(0, 16)}
                    onChange={(e) => setEditingTicket({
                      ...editingTicket,
                      eventStartDate: new Date(e.target.value)
                    })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Event End Date & Time (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={editingTicket.eventEndDate ? new Date(editingTicket.eventEndDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingTicket({
                      ...editingTicket,
                      eventEndDate: e.target.value ? new Date(e.target.value) : undefined
                    })}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Location Editing */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Location Name</Label>
                    <Input
                      value={editingTicket.location?.name || ''}
                      onChange={(e) => setEditingTicket({
                        ...editingTicket,
                        location: {
                          ...editingTicket.location,
                          name: e.target.value
                        } as TicketLocation
                      })}
                      placeholder="e.g., Main Hall, Online Event"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Location Description</Label>
                    <Input
                      value={editingTicket.location?.description || ''}
                      onChange={(e) => setEditingTicket({
                        ...editingTicket,
                        location: {
                          ...editingTicket.location,
                          description: e.target.value
                        }as TicketLocation
                      })}
                      placeholder="e.g., Virtual event, access link will be sent"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* What to Expect Editing */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">What to Expect</Label>
                <div className="space-y-2">
                  {(editingTicket.whatToExpect?.expectations || ['']).map((expectation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={expectation}
                        onChange={(e) => handleUpdateExpectation(index, e.target.value)}
                        placeholder="e.g., Live Q&A session"
                        className="h-8 text-sm flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleRemoveExpectation(index)}
                        disabled={(editingTicket.whatToExpect?.expectations?.length || 0) <= 1}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={handleAddExpectation}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Expectation
                  </Button>
                </div>
              </div>

              {/* Poster Upload Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Ticket Poster
                </Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/40 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, ticket.id)}
                    className="hidden"
                    id={`file-upload-${ticket.id}`}
                  />
                  <label
                    htmlFor={`file-upload-${ticket.id}`}
                    className="cursor-pointer block space-y-3"
                  >
                    {uploadTasks[ticket.id] ? (
                      <div className="space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Uploading poster...</p>
                          <Progress value={uploadProgress[ticket.id]} className="h-2" />
                          <p className="text-xs text-muted-foreground">{uploadProgress[ticket.id]}%</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Click to upload poster</p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 20MB
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`is-poster-${ticket.id}`}
                    checked={editingTicket.isPoster}
                    onChange={(e) => setEditingTicket({
                      ...editingTicket,
                      isPoster: e.target.checked
                    })}
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <Label htmlFor={`is-poster-${ticket.id}`} className="text-sm">
                    Has Poster
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`is-purchased-${ticket.id}`}
                    checked={editingTicket.isPurchased}
                    onChange={(e) => setEditingTicket({
                      ...editingTicket,
                      isPurchased: e.target.checked
                    })}
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <Label htmlFor={`is-purchased-${ticket.id}`} className="text-sm">
                    Mark as Purchased
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-4 border-t bg-muted/20 dark:bg-muted/10">
        <div className="flex justify-between items-center w-full text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>By {typeof ticket.creator === 'string' ? ticket.creator : ticket.creator.name}</span>
          </div>
          <div className="flex gap-2">
            {ticket.parentId && (
              <Badge variant="outline" className="text-xs">
                <Copy className="w-3 h-3 mr-1" />
                Copied
              </Badge>
            )}
            {ticket.isPoster && (
              <Badge variant="outline" className="text-xs">
                <ImageIcon className="w-3 h-3 mr-1" />
                Has Poster
              </Badge>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}