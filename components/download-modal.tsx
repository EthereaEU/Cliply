"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, FileAudio, ArrowLeft } from "lucide-react";
import { AudioEditor } from "@/components/audio-editor";

interface DownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoSrc: string;
  videoId: string;
}

type Format = "mp4" | "mp3";

export function DownloadModal({ open, onOpenChange, videoSrc, videoId }: DownloadModalProps) {
  const [selectedFormat, setSelectedFormat] = React.useState<Format | null>(null);
  const [showAudioEditor, setShowAudioEditor] = React.useState(false);

  const handleFormatSelect = (format: Format) => {
    if (format === "mp3") {
      setSelectedFormat(format);
      setShowAudioEditor(true);
    } else {
      // Direct MP4 download
      const link = document.createElement("a");
      link.href = videoSrc;
      link.download = `${videoId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    setShowAudioEditor(false);
    setSelectedFormat(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogClose onClick={() => onOpenChange(false)} />
        
        {!showAudioEditor ? (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Download Format</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleFormatSelect("mp4")}
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-3 text-base hover:border-primary hover:bg-primary/10 transition-all border-primary/30"
              >
                <Video className="w-8 h-8 text-primary" />
                <span className="font-medium text-white">MP4</span>
                <span className="text-xs text-white/40">Video</span>
              </Button>
              
              <Button
                onClick={() => handleFormatSelect("mp3")}
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-3 text-base hover:border-primary hover:bg-primary/10 transition-all border-primary/30"
              >
                <FileAudio className="w-8 h-8 text-primary" />
                <span className="font-medium text-white">MP3</span>
                <span className="text-xs text-white/40">Audio</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <AudioEditor
              videoSrc={videoSrc}
              videoId={videoId}
              onBack={handleBack}
              onClose={() => onOpenChange(false)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
