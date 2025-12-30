import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HeroSection.css';

const HeroSection = () => {
    const { t } = useTranslation();

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
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp animation-delay-400">
                        <Link
                            to="/auth"
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
