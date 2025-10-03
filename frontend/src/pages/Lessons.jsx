import { useEffect, useState } from "react";
import { api } from "../api";
import "../lessons-styles.css";

export default function Lessons() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Симуляция загрузки данных
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const lessons = [
    {
      id: 1,
      title: "Основы гитары",
      description: "Изучите базовые аккорды и технику игры на гитаре",
      duration: "15 мин",
      difficulty: "Начинающий",
      instrument: "🎸",
      completed: false,
      category: "Гитара"
    },
    {
      id: 2,
      title: "Ритм и темп",
      description: "Развивайте чувство ритма и научитесь играть в темп",
      duration: "20 мин",
      difficulty: "Начинающий",
      instrument: "🎵",
      completed: true,
      category: "Теория"
    },
    {
      id: 3,
      title: "Основы пианино",
      description: "Первые шаги в изучении клавишных инструментов",
      duration: "18 мин",
      difficulty: "Начинающий",
      instrument: "🎹",
      completed: false,
      category: "Пианино"
    },
    {
      id: 4,
      title: "Аккорды для популярных песен",
      description: "Изучите аккорды для исполнения хитов",
      duration: "25 мин",
      difficulty: "Средний",
      instrument: "🎸",
      completed: false,
      category: "Гитара"
    },
    {
      id: 5,
      title: "Импровизация",
      description: "Развивайте творческие навыки и импровизацию",
      duration: "30 мин",
      difficulty: "Продвинутый",
      instrument: "🎼",
      completed: false,
      category: "Творчество"
    }
  ];

  const categories = ["Все", "Гитара", "Пианино", "Теория", "Творчество"];
  const [selectedCategory, setSelectedCategory] = useState("Все");

  const filteredLessons = selectedCategory === "Все" 
    ? lessons 
    : lessons.filter(lesson => lesson.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Начинающий": return "var(--green-600)";
      case "Средний": return "var(--yellow-600)";
      case "Продвинутый": return "var(--red-600)";
      default: return "var(--neutral-600)";
    }
  };

  if (loading) {
    return (
      <div className="lessons-page">
        <div className="lessons-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Загрузка уроков...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lessons-page">
      <div className="lessons-container">
        {/* Header */}
        <div className="lessons-header">
          <h1>🎵 Уроки музыки</h1>
          <p>Изучайте музыку в удобном темпе с нашими интерактивными уроками</p>
        </div>

        {/* Progress Stats */}
        <div className="progress-stats">
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-number">{lessons.filter(l => l.completed).length}</span>
              <span className="stat-label">Завершено</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <span className="stat-number">{lessons.length}</span>
              <span className="stat-label">Всего уроков</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <span className="stat-number">
                {lessons.reduce((total, lesson) => total + parseInt(lesson.duration), 0)}
              </span>
              <span className="stat-label">Минут обучения</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Lessons Grid */}
        <div className="lessons-grid">
          {filteredLessons.map(lesson => (
            <div key={lesson.id} className={`lesson-card ${lesson.completed ? 'completed' : ''}`}>
              <div className="lesson-header">
                <div className="lesson-instrument">{lesson.instrument}</div>
                {lesson.completed && <div className="completed-badge">✓</div>}
              </div>
              
              <div className="lesson-content">
                <h3 className="lesson-title">{lesson.title}</h3>
                <p className="lesson-description">{lesson.description}</p>
                
                <div className="lesson-meta">
                  <span className="lesson-duration">⏱️ {lesson.duration}</span>
                  <span 
                    className="lesson-difficulty"
                    style={{ color: getDifficultyColor(lesson.difficulty) }}
                  >
                    🎯 {lesson.difficulty}
                  </span>
                </div>
              </div>

              <div className="lesson-footer">
                <button className={`btn ${lesson.completed ? 'btn-secondary' : 'btn-primary'}`}>
                  {lesson.completed ? 'Повторить' : 'Начать урок'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="no-lessons">
            <p>🔍 Уроки в категории "{selectedCategory}" не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
