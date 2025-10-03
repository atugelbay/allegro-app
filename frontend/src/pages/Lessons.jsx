import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLessons, getUserProgress } from "../api";
import "../lessons-styles.css";

export default function Lessons() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [hasSubscription, setHasSubscription] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lessonsData, progressData] = await Promise.all([
        getLessons(),
        getUserProgress()
      ]);
      
      setLessons(lessonsData);
      setProgress(progressData);
      
      // Проверяем подписку (если есть хотя бы один урок доступен)
      setHasSubscription(lessonsData.length > 0);
      
    } catch (err) {
      console.error("Error loading lessons:", err);
      setError(err.message);
      
      // Если ошибка 403 (Forbidden) - нет подписки
      if (err.message.includes("403")) {
        setHasSubscription(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getLessonProgress = (lessonId) => {
    return progress.find(p => p.lesson_id === lessonId) || {
      completed_exercises: 0,
      total_exercises: 0,
      progress: 0
    };
  };

  const getInstrumentEmoji = (instrument) => {
    if (!instrument) return "🎵";
    switch(instrument.toLowerCase()) {
      case "guitar": return "🎸";
      case "piano": return "🎹";
      default: return "🎵";
    }
  };

  const handleLessonClick = (lessonId) => {
    if (!lessonId) {
      console.error('Lesson ID is undefined:', lessonId);
      return;
    }
    navigate(`/lessons/${lessonId}`);
  };

  const categories = ["Все", "Гитара", "Пианино"];
  const [selectedCategory, setSelectedCategory] = useState("Все");

  const filteredLessons = selectedCategory === "Все" 
    ? (Array.isArray(lessons) ? lessons : []) 
    : (Array.isArray(lessons) ? lessons.filter(lesson => lesson.Instrument && lesson.Instrument.toLowerCase() === selectedCategory.toLowerCase()) : []);

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

  if (!hasSubscription) {
    return (
      <div className="lessons-page">
        <div className="lessons-container">
          <div className="subscription-required">
            <h2>🔒 Требуется подписка</h2>
            <p>Для доступа к урокам необходимо оформить подписку</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/subscriptions')}
            >
              Оформить подписку
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lessons-page">
        <div className="lessons-container">
          <div className="error-message">
            <h2>❌ Ошибка загрузки</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadData}>
              Попробовать снова
            </button>
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
              <span className="stat-number">
                {progress.reduce((total, p) => total + p.completed_exercises, 0)}
              </span>
              <span className="stat-label">Выполнено упражнений</span>
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
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <span className="stat-number">
                {progress.length > 0 ? Math.round(progress.reduce((total, p) => total + p.progress, 0) / progress.length) : 0}%
              </span>
              <span className="stat-label">Общий прогресс</span>
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
          {filteredLessons.map(lesson => {
            if (!lesson) return null;
            const lessonProgress = getLessonProgress(lesson.ID);
            const isCompleted = lessonProgress.progress === 100;
            
            return (
              <div key={lesson.ID} className={`lesson-card ${isCompleted ? 'completed' : ''}`}>
                <div className="lesson-header">
                  <div className="lesson-instrument">{getInstrumentEmoji(lesson.Instrument)}</div>
                  {isCompleted && <div className="completed-badge">✓</div>}
                </div>
                
                <div className="lesson-content">
                  <h3 className="lesson-title">{lesson.Title || 'Без названия'}</h3>
                  <p className="lesson-description">{lesson.Description || 'Описание отсутствует'}</p>
                  
                  <div className="lesson-meta">
                    <span className="lesson-instrument-name">{lesson.Instrument || 'Не указан'}</span>
                    <span className="lesson-exercises">
                      📝 {lessonProgress.completed_exercises}/{lessonProgress.total_exercises} упражнений
                    </span>
                  </div>

                  {lessonProgress.total_exercises > 0 && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${lessonProgress.progress}%` }}
                      ></div>
                      <span className="progress-text">{Math.round(lessonProgress.progress)}%</span>
                    </div>
                  )}
                </div>

                <div className="lesson-footer">
                  <button 
                    className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleLessonClick(lesson.ID)}
                  >
                    {isCompleted ? 'Повторить урок' : 'Начать урок'}
                  </button>
                </div>
              </div>
            );
          })}
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
