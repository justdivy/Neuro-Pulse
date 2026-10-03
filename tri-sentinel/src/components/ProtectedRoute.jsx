import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) return null;

  if (!isAuthenticated) {
    // If they aren't logged in, kick them to the login screen with a message
    return <Navigate to="/login" replace state={{ notification: 'Secure access required. Please log in.' }} />;
  }

  // If they are logged in, let them through to the page!
  return children;
}