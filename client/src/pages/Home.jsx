import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Home = ({ title = "Music Scores", endpoint = "/scores" }) => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scores.map((score) => (
                        <div key={score._id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition duration-200">
                            <h2 className="text-xl font-bold mb-2 text-gray-900 truncate">{score.title}</h2>
                            <p className="text-gray-600 mb-4 text-sm">By: <span className="font-semibold">{score.owner?.username || 'Unknown'}</span></p>
                            <Link to={`/score/${score._id}`} className="block w-full text-center bg-blue-50 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-100 transition-colors">
                                View Score
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
