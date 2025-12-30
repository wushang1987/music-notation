import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import ScoreCard from '../components/ScoreCard';
import { useTranslation } from 'react-i18next';

const Home = ({ title, endpoint = "/scores" }) => {
    const { user } = useContext(AuthContext);
    const { t } = useTranslation();
    const displayTitle = title ? t(title) : t('home.title');
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const handleDelete = async (id) => {
        if (!window.confirm(t('score.deleteConfirm'))) return;
        try {
            await api.delete(`/scores/${id}`);
            setScores(scores.filter(s => s._id !== id));
        } catch (err) {
            console.error('Failed to delete score', err);
            alert('Error deleting score');
        }
    };

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            try {
                // Add query parameters for search and pagination
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                params.append('page', page);
                params.append('limit', 12);

                const { data } = await api.get(`${endpoint}?${params.toString()}`);

                // Handle both old array response and new paginated object response
                if (Array.isArray(data)) {
                    setScores(data);
                    setTotalPages(1);
                    setTotal(data.length);
                } else {
                    setScores(data.scores);
                    setTotalPages(data.totalPages);
                    setTotal(data.total);
                    setPage(data.page);
                }
            } catch (err) {
                console.error('Failed to fetch scores', err);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchScores();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [endpoint, search, page]);

    // Reset page when search changes
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    if (loading && page === 1 && !search) return <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>;

    // Hero section for non-logged-in users
    const HeroSection = () => (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-40 left-1/2 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        <span className="block">{t('hero.title')}</span>
                        <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                            {t('hero.titleHighlight')}
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-10">
                        {t('hero.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/auth"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 transform hover:-translate-y-1"
                        >
                            {t('hero.getStarted')}
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <button
                            onClick={() => document.getElementById('trending-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
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
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('hero.feature1Title')}</h3>
                        <p className="text-gray-300">{t('hero.feature1Desc')}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('hero.feature2Title')}</h3>
                        <p className="text-gray-300">{t('hero.feature2Desc')}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
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

    return (
        <div className={user ? "" : "bg-gray-50"}>
            {/* Hero section for non-logged-in users */}
            {!user && <HeroSection />}

            <div id="trending-section" className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{displayTitle}</h1>

                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            value={search}
                            onChange={handleSearchChange}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
                        />
                    </div>
                </div>

                {loading && scores.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : scores.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('common.noScores')}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('common.noScoresDesc')}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {scores.map((score) => (
                                <ScoreCard
                                    key={score._id}
                                    score={score}
                                    user={user}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;

