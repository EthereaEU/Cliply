import * as React from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DownloadModal } from "@/components/download-modal";
import { VideoPlayer } from "@/components/video-player";

interface VideoCardProps {
  src: string;
  id: string;
  className?: string;
}

export function VideoCard({ src, id, className }: VideoCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto animate-scale-in",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <VideoPlayer src={src} className="w-full" />
        
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="glass"
          size="lg"
          className="w-full max-w-md"
        >
          <Download className="w-5 h-5 mr-2" />
          Download
        </Button>
      </div>

      <DownloadModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        videoSrc={src}
        videoId={id}
      />
    </div>
  );
}
