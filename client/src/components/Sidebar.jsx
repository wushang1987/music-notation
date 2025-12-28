import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path
            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
            : "text-gray-600 hover:bg-gray-100 hover:text-blue-600";
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 sticky top-0 h-[calc(100vh-64px)] overflow-y-auto z-10 hidden md:block">
            <div className="p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Navigation</p>
                <nav className="space-y-1">
                    <Link to="/" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isActive('/')}`}>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Home
                    </Link>
                    <Link to="/create" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isActive('/create')}`}>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Create New
                    </Link>
                    <Link to="/created" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isActive('/created')}`}>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        My Created
                    </Link>
                    <Link to="/liked" className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isActive('/liked')}`}>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        My Likes
                    </Link>
                </nav>
            </div>

            <div className="absolute bottom-0 w-full p-6 border-t border-gray-100 bg-gray-50/50">
                <div className="bg-blue-600 rounded-2xl p-4 text-white">
                    <p className="text-sm font-bold mb-1">Sheet Music</p>
                    <p className="text-xs opacity-80">Explore and share amazing music scores today.</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
