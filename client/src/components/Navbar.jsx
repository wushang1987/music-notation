import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">Music Notation</Link>
            <div>
                {user ? (
                    <div className="flex gap-4 items-center">
                        <span>Hello, {user.username}</span>
                        <Link to="/create" className="bg-green-500 px-3 py-1 rounded hover:bg-green-600">New Score</Link>
                        <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Link to="/login" className="hover:text-gray-300">Login</Link>
                        <Link to="/register" className="hover:text-gray-300">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
