import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Monitoring from './pages/Monitoring';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import Footer from './components/Footer';

// Import our new security guard!
import ProtectedRoute from './components/ProtectedRoute'; 

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
}

function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
        {/* Public Routes - Anyone can visit these */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><PublicOnlyRoute><Login /></PublicOnlyRoute></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><PublicOnlyRoute><Register /></PublicOnlyRoute></PublicLayout>} />
        
        {/* Protected Routes - Locked behind the security guard */}
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AppLayout><Alerts /></AppLayout></ProtectedRoute>} />
        <Route path="/monitoring" element={<ProtectedRoute><AppLayout><Monitoring /></AppLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;