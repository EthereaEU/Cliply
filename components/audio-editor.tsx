"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Play, Pause, Volume2 } from "lucide-react";
import { fetchFFmpeg, transcodeToMp3 } from "@/lib/ffmpeg-utils";

interface AudioEditorProps {
  videoSrc: string;
  videoId: string;
  onBack: () => void;
  onClose: () => void;
}

export function AudioEditor({ videoSrc, videoId, onBack, onClose }: AudioEditorProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumeDb, setVolumeDb] = useState(0); // dB scale, 0 = original volume
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Convert dB to linear gain for audio processing
  const dbToLinear = (db: number): number => {
    return Math.pow(10, db / 20);
  };

  // Convert linear gain to dB for display
  const linearToDb = (linear: number): number => {
    return 20 * Math.log10(linear);
  };

  useEffect(() => {
    let isMounted = true;
    let ws: WaveSurfer | null = null;
    let abortController = new AbortController();

    const initWaveSurfer = async () => {
      if (waveformRef.current && isMounted && !wavesurferRef.current) {
        try {
          ws = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: "rgba(99, 102, 241, 0.3)",
            progressColor: "rgb(99, 102, 241)",
            cursorColor: "rgb(99, 102, 241)",
            barWidth: 2,
            barGap: 3,
            barRadius: 3,
            height: 96,
            normalize: true,
            backend: "WebAudio",
          });

          ws.on("play", () => {
            if (isMounted) setIsPlaying(true);
          });
          ws.on("pause", () => {
            if (isMounted) setIsPlaying(false);
          });
          ws.on("finish", () => {
            if (isMounted) setIsPlaying(false);
          });

          if (isMounted) {
            wavesurferRef.current = ws;
            // Load the video as audio
            await ws.load(videoSrc);
          }
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error("Error initializing WaveSurfer:", error);
          }
        }
      }
    };

    initWaveSurfer();

    return () => {
      isMounted = false;
      abortController.abort();
      
      // Pause playback before cleanup
      if (ws) {
        try {
          ws.pause();
        } catch (error) {
          // Ignore pause errors during cleanup
        }
      }
      
      // Clean up the local instance
      if (ws) {
        try {
          ws.destroy();
        } catch (error) {
          // Ignore destroy errors - this is expected during unmount
        }
      }
      
      // Clean up the ref
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.pause();
        } catch (error) {
          // Ignore pause errors
        }
        try {
          wavesurferRef.current.destroy();
        } catch (error) {
          // Ignore destroy errors - this is expected during unmount
        }
        wavesurferRef.current = null;
      }
    };
  }, [videoSrc]);

  useEffect(() => {
    if (wavesurferRef.current) {
      const linearVolume = dbToLinear(volumeDb);
      wavesurferRef.current.setVolume(linearVolume);
    }
  }, [volumeDb]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolumeDb = parseFloat(e.target.value);
    setVolumeDb(newVolumeDb);
  };

  const handleConvertToMp3 = async () => {
    setIsConverting(true);
    setConversionProgress(0);

    try {
      // Initialize FFmpeg
      await fetchFFmpeg();

      // Convert video to MP3 with volume adjustment
      const linearVolume = dbToLinear(volumeDb);
      const mp3Blob = await transcodeToMp3(videoSrc, linearVolume, (progress: number) => {
        setConversionProgress(progress);
      });

      setAudioBlob(mp3Blob);

      // Download the converted file
      const url = URL.createObjectURL(mp3Blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${videoId}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error("Conversion error:", error);
      alert("Failed to convert to MP3. Please try again.");
    } finally {
      setIsConverting(false);
      setConversionProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div ref={waveformRef} className="w-full bg-surface/50 rounded-xl h-24" />
        
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePlayPause}
            variant="glass"
            size="icon"
            className="flex-shrink-0"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          
          <div className="flex-1 flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-white/40" />
            <input
              type="range"
              min="-48"
              max="48"
              step="1"
              value={volumeDb}
              onChange={handleVolumeChange}
              className="flex-1 h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm text-white/40 w-14 text-right font-mono">
              {volumeDb > 0 ? `+${volumeDb}` : volumeDb} dB
            </span>
          </div>
        </div>
      </div>

      {isConverting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-white/60">
            <span>Converting...</span>
            <span>{Math.round(conversionProgress * 100)}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${conversionProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleConvertToMp3}
        disabled={isConverting}
        className="w-full"
        size="lg"
        variant="glass"
      >
        {isConverting ? (
          "Converting..."
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            Download MP3
          </>
        )}
      </Button>
    </div>
  );
}
