import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

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
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full max-w-40 truncate inline-flex items-center gap-1 hover:bg-gray-200 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  {t("nav.greeting", { name: user.username })}
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {userMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {t("common.logout")}
                    </button>
                  </div>
                ) : null}
              </div>
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
