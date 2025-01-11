export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Thumbnails {
  default: Thumbnail;
  medium: Thumbnail;
  high: Thumbnail;
  standard?: Thumbnail;
  maxres?: Thumbnail;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  itemCount: number;
  privacyStatus?: string;
  publishedAt?: string;
}

export interface PlaylistItem {
  id: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  videoId: string;
  position: number;
  publishedAt?: string;
}