import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import './HeroSection.css';

const HeroSection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        navigate('/create/abcjs', { state: { prompt } });
    };

    return (
        <div className="hero-container relative overflow-hidden text-white min-h-[90vh] flex flex-col justify-center">
            {/* Animated gradient background */}
            <div className="hero-gradient absolute inset-0"></div>

            {/* Floating orbs with animation */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
                <div className="orb orb-4"></div>
                <div className="orb orb-5"></div>
            </div>

            {/* Animated music notes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="music-note note-1">♪</div>
                <div className="music-note note-2">♫</div>
                <div className="music-note note-3">♪</div>
                <div className="music-note note-4">♬</div>
                <div className="music-note note-5">♫</div>
            </div>

            {/* Wave animation at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
                <svg className="wave wave-1" viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path d="M0,60 C360,120 720,0 1440,60 L1440,120 L0,120 Z" fill="rgba(255,255,255,0.1)"></path>
                </svg>
                <svg className="wave wave-2" viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path d="M0,80 C480,20 960,100 1440,40 L1440,120 L0,120 Z" fill="rgba(255,255,255,0.05)"></path>
                </svg>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 z-10">
                <div className="text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-slideUp">
                        <span className="block">{t('hero.title')}</span>
                        <span className="block hero-gradient-text">
                            {t('hero.titleHighlight')}
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-10 animate-slideUp animation-delay-200">
                        {t('hero.subtitle')}
                    </p>

                    {/* AI Generation Box */}
                    <div className="max-w-3xl mx-auto mb-16 animate-slideUp animation-delay-300">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                                    AI Music Composer
                                </span>
                                <span className="text-sm bg-blue-600/50 px-2 py-0.5 rounded-full text-blue-100 font-medium">BETA</span>
                            </h2>

                            {/* Steps Explanation */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm text-gray-300 text-left">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-500/20 rounded-full p-1.5 shrink-0">
                                        <div className="w-5 h-5 flex items-center justify-center font-bold text-blue-300">1</div>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Describe</p>
                                        <p>Type your musical idea in the box below.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-purple-500/20 rounded-full p-1.5 shrink-0">
                                        <div className="w-5 h-5 flex items-center justify-center font-bold text-purple-300">2</div>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Generate</p>
                                        <p>AI creates the ABC notation instantly.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-pink-500/20 rounded-full p-1.5 shrink-0">
                                        <div className="w-5 h-5 flex items-center justify-center font-bold text-pink-300">3</div>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Play & Edit</p>
                                        <p>Listen, refine, and save your masterpiece.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur"></div>
                                <div className="relative bg-black/20 backdrop-blur-xl rounded-xl p-1 flex items-stretch border border-white/10">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe the music you want to create (e.g. 'A melancholic violin melody in D minor')..."
                                        className="w-full bg-transparent text-white placeholder-gray-400 border-none focus:ring-0 resize-none py-3 px-4 min-h-[60px]"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleGenerate();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !prompt.trim()}
                                        className="ml-2 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg px-6 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 my-1 shadow-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        <span>Generate</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp animation-delay-400">
                        <Link
                            to="/create"
                            className="cta-button-primary inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl"
                        >
                            {t('hero.getStarted')}
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <button
                            onClick={() => document.getElementById('trending-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="cta-button-secondary inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl"
                        >
                            {t('hero.exploreTrending')}
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                    <div className="feature-card animate-slideUp animation-delay-600">
                        <div className="feature-icon feature-icon-1">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('hero.feature1Title')}</h3>
                        <p className="text-gray-300">{t('hero.feature1Desc')}</p>
                    </div>
                    <div className="feature-card animate-slideUp animation-delay-800">
                        <div className="feature-icon feature-icon-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('hero.feature2Title')}</h3>
                        <p className="text-gray-300">{t('hero.feature2Desc')}</p>
                    </div>
                    <div className="feature-card animate-slideUp animation-delay-1000">
                        <div className="feature-icon feature-icon-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('hero.feature3Title')}</h3>
                        <p className="text-gray-300">{t('hero.feature3Desc')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
