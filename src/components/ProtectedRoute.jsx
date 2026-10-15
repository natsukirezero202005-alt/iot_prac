import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Blocks a route for signed-out users (and, with adminOnly, for non-admins).
// This is a UX guard. Data security is enforced by Firestore Security Rules.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="route-loading" role="status">
        Loading…
      </div>
    );
  }

  if (!user) {
    // Remember where the user was going so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}
