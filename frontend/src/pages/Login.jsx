import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    
    try {
      const data = await api("/auth/login", { method: "POST", body: { email, password }, auth: false });
      
      // Если данные пришли как строка, парсим их
      let parsedData = data;
      if (typeof data === 'string') {
        parsedData = JSON.parse(data);
      }
      
      login(parsedData.access_token, parsedData.refresh_token);
      nav("/");
    } catch (e) {
      console.error("Login error:", e);
      setMsg(e.message || "Ошибка логина");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card animate-slide-in">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="auth-title">Добро пожаловать!</h1>
            <p className="auth-subtitle">Войдите в свой аккаунт Sonara Space</p>
          </div>

          {/* Error Message */}
          {msg && (
            <div className="message message-error">
              {msg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@allegro.com"
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </button>
          </form>

          {/* Auth Links */}
          <div className="auth-links-footer">
            <p>Нет аккаунта? 
              <Link to="/register" className="auth-link"> Создать аккаунт</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
