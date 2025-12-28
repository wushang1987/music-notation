import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import abcjs from 'abcjs';
import 'abcjs/abcjs-audio.css';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ScoreView = () => {
    const { id } = useParams();
    const [score, setScore] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchScoreAndComments = async () => {
            try {
                const scoreRes = await api.get(`/scores/${id}`);
                setScore(scoreRes.data);
                const commentsRes = await api.get(`/comments/${id}`);
                setComments(commentsRes.data);
            } catch (err) {
                console.error('Failed to load score data', err);
            }
        };
        fetchScoreAndComments();
    }, [id]);

    const [activeTab, setActiveTab] = useState('notation');

    useEffect(() => {
        if (score && activeTab === 'notation') {
            const visualObj = abcjs.renderAbc('paper', score.content, {
                responsive: 'resize',
                add_classes: true
            })[0];

            if (abcjs.synth.supportsAudio()) {
                const synthControl = new abcjs.synth.SynthController();

                const cursorControl = {
                    onStart: () => {
                        console.log("onStart");
                        const els = document.querySelectorAll('.highlight');
                        els.forEach(el => el.classList.remove('highlight'));
                    },
                    onEvent: (ev) => {
                        const els = document.querySelectorAll('.highlight');
                        els.forEach(el => el.classList.remove('highlight'));

                        if (ev && ev.elements) {
                            ev.elements.forEach(item => {
                                if (Array.isArray(item) || item instanceof NodeList) {
                                    Array.from(item).forEach(subEl => {
                                        if (subEl && subEl.classList) {
                                            subEl.classList.add('highlight');
                                        }
                                    });
                                } else if (item && item.classList) {
                                    item.classList.add('highlight');
                                }
                            });
                        }
                    },
                    onFinished: () => {
                        console.log("onFinished");
                        const els = document.querySelectorAll('.highlight');
                        els.forEach(el => el.classList.remove('highlight'));
                    }
                };

                synthControl.load("#audio",
                    cursorControl,
                    {
                        displayLoop: true,
                        displayRestart: true,
                        displayPlay: true,
                        displayProgress: true,
                        displayWarp: true
                    }
                );

                const createSynth = new abcjs.synth.CreateSynth();
                createSynth.init({ visualObj: visualObj }).then(() => {
                    synthControl.setTune(visualObj, false);
                }).catch((error) => {
                    console.warn("Audio problem:", error);
                });
            } else {
                const audioEl = document.querySelector("#audio");
                if (audioEl) audioEl.innerHTML = "<div class='text-red-500'>Audio not supported by this browser.</div>";
            }
        }
    }, [score, activeTab]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const { data } = await api.post('/comments', { content: newComment, scoreId: id });
            setComments([data, ...comments]);
            setNewComment('');
        } catch (err) {
            alert('Failed to post comment');
        }
    };

    const handleLike = async () => {
        if (!user) {
            alert('Please login to like this score.');
            return;
        }

        try {
            const { data } = await api.put(`/scores/${id}/like`);
            setScore(prev => ({ ...prev, likes: data }));
        } catch (err) {
            console.error('Failed to toggle like', err);
            alert('Failed to update like status');
        }
    };

    const hasLiked = user && score?.likes?.some(uid => uid === user.id || uid === user._id);

    if (!score) return <div className="p-10 text-center font-bold">Loading Score...</div>;

    return (
        <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">{score.title}</h1>
                                <p className="text-gray-500 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    By <span className="font-medium text-gray-800 ml-1">{score.owner?.username || 'Music Notation'}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${hasLiked ? 'bg-red-50 border-red-200 text-red-500 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    title={hasLiked ? 'Unlike' : 'Like'}
                                >
                                    <span className="text-lg">{hasLiked ? '❤️' : '🤍'}</span>
                                    <span className="font-bold">{score.likes?.length || 0}</span>
                                </button>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex border-b border-gray-100 -mb-6 mt-4">
                            <button
                                onClick={() => setActiveTab('notation')}
                                className={`px-6 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'notation' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Musical Notation
                                {activeTab === 'notation' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
                            </button>
                            <button
                                onClick={() => setActiveTab('abc')}
                                className={`px-6 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'abc' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                ABC Source
                                {activeTab === 'abc' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'notation' ? (
                            <div className="animate-fadeIn">
                                <div id="audio" className="w-full mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100"></div>
                                <div id="paper" className="w-full overflow-x-auto min-h-[300px]"></div>
                            </div>
                        ) : (
                            <div className="animate-fadeIn">
                                <div className="relative">
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-50">ABC Notation</div>
                                    <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto font-mono text-sm leading-relaxed shadow-inner">
                                        {score.content}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                    <h3 className="text-xl font-bold mb-4">Comments</h3>
                    {user ? (
                        <form onSubmit={handleCommentSubmit} className="mb-6">
                            <textarea
                                className="w-full p-2 border rounded mb-2"
                                rows="3"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            ></textarea>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Post Comment</button>
                        </form>
                    ) : (
                        <p className="mb-4 text-gray-600">Please login to comment.</p>
                    )}

                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment._id} className="bg-white p-3 rounded shadow-sm">
                                <p className="font-bold text-sm mb-1">{comment.user.username} <span className="text-gray-400 font-normal text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span></p>
                                <p>{comment.content}</p>
                            </div>
                        ))}
                        {comments.length === 0 && <p className="text-gray-500 italic">No comments yet.</p>}
                    </div>
                </div>
            </div>

            <div className="w-full md:w-1/3">
                {/* Sidebar for additional info or actions could go here */}
                <div className="bg-white p-4 shadow rounded">
                    <h3 className="font-bold mb-2">Details</h3>
                    <p>Created: {new Date(score.createdAt).toLocaleDateString()}</p>
                    <p>Visibility: {score.isPublic ? 'Public' : 'Private'}</p>
                </div>
            </div>
        </div>
    );
};

export default ScoreView;
