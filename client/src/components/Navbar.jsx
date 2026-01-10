import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

import BrandLogo from "./BrandLogo";
import puhuiLogo from "../assets/puhui.svg";

const Navbar = ({ onOpenSidebar, useHamburgerNav = false }) => {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const resolvedLanguage = i18n.resolvedLanguage || i18n.language;
  const languageValue = resolvedLanguage?.startsWith("zh") ? "zh" : "en";

  const renderLanguageSelect = (className) => (
    <select
      onChange={(e) => changeLanguage(e.target.value)}
      value={languageValue}
      className={className}
    >
      <option value="en">English</option>
      <option value="zh">中文</option>
    </select>
  );

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
      <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-row justify-between items-center gap-3 w-full max-w-none">
        <div className="flex items-center gap-3 shrink-0">
          {user && onOpenSidebar && useHamburgerNav ? (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              aria-label="Open navigation"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          ) : null}
          <Link
            to="/"
            className="inline-flex items-center gap-3 group shrink-0"
          >
            {/* Animated Logo */}
            <span className="inline-flex items-center justify-center animate-spin-slow">
              <BrandLogo className="w-12 h-12 text-blue-600 group-hover:text-indigo-600 transition-colors drop-shadow-lg" />
            </span>
            {/* Animated, bold, gradient SVG text */}
            <span
              className="inline-block h-12 w-auto select-none align-middle animate-bounce-slow animate-gradient-move"
              style={{ verticalAlign: "middle" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 328 178"
                className="h-12 w-auto"
                style={{ display: "inline", verticalAlign: "middle" }}
              >
                <defs>
                  <linearGradient
                    id="puhui-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a21caf" />
                  </linearGradient>
                </defs>
                <path
                  id="谱绘"
                  className="cls-1"
                  fill="url(#puhui-gradient)"
                  d="M144,92.522a5.181,5.181,0,0,0,0-6.75,4.2,4.2,0,0,0-3.25-1.375h-21.5V42.647h21.5A4.19,4.19,0,0,0,144,41.272a4.831,4.831,0,0,0,1.25-3.375A4.316,4.316,0,0,0,144,34.522a4.68,4.68,0,0,0-3.25-1.125H59.5q-4.5,0-4.5,4.5a4.813,4.813,0,0,0,1.25,3.375,4.178,4.178,0,0,0,3.25,1.375H81.25V84.4H59.5a4.191,4.191,0,0,0-3.25,1.375,5.181,5.181,0,0,0,0,6.75A4.178,4.178,0,0,0,59.5,93.9h81.25A4.19,4.19,0,0,0,144,92.522ZM70.75,154.4a33.58,33.58,0,0,0,6.5,10.25A30.913,30.913,0,0,0,100,173.9a31.587,31.587,0,0,0,32-31.75,30.813,30.813,0,0,0-9.5-23,32.161,32.161,0,0,0-10-6.75,31.063,31.063,0,0,0-12.5-2.5,32.227,32.227,0,0,0-12.5,2.5,29.123,29.123,0,0,0-10.125,6.875A34.894,34.894,0,0,0,70.75,129.4,32.488,32.488,0,0,0,70.75,154.4Zm45.5,3.5a22.7,22.7,0,0,1-16.25,6.75,21.863,21.863,0,0,1-16-6.75,21.586,21.586,0,0,1-6.75-15.75,20.837,20.837,0,0,1,6.75-16,20.831,20.831,0,0,1,16-6.75,22.2,22.2,0,0,1,22.5,22.75,23.043,23.043,0,0,1-6.25,15.75h0ZM37.5,89.9v-23a23.184,23.184,0,0,0-1.75-9.125,26.335,26.335,0,0,0-5-7.625,21.932,21.932,0,0,0-16.5-6.75H8a4.517,4.517,0,0,0-3.125,1.25A4.189,4.189,0,0,0,3.5,47.9a4.72,4.72,0,0,0,1.375,3.25A4.143,4.143,0,0,0,8,52.647h6.25a14.131,14.131,0,0,1,10,4,14.435,14.435,0,0,1,4,10.25v23a29.911,29.911,0,0,0,7.5,20.5,31.317,31.317,0,0,0,18.5,10.5,5.862,5.862,0,0,0,3.375-1.125A4.134,4.134,0,0,0,59.5,116.9a4.553,4.553,0,0,0-.75-3.25,4.872,4.872,0,0,0-3-2,19.636,19.636,0,0,1-13-7.25A21.864,21.864,0,0,1,37.5,89.9h0ZM110,42.647V84.4H90.25V42.647H110ZM134.375,68.9a7.22,7.22,0,0,0,5.5,2.25,7.876,7.876,0,1,0,0-15.75,7.22,7.22,0,0,0-5.5,2.25,7.71,7.71,0,0,0-2.125,5.5A8.027,8.027,0,0,0,134.375,68.9ZM85.125,17.4a7.883,7.883,0,0,0,2.125-5.625,7.883,7.883,0,0,0-2.125-5.625A7.379,7.379,0,0,0,79.5,3.9,7.479,7.479,0,0,0,74,6.147a7.632,7.632,0,0,0-2.25,5.625A7.632,7.632,0,0,0,74,17.4a7.479,7.479,0,0,0,5.5,2.25A7.379,7.379,0,0,0,85.125,17.4ZM65.75,68.9a7.578,7.578,0,0,0,0-11.25,7.837,7.837,0,0,0-11,0,8.156,8.156,0,0,0,0,11.25A7.837,7.837,0,0,0,65.75,68.9Zm34.25,81a7.3,7.3,0,0,0,7.75-7.75,8.051,8.051,0,0,0-2.125-5.75,7.379,7.379,0,0,0-5.625-2.25,6.975,6.975,0,0,0-5.5,2.25,9.266,9.266,0,0,0,0,11.5A7.416,7.416,0,0,0,100,149.9Zm20.5-130.25A6.986,6.986,0,0,0,126,17.4a8.162,8.162,0,0,0,2-5.625,8.162,8.162,0,0,0-2-5.625,6.836,6.836,0,0,0-5.375-2.25,7.69,7.69,0,0,0-7.875,7.875,8.143,8.143,0,0,0,2,5.625A7.782,7.782,0,0,0,120.5,19.647Zm-82,9.875a7.87,7.87,0,0,0,2-5.625,8.34,8.34,0,0,0-2-5.75A6.986,6.986,0,0,0,33,15.9a7.479,7.479,0,0,0-5.5,2.25,7.789,7.789,0,0,0-2.25,5.75,7.368,7.368,0,0,0,2.25,5.625A7.7,7.7,0,0,0,33,31.647,7.189,7.189,0,0,0,38.5,29.522ZM186.5,71.9a12.665,12.665,0,0,1-4.25-10V61.4a14.615,14.615,0,0,1,4.125-10.375A13.383,13.383,0,0,1,196.5,46.647h8.75a5.547,5.547,0,0,0,3.625-1.125,4.113,4.113,0,0,0,1.375-3.375,4.324,4.324,0,0,0-1.375-3.125,4.913,4.913,0,0,0-3.625-1.375H196.5a22.86,22.86,0,0,0-16.75,7,27.878,27.878,0,0,0-5.125,7.75,22.069,22.069,0,0,0-1.875,9v0.5a22.043,22.043,0,0,0,1.875,9,21.553,21.553,0,0,0,5.125,7.25l2.5,2.5a4.024,4.024,0,0,1-1.375,1.25,2.708,2.708,0,0,0-1.125,1,28.518,28.518,0,0,0-5.125,7.625,21.8,21.8,0,0,0-1.875,9.125v0.75a22.042,22.042,0,0,0,1.875,9,21.552,21.552,0,0,0,5.125,7.25,22.741,22.741,0,0,0,16.75,6.75h11.25q5,0,5-4.5a5.189,5.189,0,0,0-1.25-3.625,4.834,4.834,0,0,0-3.75-1.375H196.5a13.513,13.513,0,0,1-10-3.75,13.956,13.956,0,0,1-4.25-10.25v-0.75a11.387,11.387,0,0,1,4.25-9.25q3.5-4.746,10-4.75H197a24.064,24.064,0,0,0,4.75-.5,28.4,28.4,0,0,0,5-1.5,35.791,35.791,0,0,0,8-6,4.378,4.378,0,0,0,1.25-3.5,5.2,5.2,0,0,0-1.5-3q-4-3.246-6.75.25a11.625,11.625,0,0,1-5,4,14.9,14.9,0,0,1-5.75,1.25h-0.5q-6.5,0-10-4.25h0Zm65.625,64.375a33.966,33.966,0,0,0,18,18,32.954,32.954,0,0,0,13.125,2.625,4.492,4.492,0,0,0,4.75-4.5q0-4.5-4.75-4.5a24.173,24.173,0,0,1-9.625-1.875,24.917,24.917,0,0,1-7.875-5.375,23.2,23.2,0,0,1-5.25-7.875,25.655,25.655,0,0,1-1.75-9.625v-27.5h45.5a4.728,4.728,0,0,0,3.25-1.375,4.271,4.271,0,0,0,0-6.5,4.745,4.745,0,0,0-3.25-1.375H242a4.311,4.311,0,0,0-3.125,1.375,4.528,4.528,0,0,0,0,6.5A4.3,4.3,0,0,0,242,95.647h7.5v27.5A32.954,32.954,0,0,0,252.122,136.272ZM272.247,30.4h2.25a32.033,32.033,0,0,1,23.5,9.75,32.323,32.323,0,0,1,9.75,23.75,4.026,4.026,0,0,0,1.5,3.25,5.283,5.283,0,0,0,3.5,1.25q4.5,0,4.5-4.5,0-18.5-12.5-30.5A42.255,42.255,0,0,0,274.5,20.9h-2.25a44.5,44.5,0,0,0-17.125,3.25A39.528,39.528,0,0,0,241.5,33.4a48.593,48.593,0,0,0-9.25,13.75,40.18,40.18,0,0,0-3.5,16.75,4.178,4.178,0,0,0,1.375,3.25,5.165,5.165,0,0,0,3.625,1.25q4.5,0,4.5-4.5A31.648,31.648,0,0,1,241,50.772a37.892,37.892,0,0,1,7-10.625q9.75-9.75,24.25-9.75h0Zm-60,115.5a4.99,4.99,0,0,0-1.25-3.25,4.037,4.037,0,0,0-3.25-1.5H187.5a4.143,4.143,0,0,0-3.125,1.5A4.727,4.727,0,0,0,183,145.9a4.492,4.492,0,0,0,4.5,4.75h20.25q4.5,0,4.5-4.75h0Zm74.5-79.625A4.518,4.518,0,0,0,288,63.147q0-4.746-4.75-4.75h-20.5a4.793,4.793,0,0,0-3.125,1.125,4.419,4.419,0,0,0-1.375,3.625,4.71,4.71,0,0,0,4.5,4.5h20.5A4.49,4.49,0,0,0,286.747,66.272Zm12,73.5a7.177,7.177,0,0,0,5.5,2.125,7.3,7.3,0,0,0,7.75-7.75,8.051,8.051,0,0,0-2.125-5.75,7.379,7.379,0,0,0-5.625-2.25,6.975,6.975,0,0,0-5.5,2.25,8.322,8.322,0,0,0-2,5.75A7.853,7.853,0,0,0,298.747,139.772Z"
                />
              </svg>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 flex-nowrap justify-end min-w-0">
          {!user
            ? renderLanguageSelect(
                "text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              )
            : null}
          {user ? (
            <div className="flex gap-2 sm:gap-4 items-center flex-nowrap min-w-0 justify-end">
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
                    <div className="px-4 py-2">
                      {renderLanguageSelect(
                        "w-full text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      )}
                    </div>
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
