
import React, { useState } from 'react';
import type { GeneratedAssets, EtsyListing, ColoringBookConfig } from '../types';
import { Download, Package, RefreshCw, FileText, Tags, MessageSquare, BookOpen, ChevronUp, ChevronDown, Wand2, ArrowLeft, Volume2 } from 'lucide-react';
import { OptionButton } from './OptionButton';

interface ResultsViewProps {
    assets: GeneratedAssets | null;
    etsyData: EtsyListing | null;
    config: ColoringBookConfig;
    onDownloadPdf: () => void;
    onDownloadZip: () => void;
    onRestart: () => void;
    onRegenerate: () => void;
    onPlayAudio: (text: string) => void;
}

const AccordionItem: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }> = ({ title, icon, children, action }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-slate-200 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center font-semibold text-slate-700">
                    {icon}
                    <span className="ml-3">{title}</span>
                </div>
                <div className="flex items-center space-x-2">
                    {action}
                    {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </div>
            </button>
            {isOpen && <div className="p-4 bg-white whitespace-pre-wrap text-slate-600 text-sm">{children}</div>}
        </div>
    );
};


export const ResultsView: React.FC<ResultsViewProps> = ({ assets, etsyData, config, onDownloadPdf, onDownloadZip, onRestart, onRegenerate, onPlayAudio }) => {
    if (!assets) return <div className="text-center">Loading results...</div>;

    const CoverPreview = () => (
        <div className="relative w-full aspect-[8.5/11] bg-white rounded-lg shadow-lg overflow-hidden">
            <img src={assets.cover} alt="Coloring Book Cover" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-between p-8 text-center text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <div>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl break-words">{config.title || config.theme}</h2>
                    {config.subtitle && <p className="mt-2 text-lg md:text-xl">{config.subtitle}</p>}
                </div>
                {config.author && <p className="text-base md:text-lg">By {config.author}</p>}
            </div>
        </div>
    );
    
    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-display text-slate-800">✨ Your Coloring Book is Ready! ✨</h1>
                <p className="text-slate-500 mt-2 max-w-2xl mx-auto">Download your assets below, or use the generated Etsy Listing Pack to start selling right away.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Previews */}
                <div className="lg:col-span-2 space-y-8">
                    <h3 className="text-2xl font-bold text-slate-700 flex items-center"><BookOpen className="w-6 h-6 mr-3 text-indigo-500" />Asset Previews</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold mb-2 text-center text-slate-600">Full-Color Cover</h4>
                            <CoverPreview/>
                        </div>
                        <div>
                           <h4 className="font-semibold mb-2 text-center text-slate-600">3D Mockup</h4>
                           <div className="flex justify-center items-center bg-slate-200 rounded-lg p-4 aspect-[8.5/11]">
                             <div style={{ transform: 'perspective(1500px) rotateY(-25deg) rotateX(5deg)', transformStyle: 'preserve-3d' }}>
                                 <CoverPreview />
                             </div>
                           </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-slate-600">Interior Pages (First 6)</h4>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {assets.interiorPages.slice(0, 6).map((page, index) => (
                                <img key={index} src={page} alt={`Page ${index + 1}`} className="w-full aspect-[8.5/11] object-cover rounded-md shadow-md bg-white border" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <div>
                        <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center"><Download className="w-6 h-6 mr-3 text-green-500" />Downloads</h3>
                        <div className="space-y-3">
                            <button onClick={onDownloadPdf} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105">PDF Coloring Book</button>
                            <button onClick={onDownloadZip} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105">ZIP (PDF & PNGs)</button>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center"><Package className="w-6 h-6 mr-3 text-purple-500" />Etsy Listing Pack</h3>
                        <div className="space-y-2">
                           {etsyData && (
                               <>
                                   <AccordionItem title="Product Title" icon={<FileText className="w-5 h-5"/>}>{etsyData.title || 'Not generated.'}</AccordionItem>
                                   <AccordionItem 
                                        title="Product Description" 
                                        icon={<MessageSquare className="w-5 h-5"/>}
                                        action={
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onPlayAudio(etsyData.description); }}
                                                className="p-1 hover:bg-slate-200 rounded-full text-indigo-600"
                                                title="Listen to description"
                                            >
                                                <Volume2 className="w-4 h-4" />
                                            </button>
                                        }
                                   >
                                        {etsyData.description || 'Not generated.'}
                                   </AccordionItem>
                                   <AccordionItem title="13 SEO Tags" icon={<Tags className="w-5 h-5"/>}>{etsyData.tags?.join(', ') || 'Not generated.'}</AccordionItem>
                               </>
                           )}
                        </div>
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center"><Wand2 className="w-6 h-6 mr-3 text-pink-500" />Actions</h3>
                       <div className="space-y-3">
                            {/* FIX: The 'isSelected' prop is required by OptionButton. Setting to false for these action buttons. */}
                            <OptionButton label="Regenerate Whole Book" icon={<RefreshCw />} onClick={onRegenerate} isSelected={false} />
                            {/* FIX: The 'isSelected' prop is required by OptionButton. Setting to false for these action buttons. */}
                            <OptionButton label="Start Over / New Book" icon={<ArrowLeft />} onClick={onRestart} isSelected={false} />
                       </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
