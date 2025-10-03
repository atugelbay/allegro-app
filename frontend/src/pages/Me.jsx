import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth.jsx";
import "../profile-styles.css";

export default function Me() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await api("/me", { auth: true });
      
      // Если данные пришли как строка, парсим их
      let parsedData = data;
      if (typeof data === 'string') {
        parsedData = JSON.parse(data);
      }
      
      setUserData(parsedData);
      setError(null);
    } catch (e) {
      console.error("Profile error:", e);
      setError(e.message || "Ошибка загрузки профиля");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getPlanDisplayName = (plan) => {
    const planNames = {
      'basic': 'Базовый',
      'pro': 'Профессиональный', 
      'family': 'Семейный'
    };
    return planNames[plan] || plan;
  };

  const getStatusDisplayName = (status) => {
    const statusNames = {
      'active': 'Активна',
      'trialing': 'Пробный период',
      'cancelled': 'Отменена',
      'expired': 'Истекла'
    };
    return statusNames[status] || status;
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h2>Ошибка загрузки профиля</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={fetchUserData} className="btn btn-primary">
                Попробовать снова
              </button>
              <button onClick={handleLogout} className="btn btn-secondary">
                Войти заново
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-text">
              {userData?.first_name?.charAt(0)?.toUpperCase() || userData?.email?.charAt(0)?.toUpperCase() || 'У'}
            </span>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">
              {userData?.first_name && userData?.last_name 
                ? `${userData.first_name} ${userData.last_name}`
                : 'Мой профиль'
              }
            </h1>
            <p className="profile-email">{userData?.email}</p>
          </div>
        </div>

        {/* Profile Cards */}
        <div className="profile-cards">
          {/* Основная информация */}
          <div className="profile-card">
            <div className="card-header">
              <h3>👤 Основная информация</h3>
            </div>
            <div className="card-content">
              <div className="info-row">
                <span className="info-label">Полное имя:</span>
                <span className="info-value">
                  {userData?.first_name && userData?.last_name 
                    ? `${userData.first_name} ${userData.last_name}`
                    : 'Не указано'
                  }
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{userData?.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Язык:</span>
                <span className="info-value">
                  {userData?.locale === 'ru' ? '🇷🇺 Русский' : 
                   userData?.locale === 'en' ? '🇺🇸 English' : 
                   userData?.locale || 'Не указан'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Дата регистрации:</span>
                <span className="info-value">{formatDate(userData?.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Подписка */}
          <div className="profile-card">
            <div className="card-header">
              <h3>💎 Подписка</h3>
            </div>
            <div className="card-content">
              {userData?.subscription ? (
                <>
                  <div className="subscription-badge">
                    <span className="badge badge-success">
                      {getPlanDisplayName(userData.subscription.plan)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Статус:</span>
                    <span className="info-value status-active">
                      {getStatusDisplayName(userData.subscription.status)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ID подписки:</span>
                    <span className="info-value">{userData.subscription.id}</span>
                  </div>
                </>
              ) : (
                <div className="no-subscription">
                  <p>🚫 Активной подписки нет</p>
                  <a href="/subscriptions" className="btn btn-primary btn-small">
                    Выбрать план
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Настройки аккаунта */}
          <div className="profile-card">
            <div className="card-header">
              <h3>⚙️ Настройки аккаунта</h3>
            </div>
            <div className="card-content">
              <div className="settings-actions">
                <button className="btn btn-secondary btn-block">
                  📧 Изменить email
                </button>
                <button className="btn btn-secondary btn-block">
                  🔒 Изменить пароль
                </button>
                <button className="btn btn-secondary btn-block">
                  🌐 Настройки языка
                </button>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-danger btn-block"
                >
                  🚪 Выйти из аккаунта
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
