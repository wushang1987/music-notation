import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? "bg-gray-200 text-blue-600" : "text-gray-700 hover:bg-gray-100";
    };

    return (
        <div className="w-64 bg-white shadow-md min-h-screen flex flex-col hidden md:flex">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800">Menu</h2>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                <Link to="/" className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive('/')}`}>
                    <span className="font-medium">Home</span>
                </Link>
                <Link to="/create" className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive('/create')}`}>
                    <span className="font-medium">Create New</span>
                </Link>
                <Link to="/created" className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive('/created')}`}>
                    <span className="font-medium">My Created</span>
                </Link>
                <Link to="/liked" className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive('/liked')}`}>
                    <span className="font-medium">My Likes</span>
                </Link>
            </nav>
        </div>
    );
};

export default Sidebar;
