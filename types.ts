

export enum Theme {
  Realistic = 'Real',
  TwoDAnimations = '2D Animations',
  ThreeDAnimation = '3D Animation',
  Mix = 'Mix',
}

export enum Gender {
  Girl = 'Girl',
  Boy = 'Boy',
  Women = 'Women',
  Man = 'Man',
  Non = 'Non',
}

export enum Background {
  Studio = 'Studio',
  Poster = 'Poster',
  Event = 'Event',
  Free = 'Free',
}

export enum CamShot {
  CloseUp = 'Close Up',
  Medium = 'Medium',
  MediumShot = 'Medium Shot',
  WideShot = 'Wide Shot',
}

export enum From {
  Jepang = 'Jepang',
  China = 'China',
  Rusia = 'Rusia',
  Inggris = 'Inggris',
}

export enum Action {
    Naskah = 'Naskah',
    Pose = 'Pose',
    Bicara = 'Bicara',
    Santai = 'Santai',
}

export enum MovieStyle {
  EightK = '8K Quality',
  FlatDesign = 'Flat Design',
  ThreeDCGI = '3D CGI',
  Anime = 'Anime',
}

export enum AspectRatio {
  Square = '1:1',
  Portrait = '3:4',
  Landscape = '4:3',
  Tall = '9:16',
  Wide = '16:9',
}

export enum ImageQuality {
  OneK = '1K',
  TwoK = '2K',
  FourK = '4K',
}

export enum VideoFilter {
  TealOrange = 'Teal & Orange',
  Vintage = 'Vintage',
  Retro = 'Retro',
  FilmGrain = 'Film Grain',
  Moody = 'Moody',
}

export type Language = 'English' | 'Indonesia' | 'Jepang';

export interface MovieCanvasOptions {
  edit: string;
}

export interface PromptOptions {
  theme: Theme;
  gender: Gender;
  background: Background;
  camShot: CamShot;
  from: From;
  action: Action;
  aspectRatio: AspectRatio;
  imageQuality: ImageQuality;
  freeBackgroundText?: string;
  movieStyle?: MovieStyle;
}