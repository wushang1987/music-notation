import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import abcjs from 'abcjs';
import api from '../api';

const ScoreEditor = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('X: 1\nT: Title\nM: 4/4\nL: 1/4\nK: C\nC D E F | G A B c |');
    const [isPublic, setIsPublic] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        abcjs.renderAbc('paper', content);
    }, [content]);

    const handleSave = async () => {
        try {
            await api.post('/scores', { title, content, isPublic });
            navigate('/');
        } catch (err) {
            alert('Failed to save score');
        }
    };

    return (
        <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
                <h1 className="text-2xl font-bold mb-4">Create Score</h1>
                <div className="mb-4">
                    <label className="block mb-1">Title</label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">ABC Notation</label>
                    <textarea
                        className="w-full border p-2 rounded h-64 font-mono"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        <span className="ml-2">Public</span>
                    </label>
                </div>
                <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Score</button>
            </div>
            <div className="w-full md:w-1/2">
                <h2 className="text-xl font-bold mb-4">Preview</h2>
                <div id="paper" className="border p-4 bg-white min-h-[300px]"></div>
            </div>
        </div>
    );
};

export default ScoreEditor;
