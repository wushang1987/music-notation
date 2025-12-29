import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import abcjs from 'abcjs';
import { useTranslation } from 'react-i18next';

const ScoreCard = ({ score, user, onDelete }) => {
    const { t } = useTranslation();
    const paperRef = useRef(null);

    useEffect(() => {
        if (paperRef.current && score.content) {
            try {
                abcjs.renderAbc(paperRef.current, score.content, {
                    responsive: 'resize',
                    scale: 0.8,
                    paddingtop: 0,
                    paddingbottom: 0,
                    paddingright: 0,
                    paddingleft: 0,
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

    return (
        <div className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden">
            {/* Music Notation Preview Area */}
            <div className="h-40 bg-gray-50 border-b border-gray-100 relative overflow-hidden flex items-center justify-center p-2">
                <div
                    ref={paperRef}
                    className="w-full h-full opacity-80 pointer-events-none"
                    style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent)' }}
                ></div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <h2 className="text-lg font-bold mb-1 text-gray-900 truncate group-hover:text-blue-600 transition-colors" title={score.title}>
                    {score.title}
                </h2>

                <p className="text-gray-500 mb-4 text-xs flex items-center gap-1.5 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{score.owner?.username || 'Anonymous'}</span>
                </p>

                <div className="flex items-center gap-2 mt-auto">
                    <Link
                        to={`/score/${score._id}`}
                        className="flex-1 flex items-center justify-center bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95 text-sm"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('common.view')}
                    </Link>

                    {isOwnerOrAdmin && (
                        <Link
                            to={`/edit/${score._id}`}
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
                            onClick={() => onDelete(score._id)}
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
