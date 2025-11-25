
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { jsPDF } from 'jspdf';
import saveAs from 'file-saver';
import JSZip from 'jszip';

import type { ColoringBookConfig, GeneratedAssets, EtsyListing, AppState, GenerationStatus } from './types';
import { INITIAL_CONFIG, THEMES, PAGE_COUNTS, ART_STYLES, BORDER_STYLES, BACKGROUND_STYLES } from './constants';
import { ConfigWizard } from './components/ConfigWizard';
import { GenerationView } from './components/GenerationView';
import { ResultsView } from './components/ResultsView';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Helper function to convert image URL to base64
const toBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Robust retry mechanism for API calls with exponential backoff
async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 5, baseDelay = 2000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await operation();
            if (result === undefined || result === null) {
                throw new Error("Operation returned empty result");
            }
            return result;
        } catch (error: any) {
            lastError = error;
            
            // Check for rate limit (429) or server overload (503)
            const isRateLimit = error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
            const isServerBusy = error?.status === 503 || error?.code === 503;
            
            // Don't retry client errors (except 429)
            if (error?.status >= 400 && error?.status < 500 && !isRateLimit) {
                console.error("Client error, not retrying:", error);
                throw error;
            }

            if (i < maxRetries - 1) {
                // Exponential backoff with jitter: base * 1.5^i + jitter
                const backoff = baseDelay * Math.pow(1.5, i);
                const jitter = Math.random() * 1000;
                const waitTime = backoff + jitter;
                
                console.warn(`Attempt ${i + 1} failed (${isRateLimit ? 'Rate Limit' : 'Error'}). Retrying in ${Math.round(waitTime)}ms...`, error.message);
                await delay(waitTime);
                continue;
            }
        }
    }
    console.error("Max retries exceeded", lastError);
    throw lastError;
}

export default function App() {
    const [appState, setAppState] = useState<AppState>('config');
    const [config, setConfig] = useState<ColoringBookConfig>(INITIAL_CONFIG);
    const [assets, setAssets] = useState<GeneratedAssets | null>(null);
    const [etsyData, setEtsyData] = useState<EtsyListing | null>(null);
    const [status, setStatus] = useState<GenerationStatus>({ 
        message: '', 
        progress: 0,
        currentStep: 0,
        totalSteps: 0,
        logs: []
    });
    const [error, setError] = useState<string | null>(null);

    const updateConfig = (newConfig: Partial<ColoringBookConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    };
    
    const addLog = (message: string) => {
        setStatus(prev => ({
            ...prev,
            logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] ${message}`]
        }));
    };

    const generateBook = useCallback(async () => {
        setAppState('generating');
        setError(null);
        // Reset assets for new generation
        setAssets({ cover: '', interiorPages: [] });
        
        const totalPages = parseInt(config.pageCount, 10);
        // Steps: 1 (Plan) + 1 (Cover) + totalPages (Images) + 1 (Finalize)
        const totalSteps = 3 + totalPages; 
        
        setStatus({ 
            message: 'Initializing AI...', 
            progress: 0,
            currentStep: 0,
            totalSteps,
            logs: ['Starting generation process...']
        });

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // --- STEP 1: Planning with Thinking Mode ---
            setStatus(prev => ({ 
                ...prev, 
                message: 'Thinking about content and marketing strategies...', 
                currentStep: 1,
                progress: (1 / totalSteps) * 100 
            }));
            addLog('Using Gemini 3 Pro with Thinking Mode for advanced planning...');
            
            // Using Gemini 3 Pro with Thinking for deep reasoning on the best subjects and SEO
            const [contentPlanResponse, etsyDataResponse] = await Promise.all([
                retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
                    model: 'gemini-3-pro-preview', // UPGRADE: Thinking Model
                    contents: `Plan a commercial children's coloring book with the theme "${config.theme}". List ${config.pageCount} unique, engaging, and varied subjects for the pages.`,
                    config: {
                        responseMimeType: 'application/json',
                        thinkingConfig: { thinkingBudget: 32768 }, // FEATURE: Thinking Budget
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                subjects: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        }
                    }
                })),
                retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
                    model: 'gemini-3-pro-preview', // UPGRADE: Thinking Model
                    contents: `Generate a complete Etsy listing package for a digital download coloring book. Theme: "${config.theme}". Page Count: ${config.pageCount}. Style: "${config.artStyle}". The package should include: a 140-character SEO-optimized title, a detailed product description, 13 comma-separated SEO tags, a materials field string, and 3 short marketing blurbs.`,
                    config: {
                        responseMimeType: 'application/json',
                        thinkingConfig: { thinkingBudget: 32768 }, // FEATURE: Thinking Budget
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                                materials: { type: Type.STRING },
                                marketingBlurbs: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        }
                    }
                }))
            ]);
            
            const pageSubjects = JSON.parse(contentPlanResponse.text || '{}').subjects || [];
            const parsedEtsyData = JSON.parse(etsyDataResponse.text || '{}');
            setEtsyData(parsedEtsyData);
            addLog('✓ Deep thinking complete. Strategy and content plan generated.');

            // --- STEP 2: Cover Art with Nano Banana Pro ---
            setStatus(prev => ({ 
                ...prev, 
                message: 'Designing high-resolution cover art...', 
                currentStep: 2,
                progress: (2 / totalSteps) * 100 
            }));
            addLog(`Generating ${config.coverResolution} cover using Gemini 3 Pro Image (Nano Banana Pro)...`);

            const coverPrompt = `A vibrant, professional, full-color illustration for the cover of a children's coloring book with the theme "${config.theme}". The style is a mix of "${config.artStyle}" and whimsical storybook. The composition should leave ample empty space at the top for a large title. The artwork must be eye-catching, joyful, and commercially usable. Do not include any text.`;
            
            // UPGRADE: Using gemini-3-pro-image-preview for requested "Nano Banana Pro" features
            const coverResponse = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: coverPrompt }] },
                config: {
                    imageConfig: {
                        imageSize: config.coverResolution, // FEATURE: Resolution control
                        aspectRatio: config.aspectRatio // FEATURE: Aspect Ratio control
                    }
                }
            }), 3, 5000);

            let coverImage = '';
            for (const part of coverResponse.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData && part.inlineData.data) {
                    coverImage = `data:image/png;base64,${part.inlineData.data}`;
                    break;
                }
            }

            if (coverImage) {
                setAssets(prev => ({ ...prev, cover: coverImage, interiorPages: [] } as GeneratedAssets));
                addLog('✓ High-fidelity cover art generated.');
            } else {
                 throw new Error("Failed to generate cover image.");
            }

            // --- STEP 3: Interior Pages (Optimized Batched & Rate Limited) ---
            
            let currentPages: string[] = []; 
            // Reduced batch size to 2 to minimize 429s while maintaining some speed
            const batchSize = 2; 
            
            for (let i = 0; i < totalPages; i += batchSize) {
                const batch = pageSubjects.slice(i, i + batchSize);
                addLog(`Processing batch ${(i/batchSize) + 1} of ${Math.ceil(totalPages/batchSize)} (${batch.length} pages)...`);
                
                // Increased delay between batches to respect RPM limits
                if (i > 0) await delay(3000);

                const promises = batch.map(async (subject: string, batchIndex: number) => {
                    const globalIndex = i + batchIndex;
                    
                    const backgroundInstruction = config.backgroundStyle === 'None' 
                        ? 'The background must be completely white.' 
                        : `The background should contain a simple, non-intrusive ${config.backgroundStyle} pattern.`;
                    
                    const pagePrompt = `A single coloring page for a child. Subject: ${subject}. Style: ${config.artStyle}. It must be black and white line art ONLY. Lines must be clean, crisp, and ${config.lineThickness}. NO shading, NO grayscale, NO color. ${backgroundInstruction} Professional quality for a printable coloring book.`;
                    
                    try {
                        const pageResponse = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
                            model: 'gemini-2.5-flash-image', 
                            contents: { parts: [{ text: pagePrompt }] },
                            config: { 
                                imageConfig: { 
                                    aspectRatio: config.aspectRatio // FEATURE: Aspect Ratio
                                } 
                            } 
                        }), 4, 3000); // 4 Retries with 3s base delay

                        let imageUrl = '';
                        // Safer access to response parts
                        const parts = pageResponse?.candidates?.[0]?.content?.parts;
                        
                        if (parts && Array.isArray(parts)) {
                            for (const part of parts) {
                                if (part.inlineData && part.inlineData.data) {
                                    imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                                    break;
                                }
                            }
                        }

                        if (imageUrl) {
                            return { index: globalIndex, url: imageUrl, subject };
                        }
                        
                        // If no image found in response parts
                        console.warn(`No image data found for page ${globalIndex}`, pageResponse);
                        return null;

                    } catch (err) {
                        console.error(`Failed to generate page ${globalIndex}`, err);
                        addLog(`⚠ Warning: Skipped page "${subject}" due to generation error.`);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                
                results.forEach(res => {
                    if (res) {
                        currentPages = [...currentPages, res.url];
                        addLog(`✓ Created page: ${res.subject}`);
                    }
                });

                // Update assets incrementally
                setAssets(prev => ({ ...prev, interiorPages: [...currentPages] } as GeneratedAssets));

                // Update progress
                const completedCount = Math.min(i + batchSize, totalPages);
                const currentStepVal = 2 + completedCount; 
                
                setStatus(prev => ({ 
                    ...prev, 
                    message: `Generated ${currentPages.length} of ${totalPages} pages...`, 
                    currentStep: currentStepVal,
                    progress: (currentStepVal / totalSteps) * 100 
                }));
            }

            // --- Finalize ---
            setStatus(prev => ({ 
                ...prev, 
                message: 'Finalizing your coloring book...', 
                currentStep: totalSteps,
                progress: 100 
            }));
            addLog('✓ All pages generated. Compiling results...');
            await delay(1000); 
            
            setAppState('results');

        } catch (e: any) {
            console.error(e);
            let msg = 'An error occurred during generation. Please check your network and try again.';
            if (e.message?.includes('API key')) msg = 'Invalid API Key. Please check your configuration.';
            if (e.message?.includes('429') || e.message?.includes('quota') || e.status === 429) {
                msg = 'Usage limit exceeded. Please wait a moment and try again, or reduce the page count.';
            }
            
            setError(msg);
            setAppState('config');
        }
    }, [config]);
    
    // FEATURE: TTS Functionality
    const playAudio = async (text: string) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const audioBytes = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
                const audioBuffer = await audioCtx.decodeAudioData(audioBytes.buffer);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.start(0);
            }
        } catch (e) {
            console.error("Failed to play audio", e);
            alert("Could not generate audio at this time.");
        }
    };

    const generatePdfBlob = async (): Promise<Blob> => {
        if (!assets) throw new Error("Assets not available for PDF generation.");

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: [8.5, 11]
        });
        
        const pageWidth = 8.5;
        const pageHeight = 11;

        // Cover Page
        const coverCanvas = document.createElement('canvas');
        // Increase canvas size for higher resolution covers
        const canvasScale = config.coverResolution === '4K' ? 4 : (config.coverResolution === '2K' ? 2 : 1);
        const baseW = 2550;
        const baseH = 3300;
        coverCanvas.width = baseW * canvasScale;
        coverCanvas.height = baseH * canvasScale;
        
        const ctx = coverCanvas.getContext('2d');
        if (!ctx) throw new Error("Failed to get canvas context");
        ctx.scale(canvasScale, canvasScale);

        const coverImg = new Image();
        coverImg.src = assets.cover;
        await new Promise(resolve => { coverImg.onload = resolve; });
        
        // Draw cover image filling the canvas
        // We might need to handle aspect ratio cropping here if the user chose a non-standard ratio
        // For simplicity in this version, we stretch or fill. Let's fill.
        ctx.drawImage(coverImg, 0, 0, baseW, baseH);
        
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        
        // Add text overlays
        ctx.font = '250px "Fredoka One"';
        ctx.shadowColor="rgba(0,0,0,0.5)";
        ctx.shadowBlur=20;
        ctx.fillText(config.title || config.theme, baseW / 2, 600);
        ctx.shadowBlur=0;

        if (config.subtitle) {
            ctx.font = '100px "Poppins"';
            ctx.fillText(config.subtitle, baseW / 2, 850);
        }
        if (config.author) {
            ctx.font = '80px "Poppins"';
            ctx.fillText(`By ${config.author}`, baseW / 2, 3000);
        }

        pdf.addImage(coverCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, pageHeight);

        // Interior pages
        // Calculate image dimensions based on aspect ratio to fit within margins
        // Margins: 0.25in all around. Printable area: 8 x 10.5
        const maxWidth = 8;
        const maxHeight = 10.5;
        
        for (let i = 0; i < assets.interiorPages.length; i++) {
            pdf.addPage();
            
            const imgData = assets.interiorPages[i];
            const img = new Image();
            img.src = imgData;
            await new Promise(resolve => { img.onload = resolve; });
            
            const imgAspect = img.width / img.height;
            let drawWidth = maxWidth;
            let drawHeight = maxWidth / imgAspect;

            if (drawHeight > maxHeight) {
                drawHeight = maxHeight;
                drawWidth = maxHeight * imgAspect;
            }

            const x = (pageWidth - drawWidth) / 2;
            const y = (pageHeight - drawHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, drawWidth, drawHeight);
            
            if (config.addPageNumbers) {
              pdf.setFontSize(10);
              pdf.text(`${i + 1}`, pageWidth / 2, 10.85);
            }
        }

        return pdf.output('blob') as Blob;
    };

    const downloadPdf = async () => {
        if (!assets) return;
        try {
            const pdfBlob = await generatePdfBlob();
            saveAs(pdfBlob, `${config.title || config.theme}_ColoringBook.pdf`);
        } catch (e) {
            console.error(e);
            setError('Failed to create the PDF file.');
        }
    };

    const downloadZip = async () => {
        if (!assets) return;
        try {
            const zip = new JSZip();
            
            // Add PDF to zip
            const pdfBlob = await generatePdfBlob();
            zip.file(`${config.title || config.theme}_ColoringBook.pdf`, pdfBlob);

            // Add cover image to zip
            const coverBase64 = await toBase64(assets.cover);
            zip.file('cover.png', coverBase64.split(',')[1], { base64: true });
            
            // Add all interior pages to zip
            const pagePromises = assets.interiorPages.map(async (pageUrl, i) => {
                const pageBase64 = await toBase64(pageUrl);
                zip.file(`page_${String(i+1).padStart(2,'0')}.png`, pageBase64.split(',')[1], { base64: true });
            });
            await Promise.all(pagePromises);

            zip.generateAsync({ type: 'blob' }).then(content => {
                saveAs(content, `${config.title || config.theme}_Assets.zip`);
            });
        } catch(e) {
            console.error(e);
            setError('Failed to create the ZIP file.');
        }
    };

    const handleRestart = () => {
        setAppState('config');
        setAssets(null);
        setEtsyData(null);
    };

    const renderContent = () => {
        switch (appState) {
            case 'generating':
                return <GenerationView status={status} assets={assets} config={config} />;
            case 'results':
                return <ResultsView
                    assets={assets}
                    etsyData={etsyData}
                    config={config}
                    onDownloadPdf={downloadPdf}
                    onDownloadZip={downloadZip}
                    onRestart={handleRestart}
                    onRegenerate={() => generateBook()}
                    onPlayAudio={playAudio} // PASS TTS HANDLER
                 />;
            case 'config':
            default:
                return <ConfigWizard
                    config={config}
                    updateConfig={updateConfig}
                    onGenerate={generateBook}
                    error={error}
                    themes={THEMES}
                    pageCounts={PAGE_COUNTS}
                    artStyles={ART_STYLES}
                    borderStyles={BORDER_STYLES}
                    backgroundStyles={BACKGROUND_STYLES}
                />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                {renderContent()}
            </main>
            <Footer />
        </div>
    );
}
