import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function configureURL(url: string): string | false {
  if (!url) return false;
  
  if (!url.toLowerCase().includes("medal")) {
    if (!url.includes("/")) {
      return "https://medal.tv/?contentId=" + url.trim();
    }
    return false;
  }
  
  if (
    url.toLowerCase().indexOf("https://") !==
    url.toLowerCase().lastIndexOf("https://")
  ) {
    return false;
  }
  
  if (!url.toLowerCase().includes("https://")) {
    url = "https://" + url;
  }
  
  url = url.replace("?theater=true", "");
  return url.trim();
}

export function checkURL(url: string): boolean {
  try {
    if (!url) return false;
    if (!new URL(url).hostname.toLowerCase().includes("medal")) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

export function extractClipID(url: string): string | false {
  const clipIdMatch = url.match(/\/clips\/([^\/?&]+)/);
  const contentIdMatch = url.match(/[?&]contentId=([^&]+)/);
  
  if (clipIdMatch) return clipIdMatch[1];
  if (contentIdMatch) return contentIdMatch[1];
  
  return false;
}
