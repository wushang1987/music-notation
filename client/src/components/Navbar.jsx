import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20 h-16 flex items-center shadow-sm">
            <div className="container mx-auto px-6 flex justify-between items-center w-full max-w-none">
                <Link to="/" className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                    MusicNotation
                </Link>
                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex gap-4 items-center">
                            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                👋 {user.username}
                            </span>
                            <Link to="/create" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                                + New Score
                            </Link>
                            <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4 items-center">
                            <Link to="/auth" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Login</Link>
                            <Link to="/auth" className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg">
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
