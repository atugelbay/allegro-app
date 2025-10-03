import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLesson, updateProgress } from "../api";
import PitchTrainer from "./PitchTrainer";
import "../lessons-styles.css";

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [showPitchTrainer, setShowPitchTrainer] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const lessonData = await getLesson(id);
      setLesson(lessonData);
    } catch (err) {
      console.error("Error loading lesson:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseComplete = async (exerciseId) => {
    try {
      await updateProgress(exerciseId, "done");
      setCompletedExercises(prev => new Set([...prev, exerciseId]));
      
      // Переходим к следующему упражнению
      if (currentExerciseIndex < lesson.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
      } else {
        // Урок завершен
        alert("🎉 Поздравляем! Урок завершен!");
      }
      
      setShowPitchTrainer(false);
    } catch (err) {
      console.error("Error updating progress:", err);
      alert("Ошибка при сохранении прогресса");
    }
  };

  const startExercise = () => {
    setShowPitchTrainer(true);
  };

  const getProgressPercentage = () => {
    if (!lesson || lesson.exercises.length === 0) return 0;
    return Math.round((completedExercises.size / lesson.exercises.length) * 100);
  };

  if (loading) {
    return (
      <div className="lesson-detail-page">
        <div className="lesson-detail-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Загрузка урока...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-detail-page">
        <div className="lesson-detail-container">
          <div className="error-message">
            <h2>❌ Ошибка загрузки</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadLesson}>
              Попробовать снова
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/lessons')}>
              Вернуться к урокам
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-detail-page">
        <div className="lesson-detail-container">
          <div className="error-message">
            <h2>Урок не найден</h2>
            <button className="btn btn-primary" onClick={() => navigate('/lessons')}>
              Вернуться к урокам
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Проверяем, есть ли упражнения
  if (!lesson.exercises || lesson.exercises.length === 0) {
    return (
      <div className="lesson-detail-page">
        <div className="lesson-detail-container">
          <div className="lesson-detail-header">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/lessons')}
            >
              ← Назад к урокам
            </button>
            <h1>{lesson.title}</h1>
          </div>
          
          <div className="lesson-detail-content">
            <div className="no-exercises">
              <h2>📝 Упражнения отсутствуют</h2>
              <p>В этом уроке пока нет упражнений.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/lessons')}
              >
                Вернуться к урокам
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentExercise = lesson.exercises[currentExerciseIndex];
  const progressPercentage = getProgressPercentage();

  return (
    <div className="lesson-detail-page">
      <div className="lesson-detail-container">
        {/* Header */}
        <div className="lesson-detail-header">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/lessons')}
          >
            ← Вернуться к урокам
          </button>
          
          <div className="lesson-info">
            <h1>{lesson.title}</h1>
            <p className="lesson-description">{lesson.description}</p>
            <div className="lesson-meta">
              <span className="instrument">{lesson.instrument}</span>
              <span className="exercises-count">
                {lesson.exercises.length} упражнений
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="lesson-progress">
          <div className="progress-header">
            <span>Прогресс урока</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress-bar-large">
            <div 
              className="progress-fill-large"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-stats">
            <span>Выполнено: {completedExercises.size}/{lesson.exercises.length}</span>
          </div>
        </div>

        {/* Exercise Content */}
        <div className="exercise-content">
          {!showPitchTrainer ? (
            <div className="exercise-intro">
              <div className="exercise-card">
                <div className="exercise-header">
                  <span className="exercise-number">
                    Упражнение {currentExerciseIndex + 1} из {lesson.exercises.length}
                  </span>
                  {completedExercises.has(currentExercise.id) && (
                    <span className="completed-badge">✓ Выполнено</span>
                  )}
                </div>
                
                <h2 className="exercise-title">{currentExercise.title}</h2>
                
                <div className="exercise-instruction">
                  <div className="instruction-card">
                    <div className="instruction-icon">
                      {currentExercise.type === "chord" ? "🎸" : "🎹"}
                    </div>
                    <div className="instruction-text">
                      <h3>Ваша задача:</h3>
                      <p>Сыграйте <strong>{currentExercise.expected}</strong></p>
                      <p className="instruction-hint">
                        {currentExercise.type === "chord" 
                          ? "Нажмите кнопку ниже и сыграйте аккорд на гитаре"
                          : "Нажмите кнопку ниже и сыграйте ноту на пианино"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="exercise-actions">
                  <button 
                    className="btn btn-primary btn-large"
                    onClick={startExercise}
                    disabled={completedExercises.has(currentExercise.id)}
                  >
                    {completedExercises.has(currentExercise.id) 
                      ? "Упражнение выполнено" 
                      : "Начать упражнение"
                    }
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="pitch-trainer-container">
              <PitchTrainer
                expected={currentExercise.expected}
                type={currentExercise.type}
                onSuccess={() => handleExerciseComplete(currentExercise.id)}
                onCancel={() => setShowPitchTrainer(false)}
              />
            </div>
          )}
        </div>

        {/* Exercise Navigation */}
        {lesson.exercises.length > 1 && (
          <div className="exercise-navigation">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
              disabled={currentExerciseIndex === 0}
            >
              ← Предыдущее
            </button>
            
            <div className="exercise-indicators">
              {lesson.exercises.map((_, index) => (
                <button
                  key={index}
                  className={`exercise-indicator ${
                    index === currentExerciseIndex ? 'active' : ''
                  } ${
                    completedExercises.has(lesson.exercises[index].id) ? 'completed' : ''
                  }`}
                  onClick={() => setCurrentExerciseIndex(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentExerciseIndex(prev => 
                Math.min(lesson.exercises.length - 1, prev + 1)
              )}
              disabled={currentExerciseIndex === lesson.exercises.length - 1}
            >
              Следующее →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
