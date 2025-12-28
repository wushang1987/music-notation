import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import ScoreEditor from './pages/ScoreEditor';
import ScoreView from './pages/ScoreView';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;
  return user ? children : <Navigate to="/auth" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/auth', '/login', '/register'].includes(location.pathname);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {!isAuthPage && <Navbar />}
      <div className="flex flex-1 overflow-hidden">
        {!isAuthPage && <Sidebar />}
        <main className={`flex-1 overflow-y-auto bg-white ${!isAuthPage ? 'shadow-inner' : ''}`}>
          <Routes>
            <Route path="/" element={<Home title="All Scores" endpoint="/scores" />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Navigate to="/auth" />} />
            <Route path="/register" element={<Navigate to="/auth" />} />
            <Route path="/create" element={
              <PrivateRoute>
                <ScoreEditor />
              </PrivateRoute>
            } />
            <Route path="/created" element={
              <PrivateRoute>
                <Home title="My Scores" endpoint="/scores/my" />
              </PrivateRoute>
            } />
            <Route path="/liked" element={
              <PrivateRoute>
                <Home title="My Liked Scores" endpoint="/scores/liked" />
              </PrivateRoute>
            } />
            <Route path="/score/:id" element={<ScoreView />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
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
