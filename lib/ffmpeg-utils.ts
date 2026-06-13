import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

export async function fetchFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg;
}

export async function transcodeToMp3(
  videoUrl: string,
  volume: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ffmpegInstance = await fetchFFmpeg();

  // Set up progress callback before any operations
  let progressInterval: NodeJS.Timeout | null = null;
  let currentProgress = 0;

  const progressHandler = ({ progress }: { progress: number }) => {
    if (onProgress && progress !== undefined) {
      currentProgress = progress;
      onProgress(progress);
    }
  };

  ffmpegInstance.on("progress", progressHandler);

  // Fallback: simulate progress if FFmpeg doesn't report it
  if (onProgress) {
    progressInterval = setInterval(() => {
      if (currentProgress < 0.9) {
        currentProgress += 0.1;
        onProgress(Math.min(currentProgress, 0.95));
      }
    }, 500);
  }

  try {
    // Fetch the video file through proxy to avoid CORS
    const proxyUrl = `/api/proxy/video?url=${encodeURIComponent(videoUrl)}`;
    const response = await fetch(proxyUrl);
    const videoData = await response.arrayBuffer();

    // Write the input file
    await ffmpegInstance.writeFile("input.mp4", new Uint8Array(videoData));

    // Convert linear volume to dB for FFmpeg
    // FFmpeg uses dB where 0dB = original volume, positive = boost, negative = reduce
    const volumeDb = volume === 1 ? 0 : 20 * Math.log10(volume);
    const volumeFilter = volumeDb === 0 ? "" : `volume=${volumeDb}dB`;

    // Convert to MP3 with volume adjustment
    const command = ["-i", "input.mp4"];

    if (volumeFilter) {
      command.push("-af", volumeFilter);
    }

    command.push("-vn", "-acodec", "libmp3lame", "-q:a", "2", "output.mp3");

    await ffmpegInstance.exec(command);

    // Read the output file
    const outputData = await ffmpegInstance.readFile("output.mp3");

    // Clean up
    await ffmpegInstance.deleteFile("input.mp4");
    await ffmpegInstance.deleteFile("output.mp3");

    // Create blob from output data - handle type conversion
    const blob = new Blob([outputData as unknown as BlobPart], { type: "audio/mpeg" });

    return blob;
  } finally {
    // Clean up progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    // Remove event listener
    ffmpegInstance.off("progress", progressHandler);
  }
}
