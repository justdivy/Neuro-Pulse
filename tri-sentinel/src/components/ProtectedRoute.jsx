import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check if our browser storage has the "isAuthenticated" key
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    // If they aren't logged in, kick them to the login screen with a message
    return <Navigate to="/login" replace state={{ notification: 'Secure access required. Please log in.' }} />;
  }

  // If they are logged in, let them through to the page!
  return children;
}