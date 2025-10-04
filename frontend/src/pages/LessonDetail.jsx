import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLesson, updateProgress } from "../api";
import ChordDetector from "./ChordDetector";
import PitchTrainerPitchy from "./PitchTrainerPitchy";
import ProgressCircle from "../components/ProgressCircle";
import PianoVisualizer from "../components/PianoVisualizer";
import GuitarVisualizer from "../components/GuitarVisualizer";
import audioPlayer from "../utils/audioPlayer";
import SongDisplay from "../components/SongDisplay";
import "../lessons-styles.css";

// Функции для работы с песнями
const getSongTitle = (exerciseTitle) => {
  if (exerciseTitle.includes('Happy Birthday')) return 'Happy Birthday';
  if (exerciseTitle.includes('До-ре-ми')) return 'До-ре-ми';
  if (exerciseTitle.includes('Twinkle Twinkle')) return 'Twinkle Twinkle Little Star';
  if (exerciseTitle.includes('Гамма C мажор')) return 'Гамма C мажор';
  return 'Неизвестная песня';
};

const getSongSequence = (exerciseTitle, expectedValue) => {
  // Последовательности для известных песен
  if (exerciseTitle.includes('Happy Birthday')) {
    return ['Am', 'C', 'G', 'F', 'Am', 'C', 'G', 'F'];
  }
  if (exerciseTitle.includes('До-ре-ми')) {
    return ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  }
  if (exerciseTitle.includes('Twinkle Twinkle')) {
    return ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'];
  }
  if (exerciseTitle.includes('Гамма C мажор')) {
    return ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  }
  
  // Если это не известная песня, возвращаем только ожидаемое значение
  return [expectedValue];
};

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
  // const octave = parseInt(note.toString().replace(/[A-G#b]/, '')) || 4;

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
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const loadedLessonIdRef = useRef(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [_isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const previousExerciseIndexRef = useRef(null);

  // Определяем currentExercise сразу после загрузки урока
  const currentExercise = lesson?.exercises?.[currentExerciseIndex];
  

  // Функция для рендеринга визуализатора
  const renderVisualizer = () => {
    if (!currentExercise || !(currentExercise.Expected || currentExercise.expected)) {
      return null;
    }

    const exerciseType = currentExercise?.Type || currentExercise?.type;
    const instrument = lesson.Instrument || lesson.instrument || lesson.Type || lesson.type;
    const expectedValue = currentExercise.Expected || currentExercise.expected;
    
    // Проверяем, является ли это упражнением с песней
    const isSongExercise = currentExercise.Title?.includes('Песня') || 
                         currentExercise.Title?.includes('Мелодия') ||
                         currentExercise.Title?.includes('Гамма');
    
    // Возвращаем соответствующий компонент
    if (isSongExercise) {
      const songSequence = getSongSequence(currentExercise.Title, expectedValue);
      return (
        <SongDisplay 
          key={`song-${lesson.ID}-${currentExercise.ID}`}
          songTitle={getSongTitle(currentExercise.Title)}
          chordSequence={songSequence}
          autoPlay={true}
          instrument={instrument}
          onChordPlay={() => {}}
        />
      );
    } else if (exerciseType === "chord") {
      if (instrument === "piano") {
        return (
          <PianoVisualizer 
            key={`piano-chord-${lesson.ID}-${currentExercise.ID}`}
            chordName={expectedValue}
            autoPlay={true}
            autoPlayDelay={2000}
            size="medium"
            showPlayButton={false}
            onPlay={() => {}}
          />
        );
      } else {
        return (
          <GuitarVisualizer 
            key={`guitar-chord-${lesson.ID}-${currentExercise.ID}`}
            chordName={expectedValue}
            autoPlay={true}
            autoPlayDelay={2000}
            size="medium"
            onPlay={() => {}}
          />
        );
      }
    } else if (exerciseType === "note") {
      return (
        <PianoVisualizer 
          key={`piano-note-${lesson.ID}-${currentExercise.ID}`}
          noteName={expectedValue}
          autoPlay={true}
          autoPlayDelay={2000}
          size="medium"
            onPlay={() => {}}
        />
      );
    } else if (instrument === "guitar") {
      return (
        <GuitarVisualizer 
          key={`guitar-fallback-${lesson.ID}-${currentExercise.ID}`}
          chordName={expectedValue}
          autoPlay={true}
          autoPlayDelay={2000}
          size="medium"
          onPlay={() => {}}
        />
      );
    } else if (instrument === "piano") {
      return (
        <PianoVisualizer 
          key={`piano-fallback-${lesson.ID}-${currentExercise.ID}`}
          noteName={expectedValue}
          autoPlay={true}
          autoPlayDelay={2000}
          size="medium"
            onPlay={() => {}}
        />
      );
    } else {
      // Fallback на старые компоненты
      return (currentExercise.Type || currentExercise.type) === "chord" ? (
        <ChordDiagram chord={expectedValue} />
      ) : (
        <PianoNote note={expectedValue} />
      );
    }
  };

  const loadLesson = useCallback(async () => {
    const lessonId = parseInt(id);
    
    // Синхронная защита от повторных вызовов loadLesson
    if (loadedLessonIdRef.current === lessonId) {
      return;
    }
    
    // Синхронная защита - устанавливаем флаг сразу
    if (isLoadingLesson) {
      return;
    }
    
    // Устанавливаем флаг загрузки СРАЗУ, чтобы заблокировать повторные вызовы
    setIsLoadingLesson(true);
    loadedLessonIdRef.current = lessonId;
    
    try {
      setLoading(true);
      const lessonData = await getLesson(id);
      setLesson(lessonData);
    } catch (err) {
      console.error("Error loading lesson:", err);
      setError(err.message);
    } finally {
      setIsLoadingLesson(false);
      setLoading(false);
    }
  }, [id, isLoadingLesson]);

  useEffect(() => {
    const lessonId = parseInt(id);
    // Загружаем урок только если он еще не загружен или ID изменился, и не загружается уже
    if (loadedLessonIdRef.current !== lessonId && !isLoadingLesson) {
      loadLesson();
    }
  }, [id, isLoadingLesson, loadLesson]); // Добавляем isLoadingLesson в зависимости

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

  // Останавливаем звук при изменении упражнения (только при реальном переходе)
  useEffect(() => {
    // Проверяем, что это не первоначальная загрузка
    if (previousExerciseIndexRef.current !== null && previousExerciseIndexRef.current !== currentExerciseIndex) {
      audioPlayer.stopAll();
    }
    // Обновляем предыдущий индекс
    previousExerciseIndexRef.current = currentExerciseIndex;
  }, [currentExerciseIndex]);

  const handleExerciseComplete = async (exerciseId) => {
    if (!processingRef.current) {
      return;
    }
    
    try {
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
      if (exercise?.ID || exercise?.id) {
        const exerciseId = exercise.ID || exercise.id;
        handleExerciseComplete(exerciseId);
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
                <div className="visual-material">
                  {renderVisualizer()}
                </div>

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
