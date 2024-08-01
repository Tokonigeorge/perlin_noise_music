export interface Track {
  id: string;
  href: string;
  uri: string;
  name: string;
  duration: number;
  artists: { name: string }[];
  preview_url: string;
  album: {
    name: string;
    image: { height: string; width: string; url: string };
  };
}

export interface ISongDetails {
  artists?: string;
  title: string;
  imageUrl?: string;
}

export enum AppActionKind {
  frequency = 'frequency',
  amplitude = 'amplitude',
  playing = 'playing',
}
