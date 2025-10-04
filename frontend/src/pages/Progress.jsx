import { useEffect, useState } from "react";
import { getUserProgress } from "../api";
import "../lessons-styles.css";

export default function Progress() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const progressData = await getUserProgress();
      setProgress(progressData);
    } catch (err) {
      console.error("Error loading progress:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    const totalExercises = progress.reduce((sum, p) => sum + p.total_exercises, 0);
    const completedExercises = progress.reduce((sum, p) => sum + p.completed_exercises, 0);
    const totalProgress = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
    
    return {
      totalLessons: progress.length,
      completedLessons: progress.filter(p => p.progress === 100).length,
      totalExercises,
      completedExercises,
      totalProgress
    };
  };

  const getProgressColor = (progressValue) => {
    if (progressValue === 100) return "#10b981"; // green-500
    if (progressValue >= 75) return "#3b82f6";  // blue-500
    if (progressValue >= 50) return "#eab308";  // yellow-500
    if (progressValue >= 25) return "#f97316";  // orange-500
    return "#ef4444"; // red-500
  };

  const getProgressIcon = (progressValue) => {
    if (progressValue === 100) return "🎉";
    if (progressValue >= 75) return "🔥";
    if (progressValue >= 50) return "💪";
    if (progressValue >= 25) return "📈";
    return "🎯";
  };

  if (loading) {
    return (
      <div className="progress-page">
        <div className="progress-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Загрузка прогресса...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-page">
        <div className="progress-container">
          <div className="error-message">
            <h2>❌ Ошибка загрузки</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadProgress}>
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="progress-page">
      <div className="progress-container">
        {/* Header */}
        <div className="progress-header">
          <h1>📊 Ваш прогресс</h1>
          <p>Отслеживайте свои достижения в изучении музыки</p>
        </div>

        {/* Overall Stats */}
        <div className="overall-stats">
          <div className="stat-card-large">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <span className="stat-number">{stats.totalProgress}%</span>
              <span className="stat-label">Общий прогресс</span>
            </div>
          </div>
          
          <div className="stat-card-large">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <span className="stat-number">{stats.completedLessons}/{stats.totalLessons}</span>
              <span className="stat-label">Завершено уроков</span>
            </div>
          </div>
          
          <div className="stat-card-large">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-number">{stats.completedExercises}/{stats.totalExercises}</span>
              <span className="stat-label">Выполнено упражнений</span>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="progress-chart">
          <h2>Прогресс по урокам</h2>
          
          {progress.length === 0 ? (
            <div className="no-progress">
              <p>🔍 У вас пока нет прогресса. Начните с первого урока!</p>
            </div>
          ) : (
            <div className="lessons-progress-list">
              {progress.map((lesson) => (
                <div key={lesson.lesson_id} className="lesson-progress-item">
                  <div className="lesson-progress-header">
                    <h3 className="lesson-title">{lesson.lesson_title}</h3>
                    <div className="lesson-progress-badge">
                      <span className="progress-icon">
                        {getProgressIcon(lesson.progress)}
                      </span>
                      <span className="progress-percentage">
                        {Math.round(lesson.progress)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="lesson-progress-bar" style={{ border: '1px solid #e5e7eb' }}>
                    <div 
                      className="lesson-progress-fill"
                      style={{ 
                        width: `${Math.round(lesson.progress)}%`,
                        backgroundColor: getProgressColor(lesson.progress),
                        minWidth: Math.round(lesson.progress) > 0 ? '4px' : '0px',
                        height: '100%',
                        borderRadius: '6px',
                        transition: 'width 0.5s ease'
                      }}
                      title={`${Math.round(lesson.progress)}% завершено`}
                    ></div>
                  </div>
                  
                  <div className="lesson-progress-stats">
                    <span className="exercises-completed">
                      {lesson.completed_exercises} из {lesson.total_exercises} упражнений
                    </span>
                    <span className="lesson-status">
                      {lesson.progress === 100 ? "Завершен" : 
                       lesson.progress > 0 ? "В процессе" : "Не начат"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="achievements">
          <h2>🏆 Достижения</h2>
          <div className="achievements-grid">
            {stats.completedExercises >= 1 && (
              <div className="achievement-card completed">
                <div className="achievement-icon">🎵</div>
                <div className="achievement-info">
                  <h4>Первые шаги</h4>
                  <p>Выполните первое упражнение</p>
                </div>
              </div>
            )}
            
            {stats.completedExercises >= 10 && (
              <div className="achievement-card completed">
                <div className="achievement-icon">🎸</div>
                <div className="achievement-info">
                  <h4>Музыкант</h4>
                  <p>Выполните 10 упражнений</p>
                </div>
              </div>
            )}
            
            {stats.completedLessons >= 1 && (
              <div className="achievement-card completed">
                <div className="achievement-icon">📚</div>
                <div className="achievement-info">
                  <h4>Ученик</h4>
                  <p>Завершите первый урок</p>
                </div>
              </div>
            )}
            
            {stats.completedLessons >= 3 && (
              <div className="achievement-card completed">
                <div className="achievement-icon">🎓</div>
                <div className="achievement-info">
                  <h4>Студент</h4>
                  <p>Завершите 3 урока</p>
                </div>
              </div>
            )}
            
            {stats.totalProgress >= 100 && (
              <div className="achievement-card completed">
                <div className="achievement-icon">👑</div>
                <div className="achievement-info">
                  <h4>Мастер</h4>
                  <p>Завершите все уроки</p>
                </div>
              </div>
            )}
            
            {/* Заблокированные достижения */}
            {stats.completedExercises < 50 && (
              <div className="achievement-card locked">
                <div className="achievement-icon">🎼</div>
                <div className="achievement-info">
                  <h4>Виртуоз</h4>
                  <p>Выполните 50 упражнений</p>
                  <span className="progress-text">{stats.completedExercises}/50</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
