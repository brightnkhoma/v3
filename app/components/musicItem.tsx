"use client"
import { MusicFolderItem, User } from "../lib/types";
import { useTheme } from "next-themes";
import { Play, Pause, MoreHorizontal, Clock, Loader2, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../appContext";
import { onGetPaidContent, purchase } from "../lib/dataSource/contentDataSource";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface MusicCardProps {
  item: MusicFolderItem;
  index: number;
  isPlaying?: boolean;
  onPlay?: () => void;
  user: User;
}

const MusicCard = ({ item, index, isPlaying, onPlay, user }: MusicCardProps) => {
  const { artistName, content } = item;
  const { title, duration } = content;
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const router = useRouter();
  const { theme } = useTheme();
  const price = item.content.pricing.price || item.price?.price || 0;

  const onCheckIfContentIsPaid = async () => {
    const price = item.content.pricing.price || item.price?.price || 0;
    if (price == 0 || item.isPaid) {
      setIsPaid(true);
    }
    if (!user || !user.userId || user.userId.length < 4) return;

    await onGetPaidContent(item, user, setIsPaid);
  };

  const onPurchaseContent = async () => {
    if (!(user && user.userId && user.userId.length > 5)) return router.push("/login");
    setLoading(true);
    setShowConfirmDialog(false);
    await purchase(
      user,
      item,
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        className={cn(
          "group flex items-center gap-4 p-3  transition-colors border-none",
          isPlaying
            ? "bg-primary/0 border-primary/0 shadow-sm"
            : "bg-card/0 hover:bg-accent border-bordern",
          theme === "dark" ? "shadow-none" : "shadow-sm"
        )}
      >
        <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden shadow-sm">
          <Image
            src={item.content.thumbnail || item.folderPoster || "/images/default.png"}
            alt={`${title} album cover`}
            fill
            className={cn("object-cover transition-all", isPlaying && "brightness-90 scale-105")}
          />
          <motion.button
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center transition-all bg-black/30 opacity-0 group-hover:opacity-100"
            whileHover={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          >
            {isPlaying ? (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Pause className="text-white" size={18} />
              </motion.div>
            ) : (
              <Play className="text-white ml-0.5" size={18} />
            )}
          </motion.button>

          {/* Visual indicator for currently playing track */}
          {isPlaying && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: duration, ease: "linear" }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "font-medium truncate",
                isPlaying ? "text-primary" : "text-foreground"
              )}
            >
              {title}
            </h3>
            {isPaid && (
              <Badge variant="outline" className="text-xs py-0 px-1.5">
                <Check size={12} className="mr-1" /> Owned
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{artistName}</p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-sm flex items-center gap-1",
              isPlaying ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Clock size={14} />
            {formatDuration(duration)}
          </span>

          {/* Audio wave animation for playing state */}
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-5 mr-2">
              {[1, 2, 3, 2].map((height, i) => (
                <motion.span
                  key={i}
                  className="w-1 bg-primary rounded-full"
                  initial={{ height: `${height * 4}px` }}
                  animate={{
                    height: [
                      `${height * 4}px`,
                      `${(height + 1) * 5}px`,
                      `${height * 4}px`,
                    ],
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal size={16} />
          </Button>

          {!isPaid && (
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={loading}
              className="min-w-[90px]"
              size="sm"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                `Buy • MK${price}`
              )}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Confirm Purchase
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to purchase &ldquo;{title}&rdquo; by {artistName} for MK{price}?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
              <Image
                src={item.content.thumbnail || item.folderPoster || "/images/default.png"}
                alt={`${title} album cover`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{title}</h4>
              <p className="text-xs text-muted-foreground">{artistName}</p>
              <p className="text-xs mt-1">{formatDuration(duration)}</p>
            </div>
            <div className="font-semibold">MK{price}</div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1"
            >
              <X size={16} className="mr-2" /> Cancel
            </Button>
            <Button
              type="button"
              onClick={onPurchaseContent}
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Check size={16} className="mr-2" />
              )}
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const MusicListSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-4 p-3 rounded-lg border",
            theme === "dark" ? "border-border" : "border-border"
          )}
        >
          <Skeleton className="w-12 h-12 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  );
};

interface MusicListProps {
  items: MusicFolderItem[];
  className?: string;
  currentPlayingIndex?: string;
  onPlay: (index: number) => Promise<void>;
  isLoading?: boolean;
  user: User;
}

export const MusicList = ({
  items,
  className,
  currentPlayingIndex,
  onPlay,
  isLoading = false,
  user,
}: MusicListProps) => {
  if (isLoading) {
    return <MusicListSkeleton />;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <AnimatePresence>
        {(items || []).map((item, index) => (
          <MusicCard
            key={`${item.folderName}-${index}`}
            item={item}
            index={index}
            isPlaying={currentPlayingIndex === item.content.contentId}
            onPlay={async () => await onPlay(index)}
            user={user}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};