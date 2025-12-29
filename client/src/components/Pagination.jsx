import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const { t } = useTranslation();
    const [jumpPage, setJumpPage] = useState('');

    useEffect(() => {
        setJumpPage('');
    }, [currentPage]);

    const handleJump = (e) => {
        e.preventDefault();
        const pageNum = parseInt(jumpPage);
        if (pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
        } else {
            alert(t('pagination.invalidPage', { total: totalPages }));
        }
    };

    const renderPageButtons = () => {
        const buttons = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) {
                buttons.push(renderButton(i));
            }
        } else {
            buttons.push(renderButton(1));

            if (currentPage > 3) {
                buttons.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (i === 1 || i === totalPages) continue;
                buttons.push(renderButton(i));
            }

            if (currentPage < totalPages - 2) {
                buttons.push(<span key="ellipsis2" className="px-2 text-gray-400">...</span>);
            }

            buttons.push(renderButton(totalPages));
        }
        return buttons;
    };

    const renderButton = (page) => (
        <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 ${currentPage === page
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                }`}
        >
            {page}
        </button>
    );

    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col items-center gap-6 py-10 border-t border-gray-100 mt-12">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="group flex items-center px-4 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                    <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    {t('pagination.previous')}
                </button>

                <div className="hidden sm:flex items-center gap-1">
                    {renderPageButtons()}
                </div>

                <div className="sm:hidden px-4 text-sm font-bold text-gray-900 bg-gray-50 py-2 rounded-lg border border-gray-200">
                    {t('pagination.pageOf', { current: currentPage, total: totalPages })}
                </div>

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="group flex items-center px-4 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                    {t('pagination.next')}
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            <form onSubmit={handleJump} className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-200">
                <span className="text-sm font-medium text-gray-600 ml-2">{t('pagination.jumpTo')}</span>
                <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={jumpPage}
                    onChange={(e) => setJumpPage(e.target.value)}
                    placeholder={currentPage}
                    className="w-16 px-3 py-1.5 border border-gray-300 rounded-xl text-center text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
                <button
                    type="submit"
                    className="px-4 py-1.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all active:scale-95 shadow-md"
                >
                    {t('pagination.go')}
                </button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <span className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-wider">{t('pagination.total', { count: totalPages })}</span>
            </form>
        </div>
    );
};

export default Pagination;
