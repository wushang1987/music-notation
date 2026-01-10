import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const SidebarLink = ({ to, onClick, isActive, icon, label, collapsed }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center ${collapsed ? "justify-center px-2" : "px-4"
      } py-3 rounded-lg transition-all duration-200 text-sm font-medium ${isActive(
        to
      )}`}
    title={collapsed ? label : undefined}
  >
    <div className={`${collapsed ? "" : "mr-3"} shrink-0`}>{icon}</div>
    {!collapsed && <span className="whitespace-nowrap">{label}</span>}
  </Link>
);

const NavContent = ({
  t,
  user,
  isActive,
  handleNavigate,
  collapsed = false,
  onToggleCollapse,
}) => (
  <div className={collapsed ? "px-2 py-6" : "p-6"}>
    <div
      className={`flex items-center ${collapsed ? "justify-center" : "justify-between"
        } mb-4`}
    >
      {!collapsed && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap overflow-hidden">
          {t("sidebar.navigation")}
        </p>
      )}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          )}
        </button>
      )}
    </div>
    <nav className="space-y-1">
      <SidebarLink
        to="/"
        onClick={handleNavigate}
        isActive={isActive}
        label={t("common.home")}
        collapsed={collapsed}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        }
      />

      <SidebarLink
        to="/albums"
        onClick={handleNavigate}
        isActive={isActive}
        label={t("albums.sectionTitle")}
        collapsed={collapsed}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19V6l12-2v13"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 10l12-2"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 21a2 2 0 100-4 2 2 0 000 4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 19a2 2 0 100-4 2 2 0 000 4z"
            />
          </svg>
        }
      />

      <SidebarLink
        to="/create"
        onClick={handleNavigate}
        isActive={isActive}
        label={t("common.create")}
        collapsed={collapsed}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        }
      />

      <SidebarLink
        to="/created"
        onClick={handleNavigate}
        isActive={isActive}
        label={t("common.created")}
        collapsed={collapsed}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      />

      <SidebarLink
        to="/liked"
        onClick={handleNavigate}
        isActive={isActive}
        label={t("common.likes")}
        collapsed={collapsed}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        }
      />

      {user && user.role === "admin" ? (
        <SidebarLink
          to="/admin"
          onClick={handleNavigate}
          isActive={isActive}
          label={t("common.admin")}
          collapsed={collapsed}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
      ) : null}
    </nav>
  </div>
);

const Sidebar = ({ isOpen = false, onClose, useHamburgerNav = false }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => {
    const current = `${location.pathname}${location.hash || ""}`;
    return current === path
      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
      : "text-gray-600 hover:bg-gray-100 hover:text-blue-600";
  };

  const handleNavigate = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {!useHamburgerNav ? (
        <aside
          className={`${isCollapsed ? "w-20" : "w-64"
            } bg-white border-r border-gray-200 h-full flex flex-col z-10 shrink-0 transition-all duration-300`}
        >
          <div className="flex-1 overflow-y-auto">
            <NavContent
              t={t}
              user={user}
              isActive={isActive}
              handleNavigate={handleNavigate}
              collapsed={isCollapsed}
              onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />
          </div>
        </aside>
      ) : null}

      {useHamburgerNav && isOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            aria-label="Close navigation"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white border-r border-gray-200 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t("sidebar.navigation")}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                aria-label="Close navigation"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="pt-1">
              <NavContent
                t={t}
                user={user}
                isActive={isActive}
                handleNavigate={handleNavigate}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
};

export default Sidebar;
