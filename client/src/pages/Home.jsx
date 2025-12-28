import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Home = () => {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const { data } = await api.get('/scores');
                setScores(data);
            } catch (err) {
                console.error('Failed to fetch scores', err);
            }
        };
        fetchScores();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Music Scores</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scores.map((score) => (
                    <div key={score._id} className="border p-4 rounded shadow hover:shadow-lg transition">
                        <h2 className="text-xl font-bold mb-2">{score.title}</h2>
                        <p className="text-gray-600 mb-2">By: {score.owner?.username || 'Music Notation'}</p>
                        <Link to={`/score/${score._id}`} className="text-blue-500 hover:underline">View Score</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
