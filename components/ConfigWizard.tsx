
import React, { useState } from 'react';
import type { ColoringBookConfig } from '../types';
import { ChevronRight, Palette, Book, Hash, Settings, AlertCircle, Loader2, Monitor, Minimize } from 'lucide-react';
import { OptionButton } from './OptionButton';
import { CustomInput } from './CustomInput';
import { Toggle } from './Toggle';
import { ASPECT_RATIOS, IMAGE_RESOLUTIONS } from '../constants';

interface ConfigWizardProps {
    config: ColoringBookConfig;
    updateConfig: (newConfig: Partial<ColoringBookConfig>) => void;
    onGenerate: () => void;
    error: string | null;
    themes: string[];
    pageCounts: string[];
    artStyles: string[];
    borderStyles: string[];
    backgroundStyles: string[];
}

export const ConfigWizard: React.FC<ConfigWizardProps> = ({ config, updateConfig, onGenerate, error, themes, pageCounts, artStyles, borderStyles, backgroundStyles }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGenerateClick = () => {
        setIsSubmitting(true);
        // Add a small delay so the user sees the loading state before the view switches
        setTimeout(() => {
            onGenerate();
        }, 600);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-800 mb-2 font-display">Create Your Coloring Book</h2>
            <p className="text-slate-500 mb-8">Follow the steps below to generate your commercial-ready coloring book.</p>
            
            <div className="space-y-10">
                {/* Step 1: Theme */}
                <section>
                    <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center"><Palette className="w-6 h-6 mr-3 text-indigo-500" />Choose a Theme</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {themes.map(theme => (
                            <OptionButton key={theme} label={theme} isSelected={config.theme === theme} onClick={() => updateConfig({ theme })} />
                        ))}
                    </div>
                    <CustomInput
                        placeholder="Or enter a custom theme..."
                        value={config.customTheme}
                        onChange={e => updateConfig({ customTheme: e.target.value, theme: e.target.value ? 'Custom' : themes[0] })}
                        className="mt-4"
                    />
                </section>

                {/* Step 2: Page Count */}
                <section>
                    <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center"><Book className="w-6 h-6 mr-3 text-teal-500" />Choose Page Count</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {pageCounts.map(count => (
                            <OptionButton key={count} label={count} isSelected={config.pageCount === count} onClick={() => updateConfig({ pageCount: count })} />
                        ))}
                    </div>
                     <CustomInput
                        type="number"
                        placeholder="Or a custom number..."
                        value={config.customPageCount}
                        onChange={e => updateConfig({ customPageCount: e.target.value, pageCount: e.target.value ? 'Custom' : pageCounts[0] })}
                        className="mt-4"
                    />
                </section>

                {/* Step 3: Art Style */}
                <section>
                    <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center"><Hash className="w-6 h-6 mr-3 text-pink-500" />Choose Art Style</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {artStyles.map(style => (
                            <OptionButton key={style} label={style} isSelected={config.artStyle === style} onClick={() => updateConfig({ artStyle: style })} />
                        ))}
                    </div>
                    <CustomInput
                        placeholder="Or describe a custom style..."
                        value={config.customArtStyle}
                        onChange={e => updateConfig({ customArtStyle: e.target.value, artStyle: e.target.value ? 'Custom' : artStyles[0] })}
                        className="mt-4"
                    />
                </section>

                {/* Step 4: Optional Customizations */}
                <section>
                     <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center"><Settings className="w-6 h-6 mr-3 text-amber-500" />Optional Customizations</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-lg">
                        <CustomInput label="Book Title (optional)" placeholder="e.g., My Awesome Animal Book" value={config.title} onChange={e => updateConfig({ title: e.target.value })} />
                        <CustomInput label="Subtitle (optional)" placeholder="e.g., A Fun Coloring Adventure" value={config.subtitle} onChange={e => updateConfig({ subtitle: e.target.value })} />
                        <CustomInput label="Author/Publisher Name" placeholder="e.g., Creative Kids Press" value={config.author} onChange={e => updateConfig({ author: e.target.value })} />
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Line Thickness</label>
                            <div className="flex space-x-2">
                                <OptionButton label="Thin" isSelected={config.lineThickness === 'thin'} onClick={() => updateConfig({ lineThickness: 'thin' })} />
                                <OptionButton label="Medium" isSelected={config.lineThickness === 'medium'} onClick={() => updateConfig({ lineThickness: 'medium' })} />
                                <OptionButton label="Thick" isSelected={config.lineThickness === 'thick'} onClick={() => updateConfig({ lineThickness: 'thick' })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Background Style</label>
                            <div className="grid grid-cols-2 gap-2">
                                {backgroundStyles.map(style => (
                                    <OptionButton 
                                        key={style} 
                                        label={style} 
                                        isSelected={config.backgroundStyle === style} 
                                        onClick={() => updateConfig({ backgroundStyle: style })} 
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center"><Monitor className="w-4 h-4 mr-1"/> Cover Resolution</label>
                            <div className="flex space-x-2">
                                {IMAGE_RESOLUTIONS.map(res => (
                                    <OptionButton 
                                        key={res} 
                                        label={res} 
                                        isSelected={config.coverResolution === res} 
                                        onClick={() => updateConfig({ coverResolution: res as any })} 
                                    />
                                ))}
                            </div>
                        </div>

                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center"><Minimize className="w-4 h-4 mr-1"/> Page Aspect Ratio</label>
                            <div className="grid grid-cols-4 gap-2">
                                {ASPECT_RATIOS.map(ratio => (
                                    <OptionButton 
                                        key={ratio} 
                                        label={ratio} 
                                        isSelected={config.aspectRatio === ratio} 
                                        onClick={() => updateConfig({ aspectRatio: ratio })} 
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Toggle label="Add Page Numbers" enabled={config.addPageNumbers} setEnabled={val => updateConfig({ addPageNumbers: val })} />
                        </div>
                     </div>
                </section>
            </div>
            
            {error && (
                <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <div className="flex">
                        <div className="py-1"><AlertCircle className="h-6 w-6 text-red-500 mr-4" /></div>
                        <div>
                            <p className="font-bold">Generation Failed</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-12 text-center">
                <button 
                    onClick={handleGenerateClick}
                    disabled={isSubmitting} 
                    className={`bg-indigo-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg flex items-center justify-center mx-auto transition-all duration-300 ease-in-out ${isSubmitting ? 'opacity-80 cursor-wait' : 'hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-1'}`}
                >
                    {isSubmitting ? (
                        <>
                            Generating...
                            <Loader2 className="w-6 h-6 ml-2 animate-spin" />
                        </>
                    ) : (
                        <>
                            Generate My Coloring Book
                            <ChevronRight className="w-6 h-6 ml-2" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
