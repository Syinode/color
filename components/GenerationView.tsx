
import React, { useEffect, useRef } from 'react';
import type { GenerationStatus, GeneratedAssets, ColoringBookConfig } from '../types';
import { Loader2, CheckCircle2, Terminal, Image as ImageIcon } from 'lucide-react';

interface GenerationViewProps {
    status: GenerationStatus;
    assets: GeneratedAssets | null;
    config: ColoringBookConfig;
}

export const GenerationView: React.FC<GenerationViewProps> = ({ status, assets, config }) => {
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [status.logs]);

    const totalPages = parseInt(config.pageCount, 10);
    const generatedCount = assets?.interiorPages.length || 0;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Panel: Status & Logs */}
            <div className="w-full md:w-5/12 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="bg-indigo-600 p-6 text-white">
                    <h2 className="text-2xl font-bold font-display mb-1">Building Your Book</h2>
                    <p className="text-indigo-100 text-sm opacity-90">Please keep this window open.</p>
                </div>
                
                <div className="p-6 border-b border-slate-200">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Progress</span>
                        <span className="text-lg font-bold text-indigo-600">{Math.round(status.progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-indigo-500 h-3 rounded-full transition-all duration-500 ease-out relative"
                            style={{ width: `${status.progress}%` }}
                        >
                             <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] border-t-transparent border-r-transparent border-b-transparent" style={{backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem'}}></div>
                        </div>
                    </div>
                    <div className="mt-4 flex items-start space-x-3 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                         <Loader2 className="w-5 h-5 text-indigo-600 animate-spin mt-0.5 flex-shrink-0" />
                         <div>
                             <p className="text-sm font-bold text-indigo-900">Step {status.currentStep} of {status.totalSteps}</p>
                             <p className="text-sm text-slate-600 leading-snug">{status.message}</p>
                         </div>
                    </div>
                </div>

                <div className="flex-grow flex flex-col p-4 bg-slate-900 min-h-[300px]">
                     <div className="flex items-center text-slate-400 mb-3 text-xs uppercase tracking-wider font-semibold">
                        <Terminal className="w-4 h-4 mr-2" />
                        Live Activity Log
                    </div>
                    <div className="overflow-y-auto flex-grow space-y-2 text-xs font-mono text-slate-300 scrollbar-thin scrollbar-thumb-slate-700 pr-2 h-0">
                        {status.logs.map((log, i) => (
                            <div key={i} className="flex items-start">
                                <span className="text-indigo-500 mr-2 flex-shrink-0 mt-0.5">➜</span>
                                <span className="break-words leading-relaxed opacity-90">{log.replace(/^\[.*?\] /, '')}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>

            {/* Right Panel: Visual Preview */}
            <div className="w-full md:w-7/12 p-6 md:p-8 bg-white overflow-y-auto max-h-[800px]">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-indigo-500"/>
                    Live Preview
                </h3>

                {/* Cover Preview Section */}
                <div className="mb-8">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Cover Art</p>
                    <div className="aspect-video w-full bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                        {assets?.cover ? (
                            <>
                                <img src={assets.cover} className="w-full h-full object-cover" alt="Generated Cover" />
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6">
                                {status.currentStep === 2 ? (
                                    <div className="flex flex-col items-center animate-pulse">
                                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                                        <span className="text-sm text-indigo-500 font-medium">Generating Cover...</span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-slate-400">Waiting for generation...</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Interior Pages Grid */}
                <div>
                     <div className="flex justify-between items-center mb-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interior Pages</p>
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{generatedCount} / {totalPages} Ready</span>
                     </div>
                     
                     <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {/* Render generated pages */}
                        {assets?.interiorPages.map((page, i) => (
                            <div key={i} className="aspect-[3/4] rounded bg-white border border-slate-200 shadow-sm overflow-hidden relative animate-[fadeIn_0.5s_ease-out]">
                                <img src={page} className="w-full h-full object-cover" alt={`Page ${i+1}`} />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center truncate backdrop-blur-sm">
                                    Page {i + 1}
                                </div>
                            </div>
                        ))}

                        {/* Render placeholders for remaining pages */}
                        {Array.from({ length: Math.max(0, totalPages - generatedCount) }).map((_, i) => {
                             const isNext = i < 4; // Only animate the next few placeholders
                             return (
                                <div key={`placeholder-${i}`} className={`aspect-[3/4] rounded bg-slate-50 border border-slate-100 flex items-center justify-center ${isNext && status.currentStep > 2 ? 'animate-pulse' : 'opacity-50'}`}>
                                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                                </div>
                             );
                        })}
                     </div>
                </div>
            </div>
        </div>
    );
};
