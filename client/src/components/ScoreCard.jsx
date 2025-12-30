import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import abcjs from 'abcjs';
import { useTranslation } from 'react-i18next';

const ScoreCard = ({ score, user, onDelete }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const paperRef = useRef(null);

    useEffect(() => {
        if (paperRef.current && score.content) {
            try {
                abcjs.renderAbc(paperRef.current, score.content, {
                    responsive: 'resize',
                    scale: 1,
                    paddingtop: 10,
                    paddingbottom: 10,
                    paddingright: 10,
                    paddingleft: 10,
                    staffwidth: 400,
                    add_classes: true
                });
            } catch (err) {
                console.error('Failed to render notation preview', err);
            }
        }
    }, [score.content]);

    const isOwnerOrAdmin = user && (
        user.role === 'admin' || (score.owner && (
            (typeof score.owner === 'object' && (score.owner._id === user.id || score.owner._id === user._id)) ||
            (typeof score.owner === 'string' && (score.owner === user.id || score.owner === user._id))
        ))
    );

    const isAdmin = user && user.role === 'admin';

    const handleCardClick = () => {
        navigate(`/score/${score._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group  transition-all duration-300 flex flex-col overflow-hidden cursor-pointer active:scale-[0.98]"
        >
            {/* Music Notation Paper - Prominent Display */}
            <div className="relative bg-gradient-to-b from-gray-100 to-gray-50">
                <div className="bg-white rounded-sm shadow-lg border border-gray-300 h-60 overflow-hidden p-2">
                    <div
                        ref={paperRef}
                        className="w-full min-h-[280px] p-4 pointer-events-none"
                    ></div>
                </div>
            </div>

            {/* Content Below the Paper */}
            <div className="p-4 flex flex-col flex-1">
                <h2 className="text-sm  mb-2 text-gray-900 truncate group-hover:text-blue-600 transition-colors" title={score.title}>
                    {score.title}
                </h2>

                <p className="text-gray-500 mb-4 text-sm flex items-center gap-1.5 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{score.owner?.username || 'Anonymous'}</span>
                </p>

                <div className="flex items-center justify-end gap-2 mt-auto">
                    {isOwnerOrAdmin && (
                        <Link
                            to={`/edit/${score._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100 active:scale-95"
                            title={t('common.edit')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </Link>
                    )}

                    {isAdmin && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(score._id);
                            }}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100 active:scale-95"
                            title={t('common.delete')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScoreCard;
