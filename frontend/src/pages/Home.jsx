import "../home-styles.css";

export default function Home() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">Professional Music Education</div>
          <h1 className="hero-title">Sonara Space</h1>
          <p className="hero-subtitle">
            Мастерство игры на гитаре и фортепиано через инновационные технологии и персонализированное обучение
          </p>
          
          <div className="hero-actions">
            <button className="btn btn-primary btn-large">
              Начать обучение
            </button>
            <button className="btn btn-outline btn-large">
              Посмотреть уроки
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">10+</div>
              <div className="stat-label">Лет опыта</div>
            </div>
            <div className="stat">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Учеников</div>
            </div>
            <div className="stat">
              <div className="stat-number">50+</div>
              <div className="stat-label">Уроков</div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="section-header">
          <span className="section-badge">Преимущества</span>
          <h2 className="section-title">Почему выбирают Sonara Space</h2>
          <p className="section-description">
            Современная платформа для изучения музыки с использованием передовых технологий
          </p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <h3>Персонализированное обучение</h3>
            <p>Адаптивная система уроков, которая подстраивается под ваш уровень и темп обучения</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Эффективные сессии</h3>
            <p>Короткие, но интенсивные 15-минутные уроки для максимального усвоения материала</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Отслеживание прогресса</h3>
            <p>Детальная аналитика ваших достижений и рекомендации для дальнейшего развития</p>
          </div>
        </div>
      </div>
    </div>
  );
}
