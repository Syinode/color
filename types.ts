
export type AppState = 'config' | 'generating' | 'results';

export interface ColoringBookConfig {
    theme: string;
    customTheme: string;
    pageCount: string;
    customPageCount: string;
    artStyle: string;
    customArtStyle: string;
    title: string;
    subtitle: string;
    author: string;
    borderStyle: string;
    addPageNumbers: boolean;
    backgroundStyle: string;
    lineThickness: 'thin' | 'medium' | 'thick';
    printSize: 'US Letter' | 'A4';
    includeBelongsToPage: boolean;
    includeSamplePages: boolean;
    aspectRatio: string;
    coverResolution: '1K' | '2K' | '4K';
}

export interface GeneratedAssets {
    cover: string; // base64 data URL
    interiorPages: string[]; // array of base64 data URLs
    mockup?: string; //
}

export interface EtsyListing {
    title: string;
    description: string;
    tags: string[];
    materials: string;
    marketingBlurbs: string[];
}

export interface GenerationStatus {
    message: string;
    progress: number;
    currentStep: number;
    totalSteps: number;
    logs: string[];
}
