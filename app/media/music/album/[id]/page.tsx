'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Pause, Heart, MoreHorizontal, Clock, ListMusic, Music, ShoppingCart, Check, Lock, Coins, Loader2, X, AlertCircle, Loader } from 'lucide-react';
import Image from 'next/image';
import { MusicFolderItem, User, zathuPath } from '@/app/lib/types';
import { getFilteredItems, getFolderItems, getFolders, getMusicAlbum, onGetFolderItems, onGetPaidContent, purchase } from '@/app/lib/dataSource/contentDataSource';
import { RootState, useAppSelector } from '@/app/lib/local/redux/store';
import { useParams, useRouter } from 'next/navigation';
import { AppContext } from '@/app/appContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { showToast } from '@/app/lib/dataSource/toast';
export default function MusicPage() {
  const [albums, setAlbums] = useState<MusicFolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<MusicFolderItem | null>(null);
  const [albumLoading, setAlbumLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const id = useParams();
  const { audioManager } = useContext(AppContext)!;
  const isPlaying = !audioManager.audioRef.current?.paused;
  const [tracks, setTracks] = useState<MusicFolderItem[]>([]);
  const currentPlayingMusic: MusicFolderItem | null = audioManager.item;
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [ui, setUi] = useState<number>(3);
  const [purchaseDialog, setPurchaseDialog] = useState<{ open: boolean, item: MusicFolderItem | null, type: 'album' | 'track' }>({ open: false, item: null, type: 'album' });
  const [userClicks, setUserClicks] = useState(1000); // Example user clicks balance
 
  const toast = (data : {
        title?: string,
        description?: string,
        variant?: string,
      })=>{
        showToast(`${data.title || "" }\n ${data.description || ""}`)
      }
  const updateUi = useCallback(() => {
    setUi(prev => prev == 3 ? 2 : 3);
  }, [ui]);

  const onGetAlbum = async () => {
    if (id) {
      const x: User = { userId: id.id as string } as User;
      const data = await getFolders(x,"audio") as MusicFolderItem[];
      setAlbums(data);
    }
    setLoading(false);
  };

  const artistName = albums.length > 0 ? albums[0].artistName : 'Artist';

  useEffect(() => {
    onGetAlbum();
    audioManager._updateUi = updateUi;
  }, [id]);

  useEffect(() => {
    if (audioManager.item && tracks.length > 0) {
      const index = tracks.findIndex(track => track.folderId === audioManager.item?.folderId);
      setCurrentTrackIndex(index);
    } else {
      setCurrentTrackIndex(-1);
    }
  }, [audioManager.item, tracks]);

  const handleAlbumClick = async (album: MusicFolderItem) => {
    if (selectedAlbum?.folderId === album.folderId) {
      setSelectedAlbum(null);
      return;
    }

    setAlbumLoading(album.folderId);
    try {
      const items = await getMusicAlbum(album,user) as MusicFolderItem[];
      setTracks(items);
      setSelectedAlbum(album);
    } catch (err) {
      setError('Failed to load album details');
    } finally {
      setAlbumLoading(null);
    }
  };

  const togglePlay = async () => {
    await audioManager.togglePlayPause();
  };

  const onPlaySelectedMusic = async (item: MusicFolderItem, index: number) => {
    // Check if track is paid before playing
    if (!item.isPaid && item.content.pricing?.price) {
      setPurchaseDialog({ open: true, item, type: 'track' });
      return;
    }

    if (audioManager.item && audioManager.item.folderId === item.folderId) {
      const file = await audioManager.getFile(item);
      if (file) {
        await audioManager.play(file);
        audioManager.item = item;
        setCurrentTrackIndex(index);
      }
    } else {
      const file = await audioManager.getFile(item);
      if (file) {
        await audioManager.play(file);
        audioManager.item = item;
        audioManager.album = tracks;
        audioManager.albumCopy = tracks;
        setCurrentTrackIndex(index);
      }
    }
  };

  const playAlbum = async () => {
    // Check if all tracks are paid or album is purchased
    const unpaidTracks = tracks.filter(track => !track.isPaid && track.content.pricing?.price);
    if (unpaidTracks.length > 0 && selectedAlbum?.price?.price) {
      setPurchaseDialog({ open: true, item: selectedAlbum, type: 'album' });
      return;
    }

    if (tracks.length > 0) {
      await onPlaySelectedMusic(tracks[0], 0);
    }
  };

  const handlePurchase = async (item: MusicFolderItem, type: 'album' | 'track') => {
    const price = type === 'album' ? item.price?.price : item.content.pricing?.price;

    if (!price) {
      toast({
        title: "Purchase Error",
        description: "This item is not available for purchase.",
        variant: "destructive",
      });
      return;
    }

    if (userClicks < price) {
      toast({
        title: "Insufficient Clicks",
        description: "You don't have enough clicks to make this purchase.",
        variant: "destructive",
      });
      return;
    }

    // Simulate purchase process
    try {
      // Here you would call your actual purchase API
      setUserClicks(prev => prev - price);

      // Update the item's paid status
      if (type === 'album') {
        // Mark all tracks in the album as paid
        const updatedTracks = tracks.map(track => ({
          ...track,
          isPaid: true
        }));
        setTracks(updatedTracks);

        // Mark album as purchased
        const updatedAlbums = albums.map(album =>
          album.folderId === item.folderId ? { ...album, isPaid: true } : album
        );
        setAlbums(updatedAlbums);
      } else {
        // Mark individual track as paid
        const updatedTracks = tracks.map(track =>
          track.content.contentId === item.content.contentId ? { ...track, isPaid: true } : track
        );
        setTracks(updatedTracks);
      }

      toast({
        title: "Purchase Successful!",
        description: `You've successfully purchased ${type === 'album' ? 'the album' : 'the track'}.`,
      });

      setPurchaseDialog({ open: false, item: null, type: 'album' });

      // If purchasing a track, play it immediately
      if (type === 'track') {
        const index = tracks.findIndex(t => t.content.contentId === item.content.contentId);
        if (index !== -1) {
          await onPlaySelectedMusic({ ...item, isPaid: true }, index);
        }
      }
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-full px-6 py-2 text-base"
            aria-label="Reload the page"
          >
            Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-16">
      <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-6">
        {/* User Clicks Balance */}
        {/* <div className="flex justify-end mb-6">
          <Badge variant="outline" className="px-4 py-2 bg-primary/10 text-primary border-primary/20">
            <Coins className="h-4 w-4 mr-2" />
            {userClicks.toLocaleString()} clicks
          </Badge>
        </div> */}

        {/* Artist Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8 p-4 sm:p-6 rounded-2xl bg-card/70 backdrop-blur-sm border shadow-sm"
          role="banner"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-lg ring-4 ring-primary/10"
          >
            {albums.length > 0 ? (
              <Image
                src={albums[0].folderPoster || '/images/album.webp'}
                alt={`${artistName} profile`}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
            ) : (
              <Skeleton className="w-full h-full rounded-full" />
            )}
          </motion.div>
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Verified Artist
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-foreground bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {artistName}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-4">
              {albums.length} {albums.length === 1 ? 'Album' : 'Albums'} •{' '}
              {albums.reduce((acc, album) => acc + (album.content.listens || 0), 0).toLocaleString()} Listens
            </p>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  className="rounded-full px-8 py-2.5 text-base sm:text-lg bg-primary hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause music' : 'Play music'}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-5 w-5" aria-hidden="true" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" aria-hidden="true" /> Play
                    </>
                  )}
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  className="rounded-full h-10 w-10 p-0"
                  aria-label="Like artist"
                >
                  <Heart className="h-5 w-5" aria-hidden="true" />
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  className="rounded-full h-10 w-10 p-0"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Now Playing Indicator */}
        <AnimatePresence>
          {currentPlayingMusic && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-3 bg-primary/10 rounded-lg flex items-center"
            >
              <div className="flex items-center gap-3 w-[70%] ">
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 10, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
                  className="relative w-10 h-10 rounded overflow-hidden"
                >
                  <Image
                    src={selectedAlbum?.folderPoster || '/images/album.webp'}
                    alt="Now playing"
                    fill
                    className="object-cover"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    </div>
                  )}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate  text-foreground max-w-[100%] ">
                    {currentPlayingMusic.content.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentPlayingMusic.artistName}
                  </p>
                </div>
              </div>
              <div className="ml-auto flex items-center">
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Albums List */}
        <section className="mb-8" aria-labelledby="albums-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="albums-heading" className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ListMusic className="h-6 w-6 text-primary" aria-hidden="true" />
              Albums
            </h2>
            <div className="text-sm text-muted-foreground">Sorted by Recent</div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <AlbumRowSkeleton key={index} />
              ))}
            </div>
          ) : albums.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <ListMusic className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No albums yet</h3>
              <p className="text-muted-foreground">This artist hasn&apos;t released any albums</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              {albums.map((album, index) => (
                <motion.div
                  key={album.folderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AlbumRow
                    album={album}
                    onClick={() => handleAlbumClick(album)}
                    isLoading={albumLoading === album.folderId}
                    isSelected={selectedAlbum?.folderId === album.folderId}
                    isPlaying={audioManager.album?.some(a => a.folderId === album.folderId) && isPlaying}
                    onPurchase={() => setPurchaseDialog({ open: true, item: album, type: 'album' })}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Selected Album Details */}
        <AnimatePresence>
          {selectedAlbum && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-10 p-4 sm:p-6 rounded-2xl bg-card/70 backdrop-blur-sm border shadow-sm overflow-hidden"
              aria-labelledby="album-details-heading"
            >
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                <div className="w-full lg:w-1/3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-square overflow-hidden rounded-2xl shadow-lg"
                  >
                    <Image
                      src={selectedAlbum.folderPoster || '/images/album.webp'}
                      alt={`${selectedAlbum.folderName} cover`}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          className="rounded-full w-12 h-12 p-0 mb-4"
                          onClick={playAlbum}
                          aria-label="Play album"
                        >
                          <Play className="h-5 w-5" aria-hidden="true" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>

                  <div className="mt-6 flex gap-3 justify-center">
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        className="rounded-full flex-1 py-2.5 text-base"
                        onClick={playAlbum}
                        aria-label="Play all tracks"
                      >
                        <Play className="mr-2 h-4 w-4" aria-hidden="true" /> Play All
                      </Button>
                    </motion.div>
                    {selectedAlbum.price?.price && !selectedAlbum.isPaid && (
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="secondary"
                          className="rounded-full h-10 w-10 p-0"
                          onClick={() => setPurchaseDialog({ open: true, item: selectedAlbum, type: 'album' })}
                          aria-label="Purchase album"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="outline"
                        className="rounded-full h-10 w-10 p-0"
                        aria-label="Like album"
                      >
                        <Heart className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="outline"
                        className="rounded-full h-10 w-10 p-0"
                        aria-label="More album options"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </motion.div>
                  </div>

                  {selectedAlbum.price?.price && (
                    <div className="mt-4 text-center">
                      {selectedAlbum.isPaid ? (
                        <Badge className="px-3 py-1 bg-green-500/20 text-green-600 border-green-500/30">
                          <Check className="h-3 w-3 mr-1" /> Purchased
                        </Badge>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Badge variant="outline" className="px-3 py-1 bg-amber-500/20 text-amber-600 border-amber-500/30">
                            <Lock className="h-3 w-3 mr-1" /> Premium Content
                          </Badge>
                          <Button
                            variant="default"
                            className="w-full mt-2"
                            onClick={() => setPurchaseDialog({ open: true, item: selectedAlbum, type: 'album' })}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Buy Album - MK{selectedAlbum.price.price.toFixed(2)}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="mb-6">
                    <h3 id="album-details-heading" className="text-2xl font-bold text-foreground mb-2">
                      {selectedAlbum.folderName}
                    </h3>
                    <p className="text-base text-muted-foreground mb-4">{selectedAlbum.artistName}</p>
                    <p className="text-base text-muted-foreground">{selectedAlbum.content.description}</p>
                  </div>

                  {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {[
                      { label: 'Release Date', value: new Date(selectedAlbum.content.releaseDate).toLocaleDateString() },
                      { label: 'Genre', value: (selectedAlbum.content.genres || []).join(', ') },
                      { label: 'Listens', value: (selectedAlbum.content.listens || 0).toLocaleString() },
                      { label: 'Duration', value: formatDuration(selectedAlbum.content.duration || 0), icon: <Clock className="h-4 w-4 mr-1" /> }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="p-4 rounded-lg bg-muted/30"
                      >
                        <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                        <p className="text-foreground font-medium flex items-center">
                          {item.icon}
                          {item.value}
                        </p>
                      </motion.div>
                    ))}
                  </div> */}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-foreground">Tracklist</h4>
                      {selectedAlbum.price?.price && !selectedAlbum.isPaid && (
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                          {tracks.filter(t => !t.isPaid && t.content.pricing?.price).length} paid tracks
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      {tracks.length > 0 ? (
                        tracks.map((track, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                          >
                            <TrackRow
                            isLoading = {track.content.contentId == audioManager.isMusicLoading}
                            user={user}
                              track={track}
                              index={index}
                              artistName={selectedAlbum.artistName}
                              isPlaying={currentPlayingMusic?.content.contentId === track.content.contentId && isPlaying}
                              onPlay={() => onPlaySelectedMusic(track, index)}
                              onPurchase={() => setPurchaseDialog({ open: true, item: track, type: 'track' })}
                            />
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-muted-foreground italic">No track information available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Purchase Confirmation Dialog */}
        <Dialog open={purchaseDialog.open} onOpenChange={(open) => setPurchaseDialog({ ...purchaseDialog, open })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                {purchaseDialog.type === 'album'
                  ? `You are about to purchase the album "${purchaseDialog.item?.folderName}"`
                  : `You are about to purchase the track "${purchaseDialog.item?.content.title}"`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-muted-foreground">Price:</span>
              <span className="text-lg font-semibold text-foreground">
                MK{purchaseDialog.type === 'album'
                  ? purchaseDialog.item?.price?.price.toFixed(2)
                  : purchaseDialog.item?.content.pricing?.price.toFixed(2)
                }
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Your balance:</span>
              <span className="text-sm font-medium text-foreground">
                {userClicks.toLocaleString()} clicks
              </span>
            </div>

            <DialogFooter className="sm:justify-between gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setPurchaseDialog({ open: false, item: null, type: 'album' })}
              >
                Cancel
              </Button>
              <Button
                onClick={() => purchaseDialog.item && handlePurchase(purchaseDialog.item, purchaseDialog.type)}
                disabled={userClicks < (purchaseDialog.type === 'album'
                  ? (purchaseDialog.item?.price?.price || 0)
                  : (purchaseDialog.item?.content.pricing?.price || 0)
                )}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Confirm Purchase
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
function TrackRow({
  track,
  index,
  artistName,
  isPlaying,
  onPlay,
  onPurchase,
  user,
  isLoading
}: {
  track: MusicFolderItem;
  index: number;
  artistName: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPurchase: () => void;
  user: User,
  isLoading : boolean
}) {
  const [isPaid, setIsPaid] = useState<boolean>(track.isPaid || false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const price = track.content.pricing.price || track.price?.price || 0;
  const router = useRouter();

  const onCheckIfContentIsPaid = async () => {
    const price = track.content.pricing.price || track.price?.price || 0;
    if (price == 0 || track.isPaid) {
      setIsPaid(true);
    }
    if (!user || !user.userId || user.userId.length < 4) return;

    await onGetPaidContent(track, user, setIsPaid);
  };

  const onPurchaseContent = async () => {
    if (!(user && user.userId && user.userId.length > 5)) return router.push("/login");
    setLoading(true);
    setShowConfirmDialog(false);
    await purchase(
      user,
      track,
      async () => {
        await onCheckIfContentIsPaid();
        setLoading(false);
      },
      async () => {
        await onCheckIfContentIsPaid();
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    onCheckIfContentIsPaid();
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };
  
  const hasPrice = track.content.pricing?.price || track.price?.price;

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`flex flex-wrap items-center p-3 w-full rounded-lg transition-colors duration-200 group ${
          isPlaying
            ? 'bg-primary/20 border border-primary/30'
            : 'hover:bg-muted/50'
        } ${!isPaid && hasPrice ? 'border-l-4 border-l-amber-500' : ''}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && (isPaid || !hasPrice) && onPlay()}
        onClick={() => (isPaid || !hasPrice) && onPlay()}
      >
        {/* Track number/playing indicator - always visible */}
        <div className="w-8 min-w-[2rem] text-center text-muted-foreground group-hover:text-foreground">
          {isPlaying && !isLoading  ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Music className="h-4 w-4 mx-auto text-primary" />
            </motion.div>
          ) : (
            index + 1
          )}
        </div>

        {/* Track info - main content */}
        <div className="flex-1 min-w-[60%] ml-2 sm:ml-4 py-1">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <p className={`font-medium truncate ${isPlaying ? 'text-primary' : 'text-foreground'}`}>
              {track.content.title}
            </p>
            {!isPaid && hasPrice && (
              <Badge variant="outline" className="h-5 px-1 text-xs bg-amber-500/20 text-amber-600 border-amber-500/30">
                <Lock className="h-3 w-3 mr-1" /> Paid
              </Badge>
            )}
            {isPaid && (
              <Badge variant="outline" className="h-5 px-1 text-xs bg-green-500/20 text-green-600 border-green-500/30">
                <Check className="h-3 w-3 mr-1" /> Owned
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{artistName}</p>
            <span className="hidden xs:inline-block text-muted-foreground">•</span>
            <p className="text-xs sm:text-sm text-muted-foreground xs:mt-0">
              {formatDuration(track.content.duration)}
            </p>
          </div>
        </div>

        {/* Duration (hidden on small screens) */}
        <div className="hidden sm:block text-sm text-muted-foreground mx-2 min-w-[3rem] text-right">
          {formatDuration(track.content.duration)}
        </div>
        <div className={`transition-opacity mb-2 duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
                  <Loader2 
                    className="animate-spin text-blue-500" 
                    aria-label="Loading"
                    size={20}
                  />
                </div> 

        {/* Action buttons */}
        <div className="ml-auto flex items-center">
          {!isPaid && hasPrice ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmDialog(true);
                }}
                variant="secondary"
                size="sm"
                className="h-8 px-2 sm:px-3 opacity-100 group-hover:opacity-100 transition-opacity"
                aria-label={`Purchase ${track.content.title}`}
              >
                {loading ? (
                  <Loader className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <div className="flex flex-row items-center text-xs sm:text-sm">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    MK{hasPrice.toFixed(2)}
                  </div>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={onPlay}
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ml-2 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                aria-label={`Play ${track.content.title}`}
              >
             {!isLoading &&   <div>
                  {isPlaying ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
                </div>}
              </Button>
                       
                 </motion.div>
          )}
        </div>
      </motion.div>

      {/* Purchase Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md mx-4 rounded-lg">
          <DialogHeader className="space-y-4">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Confirm Purchase
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to purchase &ldquo;{track.content.title}&rdquo; by {artistName} for MK{price}?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
              <Image
                src={track.content.thumbnail || track.folderPoster || "/images/default.png"}
                alt={`${track.content.title} album cover`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{track.content.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{artistName}</p>
              <p className="text-xs mt-1">{formatDuration(track.content.duration)}</p>
            </div>
            <div className="font-semibold whitespace-nowrap">MK{price}</div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1 h-11"
            >
              <X size={16} className="mr-2" /> Cancel
            </Button>
            <Button
              type="button"
              onClick={onPurchaseContent}
              className="flex-1 h-11"
              disabled={loading}
            >
              {isLoading ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Check size={16} className="mr-2" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
function AlbumRow({
  album,
  onClick,
  isLoading,
  isSelected,
  isPlaying,
  onPurchase
}: {
  album: MusicFolderItem;
  onClick: () => void;
  isLoading: boolean;
  isSelected: boolean;
  isPlaying?: boolean;
  onPurchase: () => void;
}) {
  
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const isPaid = false;
  const hasPrice = album.price?.price;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`p-4 transition-all duration-300 cursor-pointer hover:bg-accent/50 group ${
          isSelected ? 'ring-2 ring-primary bg-accent/30' : ''
        } ${isDark ? 'bg-card/70 border-border' : 'bg-white border-border'} ${
          isPlaying ? 'border-primary/30' : ''
        } ${!isPaid && hasPrice ? 'border-l-4 border-l-amber-500' : ''}`}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        role="button"
        tabIndex={0}
        aria-label={`Select ${album.folderName}`}
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg shadow-sm"
          >
            <Image
              src={album.folderPoster || '/images/album.webp'}
              alt={`${album.folderName} cover`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-background/70 flex items-center justify-center backdrop-blur-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-6 w-6 border-b-2 border-primary"
                  aria-hidden="true"
                ></motion.div>
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-primary rounded-full"
                ></motion.div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Play className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            {!isPaid && hasPrice && (
              <div className="absolute top-1 right-1">
                <Badge variant="outline" className="h-5 px-1 text-xs bg-amber-500/20 text-amber-600 border-amber-500/30">
                  <Lock className="h-3 w-3" />
                </Badge>
              </div>
            )}
            {isPaid && (
              <div className="absolute top-1 right-1">
                <Badge variant="outline" className="h-5 px-1 text-xs bg-green-500/20 text-green-600 border-green-500/30">
                  <Check className="h-3 w-3" />
                </Badge>
              </div>
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold truncate ${isPlaying ? 'text-primary' : 'text-foreground'} group-hover:text-primary transition-colors`}>
              {album.folderName}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {album.artistName}
              {album.featuredArtists && album.featuredArtists.length > 0 && (
                <> • Feat. {album.featuredArtists.join(', ')}</>
              )}
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm text-muted-foreground">
              {new Date(album.content.releaseDate).getFullYear()}
            </span>
            {hasPrice && (
              <span className="text-sm font-medium text-foreground">
                {isPaid ? (
                  <Badge className="px-2 py-1 bg-green-500/20 text-green-600 border-green-500/30">
                    <Check className="h-3 w-3 mr-1" /> Purchased
                  </Badge>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPurchase();
                      }}
                      className="mt-1"
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      MK{(album?.price?.price || 0).toFixed(2)}
                    </Button>
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Play ${album.folderName}`}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function AlbumRowSkeleton() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`p-4 ${isDark ? 'bg-card/70 border-border' : 'bg-white border-border'}`}>
        <div className="flex items-center gap-4">
          <Skeleton className={`w-16 h-16 rounded-lg ${isDark ? 'bg-muted' : 'bg-muted'}`} />
          <div className="flex-1 space-y-2">
            <Skeleton className={`h-4 w-3/4 ${isDark ? 'bg-muted' : 'bg-muted'}`} />
            <Skeleton className={`h-3 w-1/2 ${isDark ? 'bg-muted' : 'bg-muted'}`} />
          </div>
          <div className="hidden sm:flex flex-col items-end space-y-2">
            <Skeleton className={`h-3 w-10 ${isDark ? 'bg-muted' : 'bg-muted'}`} />
            <Skeleton className={`h-3 w-8 ${isDark ? 'bg-muted' : 'bg-muted'}`} />
          </div>
          <Skeleton className={`h-8 w-8 rounded-full ${isDark ? 'bg-muted' : 'bg-muted'}`} />
        </div>
      </Card>
    </motion.div>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}