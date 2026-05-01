import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Landing from './pages/Landing';
import LandingPage from './components/LandingPage';
import MissionPage from './pages/MissionPage';
import LiveData from './pages/LiveData';
import CitizenDashboard from './pages/CitizenDashboard';
import ScientistDashboard from './pages/ScientistDashboard';
import { LogOut, Shield } from 'lucide-react';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 my-2 border-slate-700/50 flex items-center justify-between px-6 py-3">
      <Link to="/" className="flex items-center gap-2 group">
        <Shield className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-all" />
        <span className="font-bold text-white tracking-widest uppercase text-sm">Neo Forecaster</span>
      </Link>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-slate-200">{user.fullName}</span>
          <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">{user.role}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-lg transition-all"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (user.role === 'SCIENTIST') return <ScientistDashboard />;
  return <CitizenDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mission" element={<MissionPage />} />
          <Route path="/live-data" element={<LiveData />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/welcome"
            element={
              <ProtectedRoute>
                <Landing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen-dashboard"
            element={
              <ProtectedRoute role="CITIZEN">
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scientist-dashboard"
            element={
              <ProtectedRoute role="SCIENTIST">
                <ScientistDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
