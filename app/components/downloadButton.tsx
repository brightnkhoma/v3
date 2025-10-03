import { useState } from "react";
import { Download, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { showToast } from "../lib/dataSource/toast";

interface DownloadButtonProps {
  download: () => Promise<void>;
  isDownloading: boolean;
  progress: number;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "secondary" | "outline" | "ghost";
}

export default function DownloadButton({ 
  download, 
  isDownloading, 
  progress, 
  className = "w-max",
  size = "default",
  variant = "default"
}: DownloadButtonProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setError(null);
    setIsSuccess(false);
    
    try {
      await download();
      setIsSuccess(true);
      
      showToast(
       "Download completed! Your file has been saved successfully.",
      );
      
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err) {
      const errorMessage =  "Download failed";
      setError(errorMessage);
      console.log(err);
      
      
      showToast( "Download failed");
    }
  };

  const getButtonVariant = () => {
    if (error) return "destructive";
    if (isSuccess) return "default";
    return variant;
  };

  const getButtonContent = () => {
    if (isSuccess) {
      return (
        <>
          <Check className="w-4 h-4" />
          <span>Saved!</span>
        </>
      );
    }

    if (isDownloading) {
      return (
        <>
          <div className="relative w-4 h-4">
            <svg className="w-4 h-4 transform -rotate-90 animate-spin">
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                opacity="0.3"
              />
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 6}
                strokeDashoffset={2 * Math.PI * 6 * (1 - progress / 100)}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span>Downloading... {Math.round(progress)}%</span>
        </>
      );
    }

    if (error) {
      return (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Failed - Retry</span>
        </>
      );
    }

    return (
      <>
        <Download className="w-4 h-4" />
        <span>Save</span>
      </>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            variant={getButtonVariant()}
            size={size}
            className={`relative w-max transition-all duration-300 gap-2 ${className} ${
              isSuccess ? "bg-green-600 hover:bg-green-700" : ""
            }`}
          >
            {getButtonContent()}
          </Button>
        </TooltipTrigger>
        
        {(error || isDownloading) && (
          <TooltipContent>
            <p className="text-sm">
              {error ? error : `Downloading... ${Math.round(progress)}% complete`}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}