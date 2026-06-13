import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    // Validate request body
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { valid: false, error: "URL is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate the URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { valid: false, error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Validate it's a Medal URL
    if (!url.toLowerCase().includes("medal")) {
      return NextResponse.json(
        { valid: false, error: "URL must be from Medal.tv" },
        { status: 400 }
      );
    }

    // Extract clip ID from URL
    const clipIdMatch = url.match(/\/clips\/([^\/?&]+)/);
    const contentIdMatch = url.match(/[?&]contentId=([^&]+)/);
    
    let clipId: string | null = null;
    if (clipIdMatch) {
      clipId = clipIdMatch[1];
    } else if (contentIdMatch) {
      clipId = contentIdMatch[1];
    }

    if (!clipId) {
      return NextResponse.json(
        { valid: false, error: "Could not extract clip ID from URL. Make sure the URL is a valid Medal clip." },
        { status: 400 }
      );
    }

    // Construct the Medal URL
    const medalUrl = url.includes("medal.tv") ? url : `https://medal.tv/clips/${clipId}`;
    
    try {
      // Fetch the Medal clip page
      const response = await fetch(medalUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Medal page: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

      // Try multiple patterns to extract video URL
      let videoUrl: string | null = null;

      // Pattern 1: Direct MP4 URLs
      const directMatch = html.match(/https:\/\/[^"\s]+\.mp4[^"\s]*/);
      if (directMatch) {
        videoUrl = directMatch[0];
      }

      // Pattern 2: JSON-encoded URLs
      if (!videoUrl) {
        const jsonMatch = html.match(/"url":"([^"]+\.mp4[^"]*)"/);
        if (jsonMatch) {
          try {
            videoUrl = JSON.parse(`"${jsonMatch[1]}"`);
          } catch {
            // If JSON parsing fails, use the raw match
            videoUrl = jsonMatch[1].replace(/\\u0026/g, "&");
          }
        }
      }

      // Pattern 3: Data attributes
      if (!videoUrl) {
        const dataMatch = html.match(/data-video-url="([^"]+)"/);
        if (dataMatch) {
          videoUrl = dataMatch[1];
        }
      }

      // Pattern 4: Script tags with video data
      if (!videoUrl) {
        const scriptMatch = html.match(/videoUrl["']?\s*:\s*["']([^"']+)["']/);
        if (scriptMatch) {
          videoUrl = scriptMatch[1];
        }
      }

      if (!videoUrl) {
        return NextResponse.json(
          { valid: false, error: "Could not extract video URL from Medal page. The clip may be private, deleted, or the format may have changed." },
          { status: 400 }
        );
      }

      // Clean up the URL
      videoUrl = videoUrl.replace(/\\u0026/g, "&").replace(/\\/g, "");

      return NextResponse.json({
        valid: true,
        src: videoUrl,
      });

    } catch (error) {
      console.error("Error fetching Medal page:", error);
      
      // Provide helpful error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      return NextResponse.json(
        { valid: false, error: `Failed to process Medal clip: ${errorMessage}. The clip may be private or temporarily unavailable.` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
