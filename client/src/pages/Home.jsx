import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import Pagination from '../components/Pagination';
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

    return (
        <div className="p-6 max-w-7xl mx-auto">
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
                            <div key={score._id} className="group bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                <h2 className="text-xl font-bold mb-2 text-gray-900 truncate group-hover:text-blue-600 transition-colors" title={score.title}>{score.title}</h2>
                                <p className="text-gray-500 mb-6 text-sm flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <span>{score.owner?.username || 'Anonymous'}</span>
                                </p>
                                <div className="flex items-center gap-2 mt-auto">
                                    <Link
                                        to={`/score/${score._id}`}
                                        className="flex-1 flex items-center justify-center bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {t('common.view')}
                                    </Link>
                                    {user && (user.role === 'admin' || (score.owner && (
                                        (typeof score.owner === 'object' && (score.owner._id === user.id || score.owner._id === user._id)) ||
                                        (typeof score.owner === 'string' && (score.owner === user.id || score.owner === user._id))
                                    ))) && (
                                            <Link
                                                to={`/edit/${score._id}`}
                                                className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors border border-amber-100 active:scale-95"
                                                title={t('common.edit')}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </Link>
                                        )}
                                    {user && user.role === 'admin' && (
                                        <button
                                            onClick={() => handleDelete(score._id)}
                                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100 active:scale-95"
                                            title={t('common.delete')}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
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
    );
};

export default Home;
