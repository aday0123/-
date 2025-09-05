
export interface Quiz1Question {
  word: string;
  correctDefinition: string;
  options: string[];
}

export interface Quiz2Question {
  word: string;
  sentence: string;
  options: string[];
}

export type QuizQuestion = Quiz1Question | Quiz2Question;

export enum QuizType {
  DEFINITION = 'definition',
  SENTENCE = 'sentence',
}

export enum AppState {
  INPUT = 'INPUT',
  SELECT = 'SELECT',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
}

export interface TTSSettings {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  volume: number;
}

export const IMAGE_STYLES = [
    "一般繪本風格", 
    "吉卜力風格", 
    "著色風格", 
    "真實圖片風格",
    "像素藝術風格",
    "水彩畫風格"
] as const;

export type ImageStyle = typeof IMAGE_STYLES[number];
