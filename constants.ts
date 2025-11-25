
import type { ColoringBookConfig } from './types';

export const INITIAL_CONFIG: ColoringBookConfig = {
    theme: 'Cute Animals',
    customTheme: '',
    pageCount: '20',
    customPageCount: '',
    artStyle: 'Medium detail kids line art',
    customArtStyle: '',
    title: '',
    subtitle: '',
    author: '',
    borderStyle: 'None',
    addPageNumbers: true,
    backgroundStyle: 'None',
    lineThickness: 'medium',
    printSize: 'US Letter',
    includeBelongsToPage: true,
    includeSamplePages: false,
    aspectRatio: '3:4',
    coverResolution: '1K',
};

export const THEMES = [
    'Cute Animals', 'Baby Animals', 'Farm Animals', 'Jungle Safari', 'Aquatic Ocean Animals',
    'Dinosaurs', 'Unicorns', 'Mermaids', 'Fairies', 'Princess World', 'Space Adventures',
    'Robots', 'Monster Friends', 'Vehicles', 'Fantasy Creatures', 'Super Simple Toddlers Pack',
    'Shapes, ABCs & 123s', 'Mazes', 'Christmas', 'Halloween', 'Easter', 'Mixed Mega Pack'
];

export const PAGE_COUNTS = ['10', '20', '30', '40', '50', '75', '100'];

export const ART_STYLES = [
    'Bold simple toddler line art', 'Medium detail kids line art', 'High detail line art',
    'Cute/Kawaii', 'Cartoon style', 'Realistic line art', 'Whimsical storybook style',
    'Coloring mandalas', 'Mixed pack'
];

export const BORDER_STYLES = ['None', 'Simple Line', 'Dotted Line', 'Floral', 'Stars and Moons'];

export const BACKGROUND_STYLES = ['None', 'Simple Floral', 'Geometric Patterns', 'Abstract Textures'];

export const ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

export const IMAGE_RESOLUTIONS = ['1K', '2K', '4K'];
