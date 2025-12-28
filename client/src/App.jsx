import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ScoreEditor from './pages/ScoreEditor';
import ScoreView from './pages/ScoreView';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-white shadow-inner">
              <Routes>
                <Route path="/" element={<Home title="All Scores" endpoint="/scores" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create" element={
                  <PrivateRoute>
                    <ScoreEditor />
                  </PrivateRoute>
                } />
                <Route path="/created" element={
                  <PrivateRoute>
                    <Home title="My Created Scores" endpoint="/scores/my" />
                  </PrivateRoute>
                } />
                <Route path="/liked" element={
                  <PrivateRoute>
                    <Home title="My Liked Scores" endpoint="/scores/liked" />
                  </PrivateRoute>
                } />
                <Route path="/score/:id" element={<ScoreView />} />
              </Routes>
            </main>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
