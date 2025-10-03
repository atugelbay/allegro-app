import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth";

export default function Nav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="modern-nav">
      <div className="nav-container">
        {/* Logo/Brand */}
        <Link to="/" className="nav-brand">
          <div className="brand-icon">🎵</div>
          <span className="brand-text">Allegro</span>
        </Link>

        {/* Navigation Links */}
        {user && (
          <div className="nav-links">
            <Link 
              to="/subscriptions" 
              className={`nav-link ${isActive('/subscriptions') ? 'active' : ''}`}
            >
              <span className="nav-link-icon">💎</span>
              Подписки
            </Link>
            <Link 
              to="/lessons" 
              className={`nav-link ${isActive('/lessons') ? 'active' : ''}`}
            >
              <span className="nav-link-icon">🎸</span>
              Уроки
            </Link>
            <Link 
              to="/trainer" 
              className={`nav-link ${isActive('/trainer') ? 'active' : ''}`}
            >
              <span className="nav-link-icon">🎵</span>
              Тюнер
            </Link>
            <Link 
              to="/me" 
              className={`nav-link ${isActive('/me') ? 'active' : ''}`}
            >
              <span className="nav-link-icon">👤</span>
              Профиль
            </Link>
          </div>
        )}

        {/* User Actions */}
        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">
                Привет, <strong>
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.email
                  }
                </strong>
              </span>
              <button onClick={logout} className="btn btn-outline logout-btn">
                Выйти
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-secondary">
                Войти
              </Link>
              <Link to="/register" className="btn btn-primary">
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
