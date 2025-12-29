import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const { t } = useTranslation();

    const isActive = (path) => {
        return location.pathname === path
            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
            : "text-gray-600 hover:bg-gray-100 hover:text-blue-600";
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto z-10 hidden md:block flex-shrink-0">
            <div className="p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{t('sidebar.navigation')}</p>
                <nav className="space-y-1">
                    <Link to="/" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${isActive('/')}`}>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        {t('common.home')}
                    </Link>
                    <Link to="/create" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${isActive('/create')}`}>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        {t('common.create')}
                    </Link>
                    <Link to="/created" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${isActive('/created')}`}>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        {t('common.created')}
                    </Link>
                    <Link to="/liked" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${isActive('/liked')}`}>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        {t('common.likes')}
                    </Link>
                    {user && user.role === 'admin' && (
                        <Link to="/admin" className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${isActive('/admin')}`}>
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {t('common.admin')}
                        </Link>
                    )}
                </nav>
            </div>


        </aside>
    );
};

export default Sidebar;
