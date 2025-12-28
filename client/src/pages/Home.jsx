import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Home = ({ title = "Music Scores", endpoint = "/scores" }) => {
    const { user } = useContext(AuthContext);
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this score?')) return;
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
                const { data } = await api.get(endpoint);
                setScores(data);
            } catch (err) {
                console.error('Failed to fetch scores', err);
            } finally {
                setLoading(false);
            }
        };
        fetchScores();
    }, [endpoint]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">{title}</h1>
            {scores.length === 0 ? (
                <p className="text-gray-500">No scores found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {scores.map((score) => (
                        <div key={score._id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition duration-200">
                            <h2 className="text-xl font-bold mb-2 text-gray-900 truncate">{score.title}</h2>
                            <p className="text-gray-600 mb-4 text-sm">By: <span className="font-semibold">{score.owner?.username || 'Music Notation'}</span></p>
                            <div className="flex items-center gap-2 mt-auto">
                                <Link
                                    to={`/score/${score._id}`}
                                    className="flex-1 flex items-center justify-center bg-blue-50 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                    title="View Score"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    <span className="ml-2 text-sm">View</span>
                                </Link>
                                {user && user.role === 'admin' && (
                                    <button
                                        onClick={() => handleDelete(score._id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        title="Delete Score"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
