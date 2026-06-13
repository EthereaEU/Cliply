"use client";

import * as React from "react";
import { Download, Github, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { VideoCard } from "@/components/video-card";
import { configureURL, checkURL, extractClipID } from "@/lib/utils";
import { fetchVideoWithoutWatermark } from "@/lib/medal-api";
import { MedalClip } from "@/types";

const ERROR_MESSAGE =
  "Please enter a valid Medal clip URL/ID. Make sure you have copied the URL/ID correctly and the clip is not private. OR Wait a couple of seconds and try again.";
const COOLDOWN_START = 3;

export default function Home() {
  const [inputValue, setInputValue] = React.useState("");
  const [clips, setClips] = React.useState<MedalClip[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [downloadedIds, setDownloadedIds] = React.useState<Set<string>>(new Set());
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const videosRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");
    const idParam = params.get("id");
    
    if (urlParam) {
      setInputValue(urlParam);
      handleDownload(urlParam);
    } else if (idParam) {
      setInputValue(idParam);
      handleDownload(idParam);
    }
  }, []);

  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleDownload = async (initialURL?: string) => {
    const inputtedURL = initialURL ?? inputValue;
    const url = configureURL(inputtedURL);
    
    if (!url || !checkURL(url)) {
      setError("Please enter a valid Medal clip URL/ID.");
      return;
    }

    const id = extractClipID(url);
    if (!id) {
      setError("Please enter a valid Medal clip URL/ID.");
      return;
    }

    if (downloadedIds.has(id)) {
      setError("You already downloaded this clip!");
      return;
    }

    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds.`);
      return;
    }

    setCooldown(COOLDOWN_START);
    setDownloadedIds((prev) => new Set(prev).add(id));
    setIsLoading(true);
    setError(null);

    try {
      const video = await fetchVideoWithoutWatermark(url);
      
      if (!video?.valid) {
        setDownloadedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        setError(ERROR_MESSAGE);
        return;
      }

      if (video.src) {
        setClips((prev) => [{ id, src: video.src! }, ...prev]);
        setInputValue("");
        // Auto-scroll to videos section
        setTimeout(() => {
          videosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch {
      setDownloadedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setError(ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleDownload();
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          {/* Hero Section */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">
              Cliply
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-xl mx-auto">
              Download Medal clips without watermarks. No premium required.
            </p>
          </div>

          {/* Input Card */}
          <Card className="animate-scale-in">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste Medal clip URL or ID..."
                  disabled={isLoading || cooldown > 0}
                  className="text-base h-14"
                />
                <Button
                  onClick={() => handleDownload()}
                  disabled={isLoading || cooldown > 0 || !inputValue.trim()}
                  className="w-full h-14 text-base font-semibold"
                  size="lg"
                  variant="glass"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : cooldown > 0 ? (
                    `Wait ${cooldown} seconds`
                  ) : clips.length > 0 ? (
                    "Download Another Clip"
                  ) : (
                    <span className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Download Clip
                    </span>
                  )}
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 animate-fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {clips.length === 0 && !isLoading && (
                <div className="flex items-center justify-center gap-6 text-center text-sm text-white/40">
                  <a
                    href="https://imgur.com/IFMBxNv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white/60 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    How to get the Medal Link or ID
                  </a>
                  <a
                    href="https://github.com/EthereaEU/Cliply/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white/60 transition-colors"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Report an issue
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Videos Section */}
          {clips.length > 0 && (
            <div ref={videosRef} className="mt-8 space-y-8 animate-slide-up">
              {clips.map((clip) => (
                <VideoCard key={clip.id} src={clip.src} id={clip.id} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-between items-start text-xs md:text-sm">
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/EthereaEU/Cliply"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/60 transition-colors"
            aria-label="Github Page"
          >
            <Github className="w-6 h-6" />
          </a>
        </div>

      </footer>
    </div>
  );
}
