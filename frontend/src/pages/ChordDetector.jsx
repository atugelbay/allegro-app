import { useRef, useState, useEffect, useCallback } from "react";

// ===== База нот для детекции аккордов =====
const NOTES = [
  { note: "C2", freq: 65.41 }, { note: "C#2/Db2", freq: 69.30 }, { note: "D2", freq: 73.42 },
  { note: "D#2/Eb2", freq: 77.78 }, { note: "E2", freq: 82.41 }, { note: "F2", freq: 87.31 },
  { note: "F#2/Gb2", freq: 92.50 }, { note: "G2", freq: 98.00 }, { note: "G#2/Ab2", freq: 103.83 },
  { note: "A2", freq: 110.00 }, { note: "A#2/Bb2", freq: 116.54 }, { note: "B2", freq: 123.47 },

  { note: "C3", freq: 130.81 }, { note: "C#3/Db3", freq: 138.59 }, { note: "D3", freq: 146.83 },
  { note: "D#3/Eb3", freq: 155.56 }, { note: "E3", freq: 164.81 }, { note: "F3", freq: 174.61 },
  { note: "F#3/Gb3", freq: 185.00 }, { note: "G3", freq: 196.00 }, { note: "G#3/Ab3", freq: 207.65 },
  { note: "A3", freq: 220.00 }, { note: "A#3/Bb3", freq: 233.08 }, { note: "B3", freq: 246.94 },

  { note: "C4 (Middle C)", freq: 261.63 }, { note: "C#4/Db4", freq: 277.18 }, { note: "D4", freq: 293.66 },
  { note: "D#4/Eb4", freq: 311.13 }, { note: "E4", freq: 329.63 }, { note: "F4", freq: 349.23 },
  { note: "F#4/Gb4", freq: 369.99 }, { note: "G4", freq: 392.00 }, { note: "G#4/Ab4", freq: 415.30 },
  { note: "A4 (Concert Pitch)", freq: 440.00 }, { note: "A#4/Bb4", freq: 466.16 }, { note: "B4", freq: 493.88 },

  { note: "C5", freq: 523.25 }, { note: "C#5/Db5", freq: 554.37 }, { note: "D5", freq: 587.33 },
  { note: "D#5/Eb5", freq: 622.25 }, { note: "E5", freq: 659.25 }, { note: "F5", freq: 698.46 },
  { note: "F#5/Gb5", freq: 739.99 }, { note: "G5", freq: 783.99 }, { note: "G#5/Ab5", freq: 830.61 },
  { note: "A5", freq: 880.00 }, { note: "A#5/Bb5", freq: 932.33 }, { note: "B5", freq: 987.77 },
];

// ===== База данных аккордов =====
const CHORDS = {
  // Мажорные аккорды
  C: ["C", "E", "G"],       // C Major
  D: ["D", "F#", "A"],      // D Major
  E: ["E", "G#", "B"],      // E Major
  F: ["F", "A", "C"],       // F Major
  G: ["G", "B", "D"],       // G Major
  A: ["A", "C#", "E"],      // A Major
  B: ["B", "D#", "F#"],     // B Major
  
  // Минорные аккорды
  Cm: ["C", "D#", "G"],     // C minor
  Dm: ["D", "F", "A"],      // D minor
  Em: ["E", "G", "B"],      // E minor
  Fm: ["F", "G#", "C"],     // F minor
  Gm: ["G", "A#", "D"],     // G minor
  Am: ["A", "C", "E"],      // A minor
  Bm: ["B", "D", "F#"],     // B minor
  
  // Диезные мажорные аккорды
  "C#": ["C#", "F", "G#"],    // C# Major
  "D#": ["D#", "G", "A#"],    // D# Major
  "F#": ["F#", "A#", "C#"],   // F# Major
  "G#": ["G#", "C", "D#"],    // G# Major
  "A#": ["A#", "D", "F"],     // A# Major
  
  // Диезные минорные аккорды
  "C#m": ["C#", "E", "G#"],   // C# minor
  "D#m": ["D#", "F#", "A#"],  // D# minor
  "F#m": ["F#", "A", "C#"],   // F# minor
  "G#m": ["G#", "B", "D#"],   // G# minor
  "A#m": ["A#", "C#", "F"],   // A# minor
};

// ===== Утилиты для детекции аккордов =====
function findClosestNote(freq) {
  let closest = NOTES[0], diff = Math.abs(freq - closest.freq);
  for (const n of NOTES) {
    const d = Math.abs(freq - n.freq);
    if (d < diff) { closest = n; diff = d; }
  }
  return closest;
}

function normalizePitchClass(label) {
  // "C#4/Db4" -> "C#" ; "A#4/Bb4" -> "A#" ; "C4 (Middle C)" -> "C"
  let core = label.split(" ")[0];        // убираем " (Middle C)"
  core = core.split("/")[0];             // берём первый вариант до '/'
  core = core.replace(/[0-9]/g, "");     // убираем цифры октавы
  // приводим бемоли к диезам
  return core
    .replace("Db", "C#")
    .replace("Eb", "D#")
    .replace("Gb", "F#")
    .replace("Ab", "G#")
    .replace("Bb", "A#");
}

// ===== Подавление гармоник =====
function suppressHarmonics(peaks) {
  const sorted = [...peaks].sort((a, b) => b.amp - a.amp);
  const fundamental = [];
  
  for (const peak of sorted) {
    let isHarmonic = false;
    
    for (const fund of fundamental) {
      const ratio = peak.freq / fund.freq;
      
      if (Math.abs(ratio - Math.round(ratio)) < 0.12 && Math.round(ratio) >= 2 && Math.round(ratio) <= 8) {
        if (peak.amp > fund.amp * 1.5) {
          continue;
        }
        
        if (Math.round(ratio) <= 3 && Math.abs(ratio - Math.round(ratio)) < 0.08) {
          isHarmonic = true;
          break;
        } else if (Math.round(ratio) > 3 && Math.abs(ratio - Math.round(ratio)) < 0.12) {
          isHarmonic = true;
          break;
        }
      }
    }
    
    if (!isHarmonic) {
      fundamental.push(peak);
    }
  }
  
  return fundamental.sort((a, b) => b.amp - a.amp).slice(0, 12);
}

// ===== Простая детекция аккордов =====
function detectChord(freqBuf, sampleRate) {
  const peaks = [];
  
  // Находим пики в спектре
  for (let i = 5; i < freqBuf.length - 5; i++) {
    const currentAmp = freqBuf[i];
    
    const isPeak = currentAmp > freqBuf[i-1] && currentAmp > freqBuf[i+1] && 
                   currentAmp > freqBuf[i-2] && currentAmp > freqBuf[i+2];
    
    if (isPeak && currentAmp > -70) {
      const freq = (i * sampleRate) / (freqBuf.length * 2);
      if (freq > 80 && freq < 1200) {
        peaks.push({ 
          freq, 
          amp: currentAmp
        });
      }
    }
  }

  // Сортируем по амплитуде
  peaks.sort((a, b) => b.amp - a.amp);
  
  // Подавляем гармоники
  const fundamentalPeaks = suppressHarmonics(peaks);
  
  // Преобразуем в ноты
  const notes = fundamentalPeaks.map(p => ({
    note: normalizePitchClass(findClosestNote(p.freq).note),
    amp: p.amp,
    freq: p.freq
  }));

  const noteNames = [...new Set(notes.map(n => n.note))];

  // Ищем аккорды
  let bestChord = null;
  let bestScore = 0;

  for (const [chord, requiredNotes] of Object.entries(CHORDS)) {
    const matches = requiredNotes.filter(n => noteNames.includes(n));
    
    if (matches.length >= 2) {
      let score = matches.length * 100;
      
      // Бонус за силу сигнала
      const amplitudeBonus = notes
        .filter(n => matches.includes(n.note))
        .reduce((sum, n) => sum + Math.abs(n.amp) * 2, 0);
      
      const totalScore = score + amplitudeBonus;
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestChord = chord;
      }
    }
  }

  if (bestChord && bestScore > 100) {
    const confidence = Math.min(95, 50 + Math.round((bestScore - 100) / 5));
    
    return {
      name: bestChord,
      confidence: confidence,
      notes: noteNames
    };
  }

  return null;
}

export default function ChordDetector({ expected, onSuccess, onCancel, hidden = false }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [detectedNotes, setDetectedNotes] = useState([]);
  const [chordConfidence, setChordConfidence] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lockedChord, setLockedChord] = useState(null);
  const [lockTimestamp, setLockTimestamp] = useState(0);
  
  // Буфер для стабилизации результатов
  const chordBufferRef = useRef([]);
  const lastChordTimeRef = useRef(0);
  const lockReleaseTimerRef = useRef(null);

  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  // Функция для стабилизации результатов через буфер
  const stabilizeChordResult = (chordResult) => {
    if (!chordResult) return null;
    
    const now = Date.now();
    const buffer = chordBufferRef.current;
    
    // Добавляем результат в буфер
    buffer.push({
      chord: chordResult.name,
      confidence: chordResult.confidence,
      notes: chordResult.notes,
      timestamp: now
    });
    
    // Ограничиваем буфер последними 15 результатами
    if (buffer.length > 15) {
      buffer.shift();
    }
    
    // Фильтруем только результаты за последние 1 секунду (быстрее реакция)
    const recentResults = buffer.filter(item => now - item.timestamp < 1000);
    
    // Упрощенная логика: если есть хотя бы 2 одинаковых результата - закрепляем
    if (recentResults.length < 2) {
      return null; // Недостаточно данных для стабилизации
    }
    
    // Подсчитываем частоту каждого аккорда
    const chordCounts = {};
    const chordConfidences = {};
    const chordNotes = {};
    
    for (const result of recentResults) {
      const chordName = result.chord;
      if (!chordCounts[chordName]) {
        chordCounts[chordName] = 0;
        chordConfidences[chordName] = 0;
        chordNotes[chordName] = result.notes;
      }
      chordCounts[chordName]++;
      chordConfidences[chordName] += result.confidence;
    }
    
    // Находим аккорд с максимальной частотой
    let bestChord = null;
    let maxCount = 0;
    let bestConfidence = 0;
    
    for (const [chordName, count] of Object.entries(chordCounts)) {
      if (count > maxCount) {
        maxCount = count;
        bestChord = chordName;
        bestConfidence = chordConfidences[chordName] / count; // Средняя уверенность
      }
    }
    
    // Более мягкий порог: если аккорд встречается в >= 50% случаев ИЛИ минимум 2 раза
    const threshold = Math.max(2, Math.ceil(recentResults.length * 0.5));
    
    if (maxCount >= threshold && bestChord) {
      console.log(`🎯 Стабилизация: ${bestChord} встречается ${maxCount}/${recentResults.length} раз (${(maxCount/recentResults.length*100).toFixed(1)}%)`);
      
      return {
        name: bestChord,
        confidence: Math.round(bestConfidence),
        notes: chordNotes[bestChord],
        stability: Math.round(maxCount / recentResults.length * 100)
      };
    }
    
    return null;
  };

  // Проверяем соответствие результата expected значению
  useEffect(() => {
    if (!expected || !result) {
      setIsCorrect(false);
      return;
    }

    // Для аккордов извлекаем название из результата
    const chordMatch = result.match(/[A-G][#b]?m?/);
    if (chordMatch) {
      const detected = chordMatch[0];
      const correct = detected === expected;
      setIsCorrect(correct);

      // Если ответ правильный, вызываем onSuccess через небольшую задержку
      if (correct && onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    }
  }, [result, expected, onSuccess]);

  const startDetection = useCallback(async () => {
    try {
      setError(null);
      
      // Проверяем, не закрыт ли уже существующий контекст
      if (audioCtxRef.current && audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = null;
      }
      
      // Создаем новый контекст только если его нет или он закрыт
      if (!audioCtxRef.current) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;
      }
      
      const audioCtx = audioCtxRef.current;
      
      // Проверяем состояние контекста
      if (audioCtx.state === 'closed') {
        throw new Error('AudioContext is closed');
      }
      
      await audioCtx.resume();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      streamRef.current = stream;
      
      // Проверяем состояние контекста перед созданием узлов
      if (audioCtx.state === 'closed') {
        throw new Error('AudioContext was closed during initialization');
      }
      
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.3;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      source.connect(analyser);

      const timeBuf = new Float32Array(analyser.fftSize);
      const freqBuf = new Float32Array(analyser.frequencyBinCount);

      function loop() {
        // Проверяем, не закрыт ли контекст
        if (audioCtx.state === 'closed') {
          console.log('AudioContext закрыт, останавливаем анализ');
          return;
        }
        
        analyser.getFloatTimeDomainData(timeBuf);
        analyser.getFloatFrequencyData(freqBuf);

        // Вычисляем RMS для уровня звука
        let rms = 0;
        for (let i = 0; i < timeBuf.length; i++) {
          rms += timeBuf[i] * timeBuf[i];
        }
        rms = Math.sqrt(rms / timeBuf.length);
        
        // Усиливаем сигнал
        const amplifiedRms = rms * 100;
        setAudioLevel(amplifiedRms);
        
        if (amplifiedRms > 0.5) { // Порог анализа 50%
          // Проверяем, не заблокирован ли аккорд
          const now = Date.now();
          if (lockedChord && (now - lockTimestamp) < 3000) { // Блокировка на 3 секунды
            console.log(`🔒 Аккорд заблокирован: ${lockedChord.name}`);
            setResult(`🔒 Аккорд: ${lockedChord.name} (${lockedChord.confidence}% - заблокирован)`);
            setDetectedNotes(lockedChord.notes);
            setChordConfidence(lockedChord.confidence);
            animationRef.current = requestAnimationFrame(loop);
            return;
          }
          
          console.log('🎵 Анализирую аккорд...');
          const rawChordResult = detectChord(freqBuf, audioCtx.sampleRate);
          
          if (rawChordResult) {
            console.log(`🔍 Сырой результат: ${rawChordResult.name} (${rawChordResult.confidence}%)`);
            
            // Стабилизируем результат через буфер
            const stabilizedResult = stabilizeChordResult(rawChordResult);
            
            if (stabilizedResult) {
              console.log(`✅ Стабилизированный аккорд: ${stabilizedResult.name} (${stabilizedResult.confidence}%, стабильность: ${stabilizedResult.stability}%)`);
              
              // Блокируем аккорд на 3 секунды
              setLockedChord(stabilizedResult);
              setLockTimestamp(now);
              
              // Очищаем таймер разблокировки
              if (lockReleaseTimerRef.current) {
                clearTimeout(lockReleaseTimerRef.current);
              }
              
              // Устанавливаем таймер разблокировки
              lockReleaseTimerRef.current = setTimeout(() => {
                console.log('🔓 Разблокировка аккорда');
                setLockedChord(null);
                setLockTimestamp(0);
                chordBufferRef.current = [];
              }, 3000);
              
              setResult(`🎶 Аккорд: ${stabilizedResult.name} (${stabilizedResult.confidence}%)`);
              setDetectedNotes(stabilizedResult.notes);
              setChordConfidence(stabilizedResult.confidence);
            } else {
              console.log('⏳ Накапливаю данные для стабилизации...');
            }
          } else {
            console.log('❌ Аккорд не обнаружен');
            // Сбрасываем буфер при отсутствии звука
            chordBufferRef.current = [];
            setResult(null);
            setDetectedNotes([]);
            setChordConfidence(0);
          }
        } else {
          // Сбрасываем буфер при тишине
          chordBufferRef.current = [];
          setResult(null);
          setDetectedNotes([]);
          setChordConfidence(0);
        }

        animationRef.current = requestAnimationFrame(loop);
      }

      setRunning(true);
      loop();
      
    } catch (err) {
      console.error("Error starting chord detection:", err);
      setError(`Ошибка: ${err.message}. Убедитесь, что микрофон подключен и разрешен доступ.`);
      setRunning(false);
    }
  }, [running]);

  const stopDetection = useCallback(() => {
    console.log('🛑 Останавливаем ChordDetector');
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Останавливаем поток
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Закрываем контекст только если он не закрыт
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
    
    // Очищаем таймер блокировки
    if (lockReleaseTimerRef.current) {
      clearTimeout(lockReleaseTimerRef.current);
      lockReleaseTimerRef.current = null;
    }
    
    // Очищаем буфер при остановке
    chordBufferRef.current = [];
    
    setRunning(false);
    setResult(null);
    setDetectedNotes([]);
    setChordConfidence(0);
    setLockedChord(null);
    setLockTimestamp(0);
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  // Автоматически запускаем детекцию при монтировании компонента
  useEffect(() => {
    if (hidden && !running) {
      console.log('🎸 ChordDetector: автоматически запускаю детекцию в скрытом режиме');
      // Небольшая задержка для предотвращения конфликтов
      const timer = setTimeout(() => {
        startDetection();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [hidden, running, startDetection]);

  // Если скрытый режим, возвращаем только логику без UI
  if (hidden) {
    return null;
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>🎸 Детектор Аккордов</h2>
        {onCancel && (
          <button 
            onClick={onCancel}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Отмена
          </button>
        )}
      </div>

      {/* Показываем ожидаемое значение */}
      {expected && (
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          backgroundColor: '#e3f2fd', 
          borderRadius: 8,
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>
            Ваша задача: сыграть аккорд <strong>{expected}</strong>
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Сыграйте аккорд на гитаре
          </p>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginBottom: 12, padding: 8, border: '1px solid red', borderRadius: 4 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        {!running ? (
          <button onClick={startDetection} style={{ padding: '8px 16px', fontSize: '16px' }}>
            🎤 Запустить детекцию
          </button>
        ) : (
          <button onClick={stopDetection} style={{ padding: '8px 16px', fontSize: '16px', backgroundColor: '#ff4444', color: 'white' }}>
            ⏹️ Остановить
          </button>
        )}
      </div>

      {running && (
        <div style={{ 
          marginTop: 20, 
          padding: '20px', 
          border: '1px solid #e0e0e0', 
          borderRadius: '16px',
          backgroundColor: '#fafafa',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '600px',
          margin: '20px auto 0'
        }}>
          <h3 style={{ 
            textAlign: 'center', 
            margin: '0 0 24px 0', 
            color: '#333',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            🎸 Детектор Аккордов
          </h3>
          
          {/* Индикатор уровня звука */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ textAlign: 'center', margin: '0 0 12px 0', fontWeight: 'bold' }}>
              Уровень звука: {audioLevel.toFixed(1)}%
            </p>
            <div style={{ 
              width: '100%', 
              height: '12px', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${Math.min(audioLevel, 100)}%`,
                height: '100%', 
                background: audioLevel > 50 ? 
                  'linear-gradient(90deg, #4CAF50, #8BC34A)' : 
                  'linear-gradient(90deg, #FF9800, #FFC107)',
                transition: 'width 0.1s ease-out',
                borderRadius: '6px'
              }}></div>
            </div>
          </div>
          
          {result ? (
            <div>
              {/* Главный результат */}
              <div style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: isCorrect ? '#e8f5e8' : '#f5f5f5',
                borderRadius: '12px',
                border: isCorrect ? '2px solid #4CAF50' : '2px solid #e0e0e0',
                marginBottom: 16
              }}>
                <p style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  margin: 0,
                  color: isCorrect ? '#2e7d32' : '#333'
                }}>
                  {result}
                </p>
                
                {isCorrect && (
                  <div style={{
                    marginTop: 12,
                    padding: '12px 16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>🎉 Правильно!</h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>Отлично! Вы сыграли {expected}!</p>
                  </div>
                )}
              </div>
              
              {/* Найденные ноты */}
              {detectedNotes.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Найденные ноты:</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {detectedNotes.map((note, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#e3f2fd',
                          borderRadius: '4px',
                          fontSize: '14px',
                          color: '#1976d2'
                        }}
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎵</div>
              <p style={{ 
                fontStyle: 'italic', 
                color: '#666',
                margin: 0,
                fontSize: '16px'
              }}>
                Слушаю... Играйте аккорд
              </p>
            </div>
          )}
        </div>
      )}

      {!running && (
        <div style={{ marginTop: 20, fontSize: '14px', color: '#666' }}>
          <p>💡 Советы для улучшенной детекции аккордов:</p>
          <ul>
            <li>Убедитесь, что микрофон подключен и работает</li>
            <li>Разрешите доступ к микрофону в браузере</li>
            <li><strong>Играйте аккорды громко и четко</strong></li>
            <li>Держите гитару близко к микрофону</li>
            <li>Играйте все ноты аккорда одновременно</li>
            <li>Избегайте фоновых шумов</li>
          </ul>
        </div>
      )}
    </div>
  );
}
