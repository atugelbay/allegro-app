import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

export default function Nav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="modern-nav">
      <div className="nav-container">
        {/* Logo/Brand */}
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="brand-text">Sonara Space</span>
        </Link>

        {/* Mobile Menu Button */}
        {user && (
          <button 
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        )}

        {/* Navigation Links */}
        {user && (
          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link 
              to="/subscriptions" 
              className={`nav-link ${isActive('/subscriptions') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Подписки
            </Link>
            <Link 
              to="/lessons" 
              className={`nav-link ${isActive('/lessons') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Уроки
            </Link>
            <Link 
              to="/progress" 
              className={`nav-link ${isActive('/progress') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Прогресс
            </Link>
            <Link 
              to="/trainer" 
              className={`nav-link ${isActive('/trainer') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Тюнер
            </Link>
            <Link 
              to="/me" 
              className={`nav-link ${isActive('/me') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Профиль
            </Link>
          </div>
        )}

        {/* User Actions */}
        <div className="nav-actions">
          {!user && (
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
