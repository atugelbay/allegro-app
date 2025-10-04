import { useRef, useState, useEffect, useCallback } from "react";
import { PitchDetector } from "pitchy";

const PitchTrainerPitchy = ({ expected, onSuccess, hidden = false }) => {
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("guitar"); // guitar, piano, chord
  const [freq, setFreq] = useState(null);
  const [cents, setCents] = useState(null);
  const [result, setResult] = useState(null);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const audioCtxRef = useRef(null);
  const pitchyDetectorRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  // Проверяем соответствие результата expected значению
  useEffect(() => {
    if (!expected || !result) {
      setIsCorrect(false);
      return;
    }

    // Для нот извлекаем название из результата (например, "🎯 C4 (+2.3¢)")
    const noteMatch = result.match(/([A-G][#b]?\d+)/);
    if (noteMatch) {
      const detected = noteMatch[1];
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

  // Функция для исправления гармоник (более точная)
  const correctHarmonics = useCallback((freq) => {
    if (!freq || freq < 80) return freq;
    
    // Только для очень специфических случаев гармоник
    // A4 гармоника (880 Hz) - это точно гармоника
    if (Math.abs(freq - 880) < 30) {
      return 440;
    }
    
    // E5 гармоника (1318.51 Hz) - это точно гармоника E4 (659.25 Hz)
    if (Math.abs(freq - 1318.51) < 30) {
      return 659.25;
    }
    
    // C5 гармоника (1046.5 Hz) - это точно гармоника C4 (523.25 Hz)
    if (Math.abs(freq - 1046.5) < 30) {
      return 523.25;
    }
    
    // G4 гармоника (783.99 Hz) - это точно гармоника G3 (392.00 Hz)
    if (Math.abs(freq - 783.99) < 30) {
      return 392.00;
    }
    
    // Для других случаев - более консервативный подход
    // Только если частота очень высокая И результат деления на 2 дает разумную ноту
    if (freq > 800) {
      const halfFreq = freq / 2;
      // Проверяем, что результат деления попадает в разумный музыкальный диапазон
      if (halfFreq >= 200 && halfFreq <= 600) {
        // Дополнительная проверка: результат должен быть близок к реальной ноте
        const closest = findClosestNote(halfFreq);
        if (closest && Math.abs(closest.cents) < 50) { // Если отклонение меньше 50 центов
          return halfFreq;
        }
      }
    }
    
    return freq;
  }, []);

  // Функция конвертации частоты в ноту
  const freqToNote = (freq) => {
    if (!freq) return null;
    
    const A4 = 440;
    const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    
    const semitones = 12 * Math.log2(freq / A4);
    const octave = Math.floor(semitones / 12) + 4;
    const noteIndex = Math.round(((semitones % 12) + 12) % 12);
    const note = notes[noteIndex];
    
    console.log(`🎵 freqToNote: ${freq.toFixed(2)}Hz → ${note}${octave} (semitones: ${semitones.toFixed(2)}, octave: ${octave})`);
    
    // Специальная коррекция для нот A и B - они часто детектируются на октаву выше
    let correctedOctave = octave;
    if (note === 'A' || note === 'A#' || note === 'B') {
      // Коррекция для октав 4 и выше
      if (octave >= 4) {
        correctedOctave = octave - 1;
        console.log(`🔧 Коррекция октавы для ${note}: ${octave} → ${correctedOctave}`);
      } 
      // Специальная коррекция для октавы 3, если это явно A2 или B2
      else if (octave === 3 && (note === 'A' || note === 'B')) {
        correctedOctave = octave - 1;
        console.log(`🔧 Специальная коррекция A3/B3 → A2/B2 для ${note}: ${octave} → ${correctedOctave}`);
      } else {
        console.log(`✅ БЕЗ коррекции для ${note}${octave} (октава ${octave})`);
      }
    }
    
    return `${note}${correctedOctave}`;
  };

  // Функция поиска ближайшей ноты
  const findClosestNote = (frequency) => {
    const notes = [
      { name: 'C', freq: 261.63 }, { name: 'C#', freq: 277.18 }, { name: 'D', freq: 293.66 },
      { name: 'D#', freq: 311.13 }, { name: 'E', freq: 329.63 }, { name: 'F', freq: 349.23 },
      { name: 'F#', freq: 369.99 }, { name: 'G', freq: 392.00 }, { name: 'G#', freq: 415.30 },
      { name: 'A', freq: 440.00 }, { name: 'A#', freq: 466.16 }, { name: 'B', freq: 493.88 }
    ];

    let closest = null;
    let minDiff = Infinity;

    // Проверяем несколько октав
    for (let octave = 1; octave <= 7; octave++) {
      const multiplier = Math.pow(2, octave - 4); // A4 = 440 Hz в 4-й октаве
      
      for (const note of notes) {
        const noteFreq = note.freq * multiplier;
        const diff = Math.abs(frequency - noteFreq);
        
        if (diff < minDiff) {
          minDiff = diff;
          
          // Специальная коррекция для нот A и B - они часто детектируются на октаву выше
          let correctedOctave = octave;
          if (note.name === 'A' || note.name === 'A#' || note.name === 'B') {
            // Коррекция для октав 4 и выше
            if (octave >= 4) {
              correctedOctave = octave - 1;
              console.log(`🔧 findClosestNote коррекция для ${note.name}: ${octave} → ${correctedOctave}`);
            }
            // Специальная коррекция для октавы 3, если это явно A2 или B2
            else if (octave === 3 && (note.name === 'A' || note.name === 'B')) {
              correctedOctave = octave - 1;
              console.log(`🔧 findClosestNote специальная коррекция A3/B3 → A2/B2 для ${note.name}: ${octave} → ${correctedOctave}`);
            } else {
              console.log(`✅ findClosestNote БЕЗ коррекции для ${note.name}${octave} (октава ${octave})`);
            }
          }
          
          closest = {
            note: `${note.name}${correctedOctave}`,
            freq: noteFreq,
            cents: 1200 * Math.log2(frequency / noteFreq)
          };
        }
      }
    }

    return closest;
  };

  const startTuner = useCallback(async () => {
    try {
      setError(null);
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      // Инициализируем Pitchy детектор
      pitchyDetectorRef.current = PitchDetector.forFloat32Array(2048);

      await audioCtx.resume();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      source.connect(analyser);
      
      const timeBuf = new Float32Array(analyser.fftSize);

      function loop() {
        analyser.getFloatTimeDomainData(timeBuf);
        
        // Вычисляем громкость
        let sum = 0;
        for (let i = 0; i < timeBuf.length; i++) {
          sum += timeBuf[i] * timeBuf[i];
        }
        const rms = Math.sqrt(sum / timeBuf.length);
        setVolume(rms * 100);

        if (rms > 0.02) { // Минимальный порог громкости
          // Детектируем питч с помощью Pitchy
          const [detectedFreq, confidence] = pitchyDetectorRef.current.findPitch(timeBuf, audioCtx.sampleRate);
          
          if (detectedFreq && confidence > 0.3) {
            // Исправляем гармоники только если уверенность низкая (возможна гармоника)
            let correctedFreq = detectedFreq;
            
            // Если уверенность низкая и частота высокая - возможно это гармоника
            if (confidence < 0.6 && detectedFreq > 600) {
              correctedFreq = correctHarmonics(detectedFreq);
            }
            
            // Логируем исправления
            if (correctedFreq !== detectedFreq) {
              console.log(`🔧 Исправление гармоники: ${detectedFreq.toFixed(2)} Hz → ${correctedFreq.toFixed(2)} Hz (уверенность: ${(confidence * 100).toFixed(1)}%)`);
            }
            
            // Находим ближайшую ноту
            const closest = findClosestNote(correctedFreq);
            
            if (closest) {
              setFreq(correctedFreq);
              setCents(closest.cents);
              
              // Форматируем результат
              const noteName = freqToNote(correctedFreq);
              const centsDiff = closest.cents;
              const tuningStatus = Math.abs(centsDiff) < 5 ? "✅" : 
                                  Math.abs(centsDiff) < 20 ? "⚠️" : "❌";
              
              setResult(`${tuningStatus} ${noteName} (${centsDiff > 0 ? '+' : ''}${centsDiff.toFixed(1)}¢)`);
            }
          } else {
            setFreq(null);
            setCents(null);
            setResult(null);
          }
        } else {
          setFreq(null);
          setCents(null);
          setResult(null);
        }

        animationRef.current = requestAnimationFrame(loop);
      }

      setRunning(true);
      loop();
      
    } catch (err) {
      console.error("Error starting tuner:", err);
      setError(`Ошибка: ${err.message}. Убедитесь, что микрофон подключен и разрешен доступ.`);
      setRunning(false);
    }
  }, [correctHarmonics]);

  const stopTuner = useCallback(() => {
    setRunning(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    
    if (pitchyDetectorRef.current) {
      pitchyDetectorRef.current = null;
    }
    
    setFreq(null);
    setCents(null);
    setResult(null);
    setVolume(0);
  }, []);

  useEffect(() => {
    return () => {
      stopTuner();
    };
  }, [stopTuner]);

  // Автоматически запускаем тюнер при монтировании компонента
  useEffect(() => {
    if (hidden && !running) {
      console.log('🎹 PitchTrainerPitchy: автоматически запускаю тюнер в скрытом режиме');
      // Небольшая задержка для предотвращения конфликтов
      const timer = setTimeout(() => {
        startTuner();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [hidden, running, startTuner]);

  // Если скрытый режим, возвращаем только логику без UI
  if (hidden) {
    return null;
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🎵 Тюнер с Pitchy
      </h2>

      {/* Показываем ожидаемое значение */}
      {expected && (
        <div style={{ 
          marginBottom: 20, 
          padding: 12, 
          backgroundColor: '#e3f2fd', 
          borderRadius: 8,
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>
            Ваша задача: сыграть ноту <strong>{expected}</strong>
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Сыграйте ноту на инструменте
          </p>
        </div>
      )}

      {/* Режимы */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '20px' 
      }}>
        <button
          onClick={() => setMode("guitar")}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === "guitar" ? '#3498db' : '#ecf0f1',
            color: mode === "guitar" ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🎸 Гитара
        </button>
        <button
          onClick={() => setMode("piano")}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === "piano" ? '#3498db' : '#ecf0f1',
            color: mode === "piano" ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🎹 Пианино
        </button>
      </div>

      {/* Кнопка запуска/остановки */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button 
          onClick={running ? stopTuner : startTuner}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: running ? '#e74c3c' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {running ? '⏹️ Остановить' : '▶️ Начать'}
        </button>
      </div>

      {/* Настройки */}

      {/* Ошибки */}
      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Результаты */}
      {running && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3>Статус детекции:</h3>
          <p><strong>Громкость:</strong> {volume.toFixed(1)}%</p>
          
          {freq && result ? (
            <div>
              <p><strong>Частота:</strong> {freq.toFixed(2)} Hz</p>
              <p><strong>Нота:</strong> {freqToNote(freq)}</p>
              <p><strong>Результат:</strong> 
                <span style={{ 
                  color: isCorrect ? '#27ae60' : '#2c3e50',
                  fontWeight: isCorrect ? 'bold' : 'normal'
                }}>
                  {result}
                </span>
                {isCorrect && <span style={{ color: '#27ae60', marginLeft: '10px' }}>✅ Правильно!</span>}
              </p>
              {cents !== null && (
                <p><strong>Отклонение:</strong> 
                  <span style={{ 
                    color: Math.abs(cents) < 5 ? '#27ae60' : Math.abs(cents) < 20 ? '#f39c12' : '#e74c3c'
                  }}>
                    {cents > 0 ? '+' : ''}{cents.toFixed(1)} центов
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p>Ожидание звука...</p>
          )}
        </div>
      )}

      {/* Информация */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#e8f4f8', 
        borderRadius: '10px'
      }}>
        <h3>ℹ️ Информация:</h3>
        <p><strong>Алгоритм:</strong> Pitchy с исправлением гармоник</p>
        <p><strong>Режим:</strong> {mode === "guitar" ? "Гитара" : "Пианино"}</p>
        <p><strong>Статус:</strong> {running ? "Работает" : "Остановлен"}</p>
      </div>
    </div>
  );
};

export default PitchTrainerPitchy;
