import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm isolate">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full max-w-none">
        <Link
          to="/"
          className="text-2xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic shrink-0"
        >
          Score Canvas
        </Link>
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-end min-w-0">
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
          {user ? (
            <div className="flex gap-2 sm:gap-4 items-center flex-wrap min-w-0 justify-end">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full max-w-[10rem] truncate">
                {t("nav.greeting", { name: user.username })}
              </span>
              <Link
                to="/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 whitespace-nowrap"
              >
                {t("nav.newScore")}
              </Link>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-red-500 transition-colors"
                title={t("common.logout")}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <Link
                to="/auth"
                className="text-gray-600 hover:text-blue-600 font-medium text-sm"
              >
                {t("common.login")}
              </Link>
              {/* <Link to="/auth" className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-black transition-all shadow-lg">
                                {t('common.join')}
                            </Link> */}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
