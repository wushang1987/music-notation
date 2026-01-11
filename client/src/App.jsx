import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ScoreCreationHub from "./pages/ScoreCreationHub";
import ScoreEditor from "./pages/ScoreEditor";
import VerovioEditor from "./pages/VerovioEditor";
import ScoreEditorWrapper from "./components/ScoreEditorWrapper";
import ScoreView from "./pages/ScoreView";



import Albums from "./pages/Albums";
import AlbumEditor from "./pages/AlbumEditor";
import AlbumView from "./pages/AlbumView";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyEmail from "./pages/VerifyEmail";
import { useTranslation } from "react-i18next";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading)
    return <div className="p-10 text-center font-bold">Loading...</div>;
  return user ? children : <Navigate to="/auth" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading)
    return <div className="p-10 text-center font-bold">Loading...</div>;
  return user && user.role === "admin" ? children : <Navigate to="/" />;
};

const AppContent = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [useHamburgerNav, setUseHamburgerNav] = useState(false);
  const isAuthPage =
    ["/auth", "/login", "/register", "/forgot-password"].includes(location.pathname) ||
    location.pathname.startsWith("/verify/") ||
    location.pathname.startsWith("/reset-password/");

  const isEditorPage =
    location.pathname.startsWith("/create") ||
    location.pathname.startsWith("/edit/");


  useEffect(() => {
    document.title = t("brand.name");
  }, [t, i18n.resolvedLanguage, i18n.language]);

  useEffect(() => {
    const id = window.setTimeout(() => setSidebarOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    // Use hamburger nav on:
    // - small screens (portrait/any)
    // - small-device landscape (avoid desktop-style sidebar on phones/tablets in landscape)
    const mediaQuery = window.matchMedia(
      "(max-width: 767px), (orientation: landscape) and (max-width: 1024px) and (max-height: 600px)"
    );

    const handleChange = () => {
      setUseHamburgerNav(mediaQuery.matches);
      setSidebarOpen(false);
    };

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    // Safari < 14
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {!isAuthPage && !isEditorPage && (
        <Navbar
          onOpenSidebar={user ? () => setSidebarOpen(true) : undefined}
          useHamburgerNav={useHamburgerNav}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        {!isAuthPage && !isEditorPage && user && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            useHamburgerNav={useHamburgerNav}
          />
        )}
        <main
          className={`flex-1 overflow-y-auto bg-white ${!isAuthPage && !isEditorPage ? "shadow-inner" : ""
            }`}
        >
          <Routes>
            <Route
              path="/"
              element={<Home title="home.allScores" endpoint="/scores" />}
            />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify/:token" element={<VerifyEmail />} />
            <Route path="/login" element={<Navigate to="/auth" />} />
            <Route path="/register" element={<Navigate to="/auth" />} />
            <Route
              path="/create"
              element={
                <PrivateRoute>
                  <ScoreCreationHub />
                </PrivateRoute>
              }
            />
            <Route
              path="/create/abcjs"
              element={
                <PrivateRoute>
                  <ScoreEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/create/verovio"
              element={
                <PrivateRoute>
                  <VerovioEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <PrivateRoute>
                  <ScoreEditorWrapper />
                </PrivateRoute>
              }
            />


            <Route
              path="/created"
              element={
                <PrivateRoute>
                  <Home title="home.myScores" endpoint="/scores/my" />
                </PrivateRoute>
              }
            />
            <Route
              path="/liked"
              element={
                <PrivateRoute>
                  <Home title="home.myLikedScores" endpoint="/scores/liked" />
                </PrivateRoute>
              }
            />

            <Route path="/albums" element={<Albums />} />

            <Route path="/score/:id" element={<ScoreView />} />
            <Route path="/album/:id" element={<AlbumView />} />
            <Route
              path="/albums/create"
              element={
                <PrivateRoute>
                  <AlbumEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/albums/edit/:id"
              element={
                <PrivateRoute>
                  <AlbumEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
