import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// variant "scene": glass bar fixed over the Home / Result artwork.
// variant "plain": solid bar for ordinary pages (Admin, Login, Signup).
export default function Header({ variant = 'scene' }) {
  const { user, isAdmin, loading, displayName, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className={`site-header site-header--${variant}`}>
      <Link to="/" className="site-header__brand">
        QUIZ HUB
      </Link>

      <nav className="site-header__nav" aria-label="Account">
        {loading ? null : user ? (
          <>
            <span className="site-header__user" title={user.email}>
              {displayName}
            </span>
            {isAdmin && (
              <Link to="/admin" className="btn btn--ghost btn--small">
                Admin
              </Link>
            )}
            <button type="button" className="btn btn--ghost btn--small" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn--ghost btn--small">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
