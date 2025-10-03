import { useAuth } from "../auth.jsx";
import "../home-styles.css";

export default function Home() {
  const { clearAuth } = useAuth();

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">🎵</div>
          <h1 className="hero-title">Allegro</h1>
          <p className="hero-subtitle">
            Учись играть на гитаре и пианино — практикуйся по 10–15 минут в день.
          </p>
          
          <div className="hero-actions">
            <button className="btn btn-primary btn-large">
              🎸 Начать обучение
            </button>
            <button className="btn btn-secondary btn-large">
              📚 Посмотреть уроки
            </button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Почему выбирают Allegro?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Персональный подход</h3>
            <p>Уроки адаптируются под ваш уровень и темп обучения</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>Всего 15 минут в день</h3>
            <p>Эффективные короткие уроки, которые легко вписать в расписание</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Система достижений</h3>
            <p>Отслеживайте прогресс и получайте награды за успехи</p>
          </div>
        </div>
      </div>
    </div>
  );
}
