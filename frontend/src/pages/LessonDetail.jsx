import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLesson, updateProgress } from "../api";
import ChordDetector from "./ChordDetector";
import PitchTrainerPitchy from "./PitchTrainerPitchy";
import ProgressCircle from "../components/ProgressCircle";
import "../lessons-styles.css";

// Компонент для отображения схемы аккорда
const ChordDiagram = ({ chord }) => {
  // Проверяем, что chord существует
  if (!chord) {
    return (
      <div className="chord-diagram">
        <h4>Аккорд не указан</h4>
        <p>Информация об аккорде недоступна</p>
      </div>
    );
  }

  const chordDiagrams = {
    'Am': {
      name: 'Am',
      fingering: [0, 0, 2, 2, 1, 0],
      frets: [0, 0, 2, 2, 1, 0]
    },
    'C': {
      name: 'C',
      fingering: [0, 1, 0, 2, 1, 0],
      frets: [0, 1, 0, 2, 1, 0]
    },
    'Dm': {
      name: 'Dm',
      fingering: [1, 3, 2, 0, 0, 0],
      frets: [1, 3, 2, 0, 0, 0]
    },
    'E': {
      name: 'E',
      fingering: [0, 2, 2, 1, 0, 0],
      frets: [0, 2, 2, 1, 0, 0]
    },
    'F': {
      name: 'F',
      fingering: [1, 3, 3, 2, 1, 1],
      frets: [1, 3, 3, 2, 1, 1]
    },
    'G': {
      name: 'G',
      fingering: [3, 2, 0, 0, 3, 3],
      frets: [3, 2, 0, 0, 3, 3]
    }
  };

  const diagram = chordDiagrams[chord.toString()];
  if (!diagram) {
    return (
      <div className="chord-diagram">
        <h4>Аккорд {chord}</h4>
        <p>Схема аккорда {chord} пока недоступна</p>
      </div>
    );
  }

  return (
    <div className="chord-diagram">
      <h4>Схема аккорда {chord}</h4>
      <div className="guitar-fretboard">
        {/* Струны */}
        <div className="strings">
          {[0, 1, 2, 3, 4, 5].map(string => (
            <div key={string} className="string">
              {/* Лады */}
              {[0, 1, 2, 3, 4].map(fret => (
                <div key={fret} className={`fret ${diagram.frets[string] === fret ? 'active' : ''}`}>
                  {diagram.frets[string] === fret && (
                    <div className="finger-dot">
                      {diagram.fingering[string] || '•'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Номера струн */}
        <div className="string-labels">
          {['E', 'A', 'D', 'G', 'B', 'E'].map((note, i) => (
            <div key={i} className="string-label">{note}</div>
          ))}
        </div>
      </div>
      <p className="chord-instruction">
        Зажмите струны как показано на схеме и сыграйте аккорд
      </p>
    </div>
  );
};

// Компонент для отображения ноты на пианино
const PianoNote = ({ note }) => {
  // Проверяем, что note существует
  if (!note) {
    return (
      <div className="piano-note">
        <h4>Нота не указана</h4>
        <p>Информация о ноте недоступна</p>
      </div>
    );
  }

  const notePositions = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
    'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };

  // Безопасное извлечение ноты и октавы
  const noteWithoutOctave = note.toString().replace(/\d+/, '');
  const position = notePositions[noteWithoutOctave] || 0;
  const octave = parseInt(note.toString().replace(/[A-G#b]/, '')) || 4;

  return (
    <div className="piano-note">
      <h4>Нота {note}</h4>
      <div className="piano-keyboard">
        <div className="white-keys">
          {[0, 2, 4, 5, 7, 9, 11].map(key => (
            <div 
              key={key} 
              className={`white-key ${key === position ? 'highlighted' : ''}`}
            >
              {key === position && <div className="note-indicator">{note}</div>}
            </div>
          ))}
        </div>
        <div className="black-keys">
          {[1, 3, 6, 8, 10].map(key => (
            <div 
              key={key} 
              className={`black-key ${key === position ? 'highlighted' : ''}`}
            >
              {key === position && <div className="note-indicator">{note}</div>}
            </div>
          ))}
        </div>
      </div>
      <p className="note-instruction">
        Нажмите клавишу {note} на пианино
      </p>
    </div>
  );
};

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  // Определяем currentExercise сразу после загрузки урока
  const currentExercise = lesson?.exercises?.[currentExerciseIndex];

  useEffect(() => {
    loadLesson();
  }, [id]);

  // Принудительно запускаем тюнер при активации упражнения
  useEffect(() => {
    if (isExerciseActive && lesson?.exercises?.[currentExerciseIndex]) {
      const exercise = lesson.exercises[currentExerciseIndex];
      const expected = exercise.Expected || exercise.expected;
      console.log("Exercise activated, starting tuner for:", expected);
      // Небольшая задержка для инициализации
      setTimeout(() => {
        console.log("Tuner should be running now");
      }, 500);
    }
  }, [isExerciseActive, lesson, currentExerciseIndex]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const lessonData = await getLesson(id);
      console.log("Loaded lesson data:", lessonData);
      console.log("Lesson keys:", Object.keys(lessonData));
      console.log("Lesson instrument (lowercase):", lessonData.instrument);
      console.log("Lesson Instrument (uppercase):", lessonData.Instrument);
      console.log("Lesson type (lowercase):", lessonData.type);
      console.log("Lesson Type (uppercase):", lessonData.Type);
      console.log("First exercise:", lessonData.exercises?.[0]);
      setLesson(lessonData);
    } catch (err) {
      console.error("Error loading lesson:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseComplete = async (exerciseId) => {
    if (!processingRef.current) {
      console.log("handleExerciseComplete blocked - not processing");
      return;
    }
    
    try {
      console.log("Saving progress for exercise ID:", exerciseId);
      await updateProgress(exerciseId, "done");
      setCompletedExercises(prev => new Set([...prev, exerciseId]));
      
      // Показываем сообщение об успехе
      setShowSuccessMessage(true);
      setIsExerciseActive(false);
      
      // Через 2 секунды переходим к следующему упражнению
      setTimeout(() => {
        setShowSuccessMessage(false);
        setIsCorrectAnswer(false);
        processingRef.current = false;
        
        if (currentExerciseIndex < lesson.exercises.length - 1) {
          setCurrentExerciseIndex(prev => prev + 1);
        } else {
          // Урок завершен
          alert("🎉 Поздравляем! Урок завершен!");
        }
      }, 2000);
      
    } catch (err) {
      console.error("Error updating progress:", err);
      alert("Ошибка при сохранении прогресса");
      processingRef.current = false;
    }
  };

  const startExercise = () => {
    setIsExerciseActive(true);
    setIsCorrectAnswer(false);
    const exercise = lesson?.exercises?.[currentExerciseIndex];
    console.log("Starting exercise:", exercise);
    console.log("Exercise keys:", exercise ? Object.keys(exercise) : "no exercise");
    console.log("Exercise data - expected:", exercise?.Expected || exercise?.expected, "type:", exercise?.Type || exercise?.type);
  };

  const handleCorrectAnswer = () => {
    if (isCorrectAnswer || processingRef.current) {
      console.log("handleCorrectAnswer blocked - already processing or correct");
      return; // Предотвращаем дублирование
    }
    console.log("handleCorrectAnswer called - setting states");
    processingRef.current = true;
    setIsCorrectAnswer(true);
    setIsProcessing(true);
    
    // Автоматически завершаем упражнение через небольшую задержку
    setTimeout(() => {
      const exercise = lesson?.exercises?.[currentExerciseIndex];
      console.log("Current exercise for progress:", exercise);
      if (exercise?.ID || exercise?.id) {
        const exerciseId = exercise.ID || exercise.id;
        console.log("Calling handleExerciseComplete with ID:", exerciseId);
        handleExerciseComplete(exerciseId);
      } else {
        console.error("No exercise ID found:", exercise);
      }
    }, 1500);
  };

  const stopExercise = () => {
    setIsExerciseActive(false);
    setIsCorrectAnswer(false);
    setIsProcessing(false);
    processingRef.current = false;
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
          {showSuccessMessage ? (
            <div className="success-message">
              <div className="success-card">
                <div className="success-icon">🎉</div>
                <h2>Отлично!</h2>
                <p>Вы правильно сыграли <strong>{currentExercise.Expected || currentExercise.expected}</strong>!</p>
                <div className="success-animation">
                  <div className="confetti"></div>
                  <div className="confetti"></div>
                  <div className="confetti"></div>
                </div>
              </div>
            </div>
          ) : !currentExercise ? (
            <div className="exercise-intro">
              <div className="exercise-card">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Загрузка упражнения...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="exercise-intro">
              <div className="exercise-card">
                <div className="exercise-header">
                  <span className="exercise-number">
                    Упражнение {currentExerciseIndex + 1} из {lesson.exercises.length}
                  </span>
                   {(currentExercise?.ID || currentExercise?.id) && completedExercises.has(currentExercise.ID || currentExercise.id) && (
                     <span className="completed-badge">✓ Выполнено</span>
                   )}
                </div>
                
                 <h2 className="exercise-title">{(currentExercise?.Title || currentExercise?.title) || 'Загрузка...'}</h2>
                
                <div className="exercise-instruction">
                  <div className="instruction-card">
                     <div className="instruction-icon">
                       {(currentExercise?.Type || currentExercise?.type) === "chord" ? "🎸" : "🎹"}
                     </div>
                     <div className="instruction-text">
                       <h3>Ваша задача:</h3>
                       <p>Сыграйте <strong>{(currentExercise?.Expected || currentExercise?.expected) || 'НЕ УКАЗАНО'}</strong></p>
                       <p className="instruction-hint">
                         {(currentExercise?.Type || currentExercise?.type) === "chord" 
                           ? "Нажмите кнопку ниже и сыграйте аккорд на гитаре"
                           : "Нажмите кнопку ниже и сыграйте ноту на пианино"
                         }
                       </p>
                       {/* Отладочная информация */}
                       <div style={{fontSize: '10px', color: '#999', marginTop: '10px'}}>
                         DEBUG: type={currentExercise?.Type || currentExercise?.type}, expected={currentExercise?.Expected || currentExercise?.expected}
                       </div>
                     </div>
                  </div>
                </div>

                {/* Визуальный учебный материал */}
                {currentExercise && (currentExercise.Expected || currentExercise.expected) && (
                  <div className="visual-material">
                    {(currentExercise.Type || currentExercise.type) === "chord" ? (
                      <ChordDiagram chord={currentExercise.Expected || currentExercise.expected} />
                    ) : (
                      <PianoNote note={currentExercise.Expected || currentExercise.expected} />
                    )}
                  </div>
                )}

                <div className="exercise-actions">
                  {!isExerciseActive ? (
                     <button 
                       className="btn btn-primary btn-large"
                       onClick={startExercise}
                       disabled={(currentExercise?.ID || currentExercise?.id) && completedExercises.has(currentExercise.ID || currentExercise.id)}
                     >
                       {(currentExercise?.ID || currentExercise?.id) && completedExercises.has(currentExercise.ID || currentExercise.id)
                         ? "Упражнение выполнено" 
                         : "Начать упражнение"
                       }
                     </button>
                   ) : (
                     <div className="exercise-active">
                       <div className="progress-circle-wrapper">
                         <ProgressCircle 
                           isCorrect={isCorrectAnswer} 
                           size={150}
                         />
                       </div>
                       
                       <div className="exercise-instruction-active">
                         <h3>🎯 Ваша задача:</h3>
                         <p className="task-text">
                           Сыграйте <strong style={{color: '#FF5722', fontSize: '1.2em'}}>{currentExercise?.Expected || currentExercise?.expected}</strong>
                         </p>
                         <p className="instruction-hint">
                           {(() => {
                             const exerciseType = currentExercise?.Type || currentExercise?.type;
                             const instrument = lesson.Instrument || lesson.instrument || lesson.Type || lesson.type; // Проверяем все возможные варианты
                             
                             if (instrument === 'guitar') {
                               return "🎸 Сыграйте аккорд на гитаре";
                             } else if (instrument === 'piano' && exerciseType === 'chord') {
                               return "🎹 Сыграйте аккорд на пианино";
                             } else if (instrument === 'piano' && exerciseType === 'note') {
                               return "🎹 Сыграйте ноту на пианино";
                             } else if (exerciseType === 'chord') {
                               return "🎵 Сыграйте аккорд";
                             } else if (exerciseType === 'note') {
                               return "🎵 Сыграйте ноту";
                             } else {
                               return "🎵 Сыграйте на инструменте";
                             }
                           })()}
                         </p>
                       </div>
                       
                       <button 
                         className="btn btn-secondary"
                         onClick={stopExercise}
                       >
                         Остановить
                       </button>
                       
                       {/* Фоновый детектор - выбираем в зависимости от инструмента и типа упражнения */}
                       {(() => {
                         const exerciseType = currentExercise?.Type || currentExercise?.type;
                         const instrument = lesson.Instrument || lesson.instrument || lesson.Type || lesson.type; // Проверяем все возможные варианты
                         
                         // Логика выбора детектора:
                         // 1. Гитара - всегда ChordDetector (аккорды)
                         // 2. Пианино + аккорды - ChordDetector  
                         // 3. Пианино + ноты - PitchTrainerPitchy
                         
                         console.log(`🎯 Выбор детектора: инструмент=${instrument}, тип=${exerciseType}, lesson.Instrument=${lesson.Instrument}, lesson.Type=${lesson.Type}`);
                         
                         // Улучшенная логика выбора детектора
                         if (exerciseType === 'chord') {
                           console.log('🎸 Используем ChordDetector для аккордов');
                           return (
                             <ChordDetector
                               expected={currentExercise?.Expected || currentExercise?.expected}
                               type={exerciseType}
                               onSuccess={handleCorrectAnswer}
                               onCancel={stopExercise}
                               hidden={true}
                             />
                           );
                         } else if (exerciseType === 'note') {
                           console.log('🎹 Используем PitchTrainerPitchy для нот');
                           return (
                             <PitchTrainerPitchy
                               expected={currentExercise?.Expected || currentExercise?.expected}
                               type={exerciseType}
                               onSuccess={handleCorrectAnswer}
                               onCancel={stopExercise}
                               hidden={true}
                             />
                           );
                         } else if (instrument === 'guitar') {
                           console.log('🎸 Используем ChordDetector для гитары (по умолчанию)');
                           return (
                             <ChordDetector
                               expected={currentExercise?.Expected || currentExercise?.expected}
                               type={exerciseType}
                               onSuccess={handleCorrectAnswer}
                               onCancel={stopExercise}
                               hidden={true}
                             />
                           );
                         } else {
                           console.log('🔄 Fallback: используем ChordDetector по умолчанию');
                           // Fallback - по умолчанию ChordDetector
                           return (
                             <ChordDetector
                               expected={currentExercise?.Expected || currentExercise?.expected}
                               type={exerciseType}
                               onSuccess={handleCorrectAnswer}
                               onCancel={stopExercise}
                               hidden={true}
                             />
                           );
                         }
                       })()}
                     </div>
                   )}
                </div>
              </div>
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
