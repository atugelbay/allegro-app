import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";
import "../register-styles.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    // Валидация
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      setMsg("Пожалуйста, заполните все поля");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Пароли не совпадают");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMsg("Пароль должен содержать минимум 6 символов");
      setLoading(false);
      return;
    }

    try {
      // Регистрируем пользователя
      await api("/auth/register", { 
        method: "POST", 
        body: { 
          email, 
          password, 
          first_name: firstName, 
          last_name: lastName 
        }, 
        auth: false 
      });
      
      // Автоматически входим в систему после регистрации
      const loginData = await api("/auth/login", { 
        method: "POST", 
        body: { email, password }, 
        auth: false 
      });
      
      // Если данные пришли как строка, парсим их
      let parsedData = loginData;
      if (typeof loginData === 'string') {
        parsedData = JSON.parse(loginData);
      }
      
      // Входим в систему
      login(parsedData.access_token, parsedData.refresh_token);
      
      setSuccess(true);
      setMsg("Регистрация успешна! Добро пожаловать в Allegro!");
      
      // Перенаправляем на главную страницу через 1 секунду
      setTimeout(() => {
        nav("/");
      }, 1000);
      
    } catch (e) {
      console.error("Registration error:", e);
      setMsg(e.message || "Ошибка регистрации");
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
            <h1 className="auth-title">Присоединяйтесь!</h1>
            <p className="auth-subtitle">Создайте аккаунт Sonara Space и начните обучение</p>
          </div>

          {/* Message */}
          {msg && (
            <div className={`message ${success ? 'message-success' : 'message-error'}`}>
              {msg}
            </div>
          )}

          {/* Registration Form */}
          {!success && (
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

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Имя</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ваше имя"
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Фамилия</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ваша фамилия"
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Подтвердите пароль</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
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
                    Создание аккаунта...
                  </>
                ) : (
                  'Зарегистрироваться'
                )}
              </button>
            </form>
          )}

          {/* Success Message */}
          {success && (
            <div className="success-content">
              <div className="success-icon">✅</div>
              <p>Добро пожаловать! Перенаправляем...</p>
            </div>
          )}

          {/* Auth Links */}
          <div className="auth-links-footer">
            <p>Уже есть аккаунт? 
              <Link to="/login" className="auth-link"> Войти</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
