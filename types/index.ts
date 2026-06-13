export interface VideoResponse {
  valid: boolean;
  src?: string;
  error?: string;
}

export interface ClipHistory {
  id: string;
  active: boolean;
  timestamp: number;
}

export interface MedalClip {
  id: string;
  src: string;
  title?: string;
}
