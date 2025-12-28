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

    useEffect(() => {
        if (score) {
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
                        // console.log("onEvent", ev);
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
                document.querySelector("#audio").innerHTML = "<div class='text-red-500'>Audio not supported by this browser.</div>";
            }
        }
    }, [score]);

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

    if (!score) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3">
                <div className="border p-4 bg-white shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold">{score.title}</h1>
                        <p className="text-gray-600">By {score.owner?.username || 'Music Notation'}</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1 px-3 py-1 rounded border ${hasLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }`}
                                title={hasLiked ? 'Unlike' : 'Like'}
                            >
                                <span className="text-xl">{hasLiked ? '❤️' : '🤍'}</span>
                                <span className="font-semibold">{score.likes?.length || 0}</span>
                            </button>
                        </div>
                    </div>
                    <div id="audio" className="w-full mb-4"></div>
                    <div id="paper" className="w-full overflow-x-auto"></div>
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
