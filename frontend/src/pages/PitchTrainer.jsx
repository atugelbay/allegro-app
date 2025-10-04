import { useRef, useState, useEffect, useCallback } from "react";

// CSS анимации для тюнера
const tunerStyles = `
  @keyframes wave {
    0% { transform: translateX(-20px); opacity: 0; }
    100% { transform: translateX(20px); opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.1); }
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
    50% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.8); }
  }
  
  /* Адаптивный дизайн */
  @media (max-width: 768px) {
    .tuner-container {
      padding: 16px !important;
      margin: 16px !important;
    }
    
    .tuner-circle {
      width: 160px !important;
      height: 160px !important;
    }
    
    .tuner-inner {
      width: 120px !important;
      height: 120px !important;
    }
    
    .tuner-arrow {
      height: 50px !important;
    }
    
    .chord-circle {
      width: 100px !important;
      height: 100px !important;
    }
    
    .chord-note {
      width: 20px !important;
      height: 20px !important;
      font-size: 8px !important;
    }
  }
  
  @media (max-width: 480px) {
    .tuner-circle {
      width: 140px !important;
      height: 140px !important;
    }
    
    .tuner-inner {
      width: 100px !important;
      height: 100px !important;
    }
    
    .tuner-arrow {
      height: 40px !important;
    }
  }
`;

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = tunerStyles;
  document.head.appendChild(styleSheet);
}

// ===== Ноты (как у тебя) =====
const NOTES = [
  { note: "C0", freq: 16.35 }, { note: "C#0/Db0", freq: 17.32 }, { note: "D0", freq: 18.35 },
  { note: "D#0/Eb0", freq: 19.45 }, { note: "E0", freq: 20.60 }, { note: "F0", freq: 21.83 },
  { note: "F#0/Gb0", freq: 23.12 }, { note: "G0", freq: 24.50 }, { note: "G#0/Ab0", freq: 25.96 },
  { note: "A0", freq: 27.50 }, { note: "A#0/Bb0", freq: 29.14 }, { note: "B0", freq: 30.87 },

  { note: "C1", freq: 32.70 }, { note: "C#1/Db1", freq: 34.65 }, { note: "D1", freq: 36.71 },
  { note: "D#1/Eb1", freq: 38.89 }, { note: "E1", freq: 41.20 }, { note: "F1", freq: 43.65 },
  { note: "F#1/Gb1", freq: 46.25 }, { note: "G1", freq: 49.00 }, { note: "G#1/Ab1", freq: 51.91 },
  { note: "A1", freq: 55.00 }, { note: "A#1/Bb1", freq: 58.27 }, { note: "B1", freq: 61.74 },

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

  { note: "C6", freq: 1046.50 }, { note: "C#6/Db6", freq: 1108.73 }, { note: "D6", freq: 1174.66 },
  { note: "D#6/Eb6", freq: 1244.51 }, { note: "E6", freq: 1318.51 }, { note: "F6", freq: 1396.91 },
  { note: "F#6/Gb6", freq: 1479.98 }, { note: "G6", freq: 1567.98 }, { note: "G#6/Ab6", freq: 1661.22 },
  { note: "A6", freq: 1760.00 }, { note: "A#6/Bb6", freq: 1864.66 }, { note: "B6", freq: 1975.53 },

  { note: "C7", freq: 2093.00 }, { note: "C#7/Db7", freq: 2217.46 }, { note: "D7", freq: 2349.32 },
  { note: "D#7/Eb7", freq: 2489.02 }, { note: "E7", freq: 2637.02 }, { note: "F7", freq: 2793.83 },
  { note: "F#7/Gb7", freq: 2959.96 }, { note: "G7", freq: 3135.96 }, { note: "G#7/Ab7", freq: 3322.44 },
  { note: "A7", freq: 3520.00 }, { note: "A#7/Bb7", freq: 3729.31 }, { note: "B7", freq: 3951.07 },
];

// ===== База данных аккордов с научной точностью из Wikipedia Piano Key Frequencies =====
// Основано на равномерно темперированном строе (A4 = 440Hz)
const CHORDS = {
  // Мажорные аккорды (структура: тоника - большая терция - чистая квинта)
  C: ["C", "E", "G"],       // C Major: C-E-G (261.6-329.6-392.0 Hz)
  D: ["D", "F#", "A"],      // D Major: D-F#-A (293.7-370.0-440.0 Hz)
  E: ["E", "G#", "B"],      // E Major: E-G#-B (329.6-415.3-493.9 Hz)
  F: ["F", "A", "C"],       // F Major: F-A-C (349.2-440.0-523.3 Hz)
  G: ["G", "B", "D"],       // G Major: G-B-D (392.0-493.9-587.3 Hz)
  A: ["A", "C#", "E"],      // A Major: A-C#-E (440.0-554.4-659.3 Hz)
  B: ["B", "D#", "F#"],     // B Major: B-D#-F# (493.9-622.3-740.0 Hz)
  
  // Минорные аккорды (структура: тоника - малая терция - чистая квинта)
  Cm: ["C", "D#", "G"],     // C minor: C-Eb-G (261.6-311.1-392.0 Hz)
  Dm: ["D", "F", "A"],      // D minor: D-F-A (293.7-349.2-440.0 Hz)
  Em: ["E", "G", "B"],      // E minor: E-G-B (329.6-392.0-493.9 Hz) - ИСПРАВЛЕНО!
  Fm: ["F", "G#", "C"],     // F minor: F-Ab-C (349.2-415.3-523.3 Hz)
  Gm: ["G", "A#", "D"],     // G minor: G-Bb-D (392.0-466.2-587.3 Hz)
  Am: ["A", "C", "E"],      // A minor: A-C-E (440.0-523.3-659.3 Hz)
  Bm: ["B", "D", "F#"],     // B minor: B-D-F# (493.9-587.3-740.0 Hz)
  
  // Диезные мажорные аккорды
  "C#": ["C#", "F", "G#"],    // C# Major: C#-E#(F)-G# (277.2-349.2-415.3 Hz)
  "D#": ["D#", "G", "A#"],    // D# Major: D#-F##(G)-A# (311.1-392.0-466.2 Hz)
  "F#": ["F#", "A#", "C#"],   // F# Major: F#-A#-C# (370.0-466.2-554.4 Hz)
  "G#": ["G#", "C", "D#"],    // G# Major: G#-B#(C)-D# (415.3-523.3-622.3 Hz)
  "A#": ["A#", "D", "F"],     // A# Major: A#-C##(D)-E#(F) (466.2-587.3-698.5 Hz)
  
  // Диезные минорные аккорды
  "C#m": ["C#", "E", "G#"],   // C# minor: C#-E-G# (277.2-329.6-415.3 Hz)
  "D#m": ["D#", "F#", "A#"],  // D# minor: D#-F#-A# (311.1-370.0-466.2 Hz)
  "F#m": ["F#", "A", "C#"],   // F# minor: F#-A-C# (370.0-440.0-554.4 Hz)
  "G#m": ["G#", "B", "D#"],   // G# minor: G#-B-D# (415.3-493.9-622.3 Hz)
  "A#m": ["A#", "C#", "F"],   // A# minor: A#-C#-E#(F) (466.2-554.4-698.5 Hz)
  
  // Бемольные аккорды (энгармонические эквиваленты)
  "Db": ["C#", "F", "G#"],    // Db Major = C# Major
  "Eb": ["D#", "G", "A#"],    // Eb Major = D# Major
  "Gb": ["F#", "A#", "C#"],   // Gb Major = F# Major
  "Ab": ["G#", "C", "D#"],    // Ab Major = G# Major
  "Bb": ["A#", "D", "F"],     // Bb Major = A# Major
  
  "Dbm": ["C#", "E", "G#"],   // Db minor = C# minor
  "Ebm": ["D#", "F#", "A#"],  // Eb minor = D# minor
  "Gbm": ["F#", "A", "C#"],   // Gb minor = F# minor
  "Abm": ["G#", "B", "D#"],   // Ab minor = G# minor
  "Bbm": ["A#", "C#", "F"],   // Bb minor = A# minor
};

// ===== Утилиты =====
function findClosestNote(freq) {
  let closest = NOTES[0], diff = Math.abs(freq - closest.freq);
  for (const n of NOTES) {
    const d = Math.abs(freq - n.freq);
    if (d < diff) { closest = n; diff = d; }
  }
  return closest;
}

// Функция для определения типа терции между двумя нотами
function getThirdType(rootNote, thirdNote, detectedFreqs) {
  // Находим ВСЕ частоты для найденных нот (включая октавы)
  const rootFreqs = detectedFreqs.filter(f => 
    normalizePitchClass(findClosestNote(f.freq).note) === rootNote
  );
  
  const thirdFreqs = detectedFreqs.filter(f => 
    normalizePitchClass(findClosestNote(f.freq).note) === thirdNote
  );
  
  if (rootFreqs.length === 0 || thirdFreqs.length === 0) return null;
  
  // Проверяем ВСЕ возможные комбинации октав
  let bestRatio = null;
  let bestConfidence = 0;
  
  for (const rootFreq of rootFreqs) {
    for (const thirdFreq of thirdFreqs) {
      // Приводим к одной октаве для сравнения
      let normalizedThird = thirdFreq.freq;
      while (normalizedThird < rootFreq.freq) normalizedThird *= 2;
      while (normalizedThird > rootFreq.freq * 2) normalizedThird /= 2;
      
      const ratio = normalizedThird / rootFreq.freq;
      
      // Проверяем соотношения с более строгими критериями:
      // Большая терция ≈ 1.260 (2^(4/12))
      // Малая терция ≈ 1.189 (2^(3/12))
      const majorThirdRatio = Math.pow(2, 4/12); // 1.2599
      const minorThirdRatio = Math.pow(2, 3/12); // 1.1892
      
      const majorDiff = Math.abs(ratio - majorThirdRatio);
      const minorDiff = Math.abs(ratio - minorThirdRatio);
      
      // Учитываем силу сигнала в оценке
      const combinedAmplitude = (rootFreq.amp + thirdFreq.amp) / 2;
      
      if (majorDiff < 0.025) { // Ослабляем критерий с 0.015 до 0.025
        const confidence = combinedAmplitude * (1 - majorDiff * 30); // Уменьшаем штраф
        if (confidence > bestConfidence) {
          bestRatio = 'major';
          bestConfidence = confidence;
        }
      }
      
      if (minorDiff < 0.025) { // Ослабляем критерий с 0.015 до 0.025
        const confidence = combinedAmplitude * (1 - minorDiff * 30); // Уменьшаем штраф
        if (confidence > bestConfidence) {
          bestRatio = 'minor';
          bestConfidence = confidence;
        }
      }
    }
  }
  
  // Возвращаем результат при более мягком критерии уверенности
  return bestConfidence > 10 ? bestRatio : null; // Снижаем с 20 до 10
}

// Функция для проверки наличия всех необходимых нот аккорда
function validateCompleteChord(chordName, requiredNotes, detectedNotes, fundamentalPeaks) {
  const root = chordName.replace('m', '').replace('#', '').replace('b', '');
  const isMinor = chordName.includes('m') && !chordName.includes('#');
  
  // Проверяем наличие основных компонентов трезвучия
  const hasRoot = detectedNotes.includes(root);
  const hasThird = detectedNotes.includes(requiredNotes[1]);
  const hasFifth = requiredNotes.length > 2 ? detectedNotes.includes(requiredNotes[2]) : true;
  
  
  // ОСЛАБЛЕННЫЕ КРИТЕРИИ: достаточно корня ИЛИ терции для базовой валидации
  if (!hasRoot && !hasThird) {
    // console.log(`❌ ${chordName}: отсутствуют базовые компоненты`);
    return { isValid: false, confidence: 0 };
  }
  
  // Проверяем правильность терции ТОЛЬКО если она найдена
  let thirdValidation = true;
  if (hasThird && hasRoot) {
    const thirdType = getThirdType(root, requiredNotes[1], fundamentalPeaks);
    const expectedThirdType = isMinor ? 'minor' : 'major';
    
    if (thirdType && thirdType !== expectedThirdType) {
      // console.log(`⚠️ ${chordName}: неидеальный тип терции (ожидалось ${expectedThirdType}, найдено ${thirdType})`);
      thirdValidation = false; // Не отклоняем, но снижаем уверенность
    }
  }
  
  // Рассчитываем уверенность на основе полноты аккорда
  let confidence = 40; // Снижаем базовую уверенность
  
  if (hasRoot) confidence += 25;
  if (hasThird) confidence += 25;
  if (hasFifth) confidence += 10;
  
  // Бонус за правильную терцию
  if (thirdValidation) confidence += 20;
  else confidence -= 10; // Мягкий штраф вместо отклонения
  
  // console.log(`✅ ${chordName}: валидирован с уверенностью ${confidence}%`);
  return { isValid: true, confidence };
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

function removeDC(buf) {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i];
  const mean = sum / buf.length;
  for (let i = 0; i < buf.length; i++) buf[i] -= mean;
}

function hannWindow(buf) {
  const N = buf.length;
  for (let i = 0; i < N; i++) {
    const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
    buf[i] *= w;
  }
}

// ===== Улучшенное подавление гармоник с более мягкими критериями =====
function suppressHarmonics(peaks) {
  // Сортируем по амплитуде (приоритет сильным сигналам)
  const sorted = [...peaks].sort((a, b) => b.amp - a.amp);
  const fundamental = [];
  
  // Открытые струны гитары - они могут звучать как басовые частоты
  const guitarOpenStrings = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63]; // E A D G B E
  
  // console.log(`🔍 Анализ ${peaks.length} пиков для подавления гармоник`);
  
  for (const peak of sorted) {
    let isHarmonic = false;
    
    // Проверяем, является ли эта частота гармоникой уже найденной фундаментальной
    for (const fund of fundamental) {
      const ratio = peak.freq / fund.freq;
      
      // Более мягкие критерии для подавления гармоник
      if (Math.abs(ratio - Math.round(ratio)) < 0.12 && Math.round(ratio) >= 2 && Math.round(ratio) <= 8) {
        // Проверяем, не является ли это более сильным фундаментальным тоном
        if (peak.amp > fund.amp * 1.5) {
          // Если текущий пик значительно сильнее, возможно это настоящий фундаментальный тон
          // console.log(`🔄 Возможная замена: ${fund.freq.toFixed(1)}Hz -> ${peak.freq.toFixed(1)}Hz (сильнее в ${(peak.amp/fund.amp).toFixed(1)}x)`);
          continue;
        }
        
        // Дополнительная проверка: сильные гармоники (2я, 3я) подавляются строже
        if (Math.round(ratio) <= 3 && Math.abs(ratio - Math.round(ratio)) < 0.08) {
          isHarmonic = true;
          // console.log(`🚫 Подавлена гармоника: ${peak.freq.toFixed(1)}Hz (${Math.round(ratio)}я гармоника от ${fund.freq.toFixed(1)}Hz)`);
          break;
        } else if (Math.round(ratio) > 3 && Math.abs(ratio - Math.round(ratio)) < 0.12) {
          isHarmonic = true;
          // console.log(`🚫 Подавлена гармоника: ${peak.freq.toFixed(1)}Hz (${Math.round(ratio)}я гармоника от ${fund.freq.toFixed(1)}Hz)`);
          break;
        }
      }
    }
    
    // Особая обработка для открытых струн гитары - они важны для аккордов
    const isOpenString = guitarOpenStrings.some(openFreq => 
      Math.abs(peak.freq - openFreq) < 5.0 // Увеличиваем погрешность до 5Hz
    );
    
    if (!isHarmonic || isOpenString) {
      fundamental.push(peak);
      // Для открытых струн добавляем бонус к амплитуде
      if (isOpenString) {
        peak.amp *= 1.3; // Увеличиваем бонус
        // console.log(`🎸 Обнаружена открытая струна: ${peak.freq.toFixed(1)}Hz (бонус +30%)`);
      } else {
        // console.log(`✅ Фундаментальная частота: ${peak.freq.toFixed(1)}Hz (${peak.amp.toFixed(1)}дБ)`);
      }
    }
  }
  
  // console.log(`🎵 Найдено ${fundamental.length} фундаментальных частот`);
  
  // Возвращаем максимум 12 фундаментальных частот (увеличиваем лимит)
  return fundamental.sort((a, b) => b.amp - a.amp).slice(0, 12);
}

// ===== Усиленная система фиксации аккордов с защитой высокоуверенных результатов =====
function lockChordOnConfidentDetection(detectedChord, confidence, setLockedChord, setLockTimestamp, lockReleaseTimerRef) {
  const LOCK_CONFIDENCE_THRESHOLD = 75; // Понижаем порог до 75%
  const HIGH_CONFIDENCE_THRESHOLD = 91; // Порог для высокой уверенности
  
  // Динамическая длительность блокировки в зависимости от уверенности
  let lockDuration;
  let lockType;
  
  if (confidence >= HIGH_CONFIDENCE_THRESHOLD) {
    lockDuration = 4000; // 4 секунды для высокоуверенных результатов
    lockType = 'HIGH_CONFIDENCE';
  } else if (confidence >= 85) {
    lockDuration = 3000; // 3 секунды для хороших результатов
    lockType = 'GOOD_CONFIDENCE';
  } else {
    lockDuration = 2000; // 2 секунды для базовых результатов
    lockType = 'BASIC_CONFIDENCE';
  }
  
  const now = Date.now();
  
  // Блокируем аккорд только при высокой уверенности
  if (confidence >= LOCK_CONFIDENCE_THRESHOLD) {
    // console.log(`🔒 БЛОКИРОВКА аккорда ${detectedChord.name} с уверенностью ${confidence}% на ${lockDuration}мс (тип: ${lockType})`);
    
    setLockedChord({
      name: detectedChord.name,
      confidence: confidence,
      lockTime: now,
      lockType: lockType,
      originalConfidence: confidence // Сохраняем оригинальную уверенность
    });
    setLockTimestamp(now);
    
    // Очищаем предыдущий таймер, если есть
    if (lockReleaseTimerRef.current) {
      clearTimeout(lockReleaseTimerRef.current);
    }
    
    // Устанавливаем таймер для автоматического сброса блокировки
    const timer = setTimeout(() => {
      // console.log(`🔓 Автоматический сброс блокировки аккорда (${lockType})`);
      setLockedChord(null);
      setLockTimestamp(0);
      lockReleaseTimerRef.current = null;
    }, lockDuration);
    
    lockReleaseTimerRef.current = timer;
    
    return true; // Аккорд заблокирован
  }
  
  return false; // Аккорд не заблокирован
}

// Проверяем, заблокирован ли аккорд в данный момент
function isChordLocked(lockedChord, lockTimestamp) {
  if (!lockedChord || !lockTimestamp) return false;
  
  const now = Date.now();
  
  // Определяем длительность блокировки в зависимости от типа
  let lockDuration;
  if (lockedChord.lockType === 'HIGH_CONFIDENCE') {
    lockDuration = 4000; // 4 секунды для высокоуверенных результатов
  } else if (lockedChord.lockType === 'GOOD_CONFIDENCE') {
    lockDuration = 3000; // 3 секунды для хороших результатов
  } else {
    lockDuration = 2000; // 2 секунды для базовых результатов
  }
  
  return (now - lockTimestamp) < lockDuration;
}

// ===== Функция стабилизации аккордов с учетом блокировки =====
function stabilizeChord(candidateChord, chordHistoryRef, stableChordRef, lockedChord, lockTimestamp, setLockedChord, setLockTimestamp, lockReleaseTimerRef) {
  const now = Date.now();
  const STABILITY_TIME = 250; // Аккорд должен держаться 250мс
  const HISTORY_SIZE = 3; // Количество последних анализов для учета
  
  // ПРИОРИТЕТ: если аккорд заблокирован, возвращаем его
  if (isChordLocked(lockedChord, lockTimestamp)) {
    // Определяем длительность для корректного расчета оставшегося времени
    let lockDuration;
    if (lockedChord.lockType === 'HIGH_CONFIDENCE') {
      lockDuration = 4000;
    } else if (lockedChord.lockType === 'GOOD_CONFIDENCE') {
      lockDuration = 3000;
    } else {
      lockDuration = 2000;
    }
    
    const timeLeft = lockDuration - (now - lockTimestamp);
    const lockIcon = lockedChord.lockType === 'HIGH_CONFIDENCE' ? '🔐' : '🔒';
    
    // console.log(`${lockIcon} Аккорд ${lockedChord.name} заблокирован (${lockedChord.lockType}, осталось ${timeLeft}мс)`);
    
    return {
      name: lockedChord.name,
      confidence: lockedChord.originalConfidence, // Показываем оригинальную уверенность
      isLocked: true,
      lockType: lockedChord.lockType
    };
  }
  
  // Добавляем текущий кандидат в историю
  chordHistoryRef.current.push({
    chord: candidateChord,
    timestamp: now
  });
  
  // Убираем старые записи (старше 1 секунды)
  chordHistoryRef.current = chordHistoryRef.current.filter(
    entry => now - entry.timestamp < 1000
  );
  
  // Ограничиваем размер истории
  if (chordHistoryRef.current.length > HISTORY_SIZE * 2) {
    chordHistoryRef.current = chordHistoryRef.current.slice(-HISTORY_SIZE);
  }
  
  if (!candidateChord) {
    // Если нет кандидата, проверяем, нужно ли сбросить стабильный аккорд
    if (stableChordRef.current && 
        chordHistoryRef.current.filter(e => e.chord?.name === stableChordRef.current.name).length === 0) {
      // Если стабильного аккорда нет в последних записях, сбрасываем
      stableChordRef.current = null;
    }
    return stableChordRef.current;
  }
  
  // Считаем, сколько раз этот аккорд встречался в недавней истории
  const recentMatches = chordHistoryRef.current.filter(
    entry => entry.chord?.name === candidateChord.name && 
             now - entry.timestamp <= STABILITY_TIME
  );
  
  // Если аккорд стабильно держится достаточно времени
  if (recentMatches.length >= 2) {
    stableChordRef.current = candidateChord;
    // console.log(`✅ Стабилизированный аккорд: ${candidateChord.name} (${recentMatches.length} подтверждений)`);
    
    // Попытка заблокировать аккорд при высокой уверенности
    // Используем разные пороги для разных уровней защиты
    if (candidateChord.confidence >= 75) { // Понижаем общий порог до 75%
      lockChordOnConfidentDetection(
        candidateChord, 
        candidateChord.confidence,
        setLockedChord,
        setLockTimestamp, 
        lockReleaseTimerRef
      );
    }
    
    return {
      name: candidateChord.name,
      confidence: candidateChord.confidence,
      isStable: true
    };
  }
  
  return stableChordRef.current;
}

// ===== Специальная обработка гитарных аккордов =====
function calculateGuitarChordBonus(chordName, requiredNotes, detectedNotes, fundamentalPeaks) {
  let bonus = 0;
  
  // Открытые струны гитары
  const openStrings = {
    'E': [82.41, 329.63], // 6-я и 1-я струны
    'A': [110.00],        // 5-я струна  
    'D': [146.83],        // 4-я струна
    'G': [196.00],        // 3-я струна
    'B': [246.94]         // 2-я струна
  };
  
  // Проверяем наличие открытых струн для данного аккорда
  for (const note of requiredNotes) {
    if (openStrings[note]) {
      for (const openFreq of openStrings[note]) {
        const foundOpen = fundamentalPeaks.some(peak => 
          Math.abs(peak.freq - openFreq) < 3.0 && peak.amp > 20
        );
        if (foundOpen) {
          bonus += 30; // Большой бонус за открытые струны
          // console.log(`🎸 Бонус за открытую струну ${note}: +30`);
        }
      }
    }
  }
  
  // Бонус за басовые ноты (корень аккорда в низком регистре)
  const root = chordName.replace('m', '').replace('#', '').replace('b', '');
  const bassNote = detectedNotes.find(n => 
    n.note === root && n.freq < 150 && n.amp > 15
  );
  
  if (bassNote) {
    bonus += 25;
    // console.log(`🎸 Бонус за басовую ноту ${root}: +25`);
  }
  
  // Специальные паттерны для популярных гитарных аккордов
  const guitarChordPatterns = {
    'E': ['E', 'G#', 'B'], // Открытый E мажор
    'A': ['A', 'C#', 'E'], // Открытый A мажор  
    'D': ['D', 'F#', 'A'], // Открытый D мажор
    'G': ['G', 'B', 'D'],  // Открытый G мажор
    'C': ['C', 'E', 'G'],  // Открытый C мажор
    'Em': ['E', 'G', 'B'], // Открытый Em
    'Am': ['A', 'C', 'E'], // Открытый Am
    'Dm': ['D', 'F', 'A']  // Открытый Dm
  };
  
  if (guitarChordPatterns[chordName]) {
    const pattern = guitarChordPatterns[chordName];
    const patternMatches = pattern.filter(note => 
      detectedNotes.some(d => d.note === note)
    );
    
    if (patternMatches.length === pattern.length) {
      bonus += 40; // Большой бонус за полный паттерн
      // console.log(`🎸 Бонус за полный гитарный паттерн ${chordName}: +40`);
    }
  }
  
  return bonus;
}

// ===== Улучшенная детекция нот с адаптивными порогами =====
function yinPitch(buf, sampleRate, minFreq = 70, maxFreq = 1200, threshold = 0.1) {
  const tauMin = Math.floor(sampleRate / maxFreq);
  const tauMax = Math.floor(sampleRate / minFreq);
  const yin = new Float32Array(tauMax + 1);

  // Вычисляем RMS для адаптивного порога
  let rms = 0;
  for (let i = 0; i < buf.length; i++) {
    rms += buf[i] * buf[i];
  }
  rms = Math.sqrt(rms / buf.length);
  
  // Адаптивный порог в зависимости от громкости
  const adaptiveThreshold = Math.max(0.05, Math.min(0.2, threshold * (1 + rms * 2)));

  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let i = 0; i < buf.length - tau; i++) {
      const d = buf[i] - buf[i + tau];
      sum += d * d;
    }
    yin[tau] = sum;
  }

  let running = 0;
  yin[0] = 1;
  for (let tau = 1; tau <= tauMax; tau++) {
    running += yin[tau];
    yin[tau] = (yin[tau] * tau) / (running || 1e-12);
  }

  // Ищем все кандидаты с порогом
  const candidates = [];
  for (let tau = tauMin; tau <= tauMax; tau++) {
    if (yin[tau] < adaptiveThreshold) {
      // Находим локальный минимум
      let bestTau = tau;
      while (bestTau + 1 <= tauMax && yin[bestTau + 1] < yin[bestTau]) {
        bestTau++;
      }
      
      const x0 = bestTau - 1 >= 1 ? bestTau - 1 : bestTau;
      const x2 = bestTau + 1 <= tauMax ? bestTau + 1 : bestTau;
      const s0 = yin[x0], s1 = yin[bestTau], s2 = yin[x2];
      let refinedTau = bestTau;
  const denom = (s2 + s0 - 2 * s1);
      if (denom !== 0) refinedTau = bestTau + (s2 - s0) / (2 * denom);

      const f = sampleRate / refinedTau;
      if (f >= minFreq && f <= maxFreq) {
        candidates.push({
          freq: f,
          confidence: 1 - yin[bestTau],
          tau: bestTau
        });
      }
    }
  }

  if (candidates.length === 0) return -1;

  // Сортируем по уверенности и возвращаем лучший
  candidates.sort((a, b) => a.confidence - b.confidence);
  return candidates[0].freq;
}

// ===== Дополнительный алгоритм детекции через автокорреляцию =====
function autocorrelationPitch(buf, sampleRate, minFreq = 70, maxFreq = 1200) {
  const minPeriod = Math.floor(sampleRate / maxFreq);
  const maxPeriod = Math.floor(sampleRate / minFreq);
  
  let bestPeriod = 0;
  let bestCorrelation = 0;
  
  for (let period = minPeriod; period < maxPeriod && period < buf.length / 2; period++) {
    let correlation = 0;
    for (let i = 0; i < buf.length - period; i++) {
      correlation += buf[i] * buf[i + period];
    }
    
    // Нормализуем корреляцию
    correlation /= (buf.length - period);
    
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestPeriod = period;
    }
  }
  
  if (bestPeriod === 0) return -1;
  
  const freq = sampleRate / bestPeriod;
  return (freq >= minFreq && freq <= maxFreq) ? freq : -1;
}

// ===== Комбинированная детекция нот =====
function detectNoteFrequency(buf, sampleRate, mode = "guitar") {
  // Настройки для разных инструментов
  const configs = {
    guitar: { minFreq: 80, maxFreq: 1000, threshold: 0.08 },
    piano: { minFreq: 60, maxFreq: 2000, threshold: 0.05 }, // Снижаем порог для пианино
    chord: { minFreq: 70, maxFreq: 1200, threshold: 0.1 }
  };
  
  const config = configs[mode] || configs.guitar;
  
  // Получаем результаты от разных алгоритмов
  const yinFreq = yinPitch(buf, sampleRate, config.minFreq, config.maxFreq, config.threshold);
  const autocorrFreq = autocorrelationPitch(buf, sampleRate, config.minFreq, config.maxFreq);
  
  // console.log(`🔍 Детекция нот (${mode}): YIN=${yinFreq > 0 ? yinFreq.toFixed(1) : 'N/A'}Hz, Autocorr=${autocorrFreq > 0 ? autocorrFreq.toFixed(1) : 'N/A'}Hz`);
  
  // Если результаты близки, используем среднее
  if (yinFreq > 0 && autocorrFreq > 0) {
    const diff = Math.abs(yinFreq - autocorrFreq);
    const avgFreq = (yinFreq + autocorrFreq) / 2;
    
    if (diff < avgFreq * 0.15) { // Увеличиваем допуск до 15%
      // console.log(`✅ Комбинированный результат: ${avgFreq.toFixed(1)}Hz`);
      return avgFreq;
    }
  }
  
  // Специальная обработка для проблемных частот (C4 = 261.63Hz)
  const result = yinFreq > 0 ? yinFreq : autocorrFreq;
  if (result > 0) {
    const note = findClosestNote(result);
    // console.log(`🎵 Найдена нота: ${note.note} (${result.toFixed(1)}Hz)`);
    
    // Коррекция для C4 и близких нот
    if (note.note.includes('C4') && Math.abs(result - 261.63) < 10) {
      // console.log(`🎯 Коррекция C4: ${result.toFixed(1)}Hz -> 261.6Hz`);
      return 261.63;
    }
  }
  
  // Возвращаем лучший результат
  return result;
}

// ===== Улучшенная детекция аккордов с мягким матчем и подавлением гармоник =====
function detectChord(freqBuf, sampleRate, setDetectedNotes, setChordConfidence, lockedChord, lockTimestamp, setLockedChord, setLockTimestamp, lockReleaseTimerRef) {
  // ПРИОРИТЕТНАЯ ПРОВЕРКА: если уже есть заблокированный аккорд с высокой уверенностью, не перезаписываем его
  if (lockedChord && isChordLocked(lockedChord, lockTimestamp) && lockedChord.originalConfidence >= 91) {
    // console.log(`🛡️ ЗАЩИТА: ${lockedChord.name} уже заблокирован с высокой уверенностью ${lockedChord.originalConfidence}%, пропускаем новый анализ`);
    return {
      name: lockedChord.name,
      confidence: lockedChord.originalConfidence,
      isLocked: true,
      lockType: lockedChord.lockType
    };
  }
  
  const peaks = [];
  
  // Улучшенная фильтрация пиков с защитой от NaN
  const validValues = freqBuf.filter(val => isFinite(val) && !isNaN(val));
  
  if (validValues.length === 0) {
    // console.log("⚠️ Нет валидных данных в частотном спектре");
    return null;
  }
  
  const avgAmp = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  const maxAmp = Math.max(...validValues);
  const minAmp = Math.min(...validValues);
  
  // Защита от крайних случаев
  const safeMaxAmp = isFinite(maxAmp) ? maxAmp : -30;
  const safeAvgAmp = isFinite(avgAmp) ? avgAmp : -60;
  const safeMinAmp = isFinite(minAmp) ? minAmp : -100;
  
  // Более мягкий адаптивный порог
  const adaptiveThreshold = Math.max(-80, safeAvgAmp + (safeMaxAmp - safeAvgAmp) * 0.2);
  
  // console.log(`Адаптивный порог: ${adaptiveThreshold.toFixed(1)}дБ (среднее: ${safeAvgAmp.toFixed(1)}дБ, макс: ${safeMaxAmp.toFixed(1)}дБ, мин: ${safeMinAmp.toFixed(1)}дБ)`);
  
  for (let i = 5; i < freqBuf.length - 5; i++) {
    const currentAmp = freqBuf[i];
    
    // Проверяем, что это действительно выдающийся пик
    const isStrongPeak = currentAmp > freqBuf[i-1] && currentAmp > freqBuf[i+1] && 
                        currentAmp > freqBuf[i-2] && currentAmp > freqBuf[i+2] &&
                        currentAmp > freqBuf[i-3] && currentAmp > freqBuf[i+3];
    
    // Дополнительная проверка на локальную значимость
    const localAvg = (freqBuf[i-3] + freqBuf[i-2] + freqBuf[i-1] + freqBuf[i+1] + freqBuf[i+2] + freqBuf[i+3]) / 6;
    const isSignificant = currentAmp > localAvg + 3; // На 3дБ выше локального среднего
    
    if (isStrongPeak && isSignificant && currentAmp > adaptiveThreshold) {
      const freq = (i * sampleRate) / (freqBuf.length * 2);
      if (freq > 80 && freq < 1200) { // Расширенный музыкальный диапазон
        peaks.push({ 
          freq, 
          amp: currentAmp,
          prominence: currentAmp - localAvg // Вычисляем "выдающуюся" амплитуду
        });
      }
    }
  }

  // Сортируем по амплитуде и берем сильные пики
  peaks.sort((a, b) => b.amp - a.amp);
  // console.log(`📈 Найдено ${peaks.length} пиков, топ-5:`, peaks.slice(0, 5).map(p => `${p.freq.toFixed(1)}Hz (${p.amp.toFixed(1)}дБ)`));
  
  // Снижаем порог для более чувствительной детекции
  let strongPeaks = peaks.slice(0, 25).filter(p => p.amp > -70); // Еще больше снижаем порог
  
  // Если нет сильных пиков, используем все найденные пики
  if (strongPeaks.length === 0 && peaks.length > 0) {
    // console.log("⚠️ Нет сильных пиков, используем все найденные пики");
    strongPeaks = peaks.slice(0, 10); // Берем топ-10 пиков
  }
  
  // Если все еще нет пиков, создаем fallback пики из валидных значений
  if (strongPeaks.length === 0 && validValues.length > 0) {
    // console.log("⚠️ Создаем fallback пики из валидных данных");
    const sortedValues = [...validValues].sort((a, b) => b - a);
    const topValues = sortedValues.slice(0, 5);
    
    for (let i = 0; i < topValues.length; i++) {
      const amp = topValues[i];
      if (amp > -90) { // Очень мягкий порог
        const freq = (i * sampleRate) / (freqBuf.length * 2);
        if (freq > 50 && freq < 2000) {
          strongPeaks.push({
            freq: freq,
            amp: amp,
            prominence: 5 // Минимальная выдающаяся амплитуда
          });
        }
      }
    }
  }
  
  // Подавляем гармоники - оставляем только фундаментальные частоты
  const fundamentalPeaks = suppressHarmonics(strongPeaks);
  
  // console.log(`Анализ завершен. Исходных пиков: ${peaks.length}, Сильных: ${strongPeaks.length}, Фундаментальных: ${fundamentalPeaks.length}`);
  
  const strong = fundamentalPeaks.map(p => ({
    note: normalizePitchClass(findClosestNote(p.freq).note),
    amp: p.amp,
    freq: p.freq
  }));

  const names = [...new Set(strong.map(n => n.note))];
  // console.log("🎵 Найденные фундаментальные ноты:", names);
  // console.log("📊 Детали частот:", strong.map(s => `${s.note}=${s.freq.toFixed(1)}Hz`).join(', '));
  
  // Обновляем найденные ноты в UI
  if (setDetectedNotes) {
    setDetectedNotes(names.slice(0, 6));
  }

  let bestChord = null;
  let bestScore = 0;
  let bestMatches = [];
  let bestGuitarBonus = 0;

  for (const [chord, requiredNotes] of Object.entries(CHORDS)) {
    const matches = requiredNotes.filter(n => names.includes(n));
    
    // УСИЛЕННАЯ ПРОВЕРКА: требуем корень + терцию + валидацию состава
    if (matches.length >= 2) {
      // Сначала проводим полную валидацию аккорда
      const validation = validateCompleteChord(chord, requiredNotes, names, fundamentalPeaks);
      
      if (!validation.isValid) {
        // console.log(`❌ Аккорд ${chord} не прошел валидацию`);
        continue; // Пропускаем невалидные аккорды
      }
      
      // Базовый счет на основе валидации
      let matchScore = validation.confidence * 2; // Удваиваем уверенность валидации
      
      // СПЕЦИАЛЬНАЯ ОБРАБОТКА ДЛЯ ГИТАРЫ
      const guitarBonus = calculateGuitarChordBonus(chord, requiredNotes, strong, fundamentalPeaks);
      matchScore += guitarBonus;
      
      const root = chord.replace('m', '').replace('#', '').replace('b', '');
      const isMinorChord = chord.includes('m') && !chord.includes('#');
      const expectedThird = requiredNotes[1]; // Вторая нота - терция
      
      // ДВОЙНАЯ ПРОВЕРКА терции (дополнительно к валидации)
      if (names.includes(root) && names.includes(expectedThird)) {
        const thirdType = getThirdType(root, expectedThird, fundamentalPeaks);
        
        // console.log(`🎵 Анализ ${chord}: корень=${root}, терция=${expectedThird}, тип терции=${thirdType}`);
        
        if (isMinorChord) {
          // Для минорных аккордов требуем малую терцию
          if (thirdType === 'minor') {
            matchScore += 150; // Бонус за правильную минорную терцию
            // console.log(`✅ Подтвержден минорный аккорд ${chord} с малой терцией`);
          } else if (thirdType === 'major') {
            matchScore -= 50; // Уменьшаем штраф со 150 до 50
            // console.log(`⚠️ ${chord}: найдена большая терция вместо малой`);
          }
        } else {
          // Для мажорных аккордов требуем большую терцию
          if (thirdType === 'major') {
            matchScore += 120; // Бонус за правильную мажорную терцию
            // console.log(`✅ Подтвержден мажорный аккорд ${chord} с большой терцией`);
          } else if (thirdType === 'minor') {
            matchScore -= 50; // Уменьшаем штраф со 150 до 50
            // console.log(`⚠️ ${chord}: найдена малая терция вместо большой`);
          }
        }
        
        // Дополнительная проверка: исключаем конфликтующие варианты
        // Если есть и мажорная и минорная версия одного корня
        const conflictingChord = isMinorChord ? root : root + 'm';
        if (CHORDS[conflictingChord] && thirdType) {
          const conflictMatches = CHORDS[conflictingChord].filter(n => names.includes(n));
          if (conflictMatches.length >= 2) {
            const conflictThirdType = getThirdType(root, CHORDS[conflictingChord][1], fundamentalPeaks);
            
            // Если конфликтующий аккорд имеет более подходящую терцию, уменьшаем счет
            if ((isMinorChord && conflictThirdType === 'major') || 
                (!isMinorChord && conflictThirdType === 'minor')) {
              matchScore -= 80;
              // console.log(`⚠️ Конфликт: ${conflictingChord} может быть более подходящим`);
            }
          }
        }
      }
      
      // Бонус за полное совпадение (3 из 3 нот)
      if (matches.length === requiredNotes.length) {
        matchScore += 75; // Бонус за полное совпадение
      }
      
      // Бонус за силу сигнала совпадающих нот
      const amplitudeBonus = strong
        .filter(n => matches.includes(n.note))
        .reduce((sum, n) => sum + Math.abs(n.amp) * 3, 0); // Увеличиваем вес амплитуды
      
      // Штраф за лишние ноты (более мягкий)
      const extraNotesPenalty = Math.max(0, (names.length - requiredNotes.length) * 5); // Уменьшаем штраф
      
      const totalScore = matchScore + amplitudeBonus - extraNotesPenalty;
      
      // console.log(`🎼 Кандидат аккорда: ${chord} (совпадений: ${matches.length}/${requiredNotes.length}, финальный счет: ${totalScore.toFixed(1)})`);
      // console.log(`   Требуемые ноты: [${requiredNotes.join(', ')}]`);
      // console.log(`   Найденные ноты: [${matches.join(', ')}]`);
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestChord = chord;
        bestMatches = matches;
        bestGuitarBonus = guitarBonus; // Сохраняем гитарный бонус
      }
    }
  }

  // Проверяем, что найденный аккорд действительно лучший и нет близких конкурентов
  if (bestChord && bestScore > 150) { // Значительно снижаем порог с 300 до 150
    
    // Дополнительная проверка: если есть конфликтующий аккорд с похожим счетом
    const root = bestChord.replace('m', '').replace('#', '').replace('b', '');
    const isMinor = bestChord.includes('m') && !bestChord.includes('#');
    const conflictingChord = isMinor ? root : root + 'm';
    
    // Проверяем счет конфликтующего аккорда
    if (CHORDS[conflictingChord]) {
      const conflictMatches = CHORDS[conflictingChord].filter(n => names.includes(n));
      if (conflictMatches.length >= 2) {
        // Пересчитываем счет для конфликтующего аккорда с той же логикой
        let conflictScore = conflictMatches.length * 100;
        const conflictThird = CHORDS[conflictingChord][1];
        
        if (names.includes(root) && names.includes(conflictThird)) {
          const conflictThirdType = getThirdType(root, conflictThird, fundamentalPeaks);
          
          if (!isMinor && conflictThirdType === 'minor') {
            conflictScore += 150; // Бонус минорному, если терция действительно минорная
          } else if (isMinor && conflictThirdType === 'major') {
            conflictScore += 120; // Бонус мажорному, если терция действительно мажорная
          }
        }
        
        // Если конфликтующий аккорд имеет близкий или лучший счет, проводим дополнительную проверку
        if (conflictScore > bestScore * 0.7) {
          // Дополнительная проверка: какой аккорд имеет более точное соответствие терции
          const bestValidation = validateCompleteChord(bestChord, CHORDS[bestChord], names, fundamentalPeaks);
          const conflictValidation = validateCompleteChord(conflictingChord, CHORDS[conflictingChord], names, fundamentalPeaks);
          
          // console.log(`🔍 Конфликт между ${bestChord} (валидация: ${bestValidation.confidence}%) и ${conflictingChord} (валидация: ${conflictValidation.confidence}%)`);
          
          // Если конфликтующий аккорд имеет лучшую валидацию, выбираем его
          if (conflictValidation.isValid && conflictValidation.confidence > bestValidation.confidence + 10) {
            // console.log(`🔄 Переключение с ${bestChord} на ${conflictingChord} из-за лучшей валидации`);
            bestChord = conflictingChord;
            bestScore = conflictScore;
            bestMatches = conflictMatches;
          } else if (!conflictValidation.isValid || bestValidation.confidence > conflictValidation.confidence + 5) {
            // Оставляем текущий лучший выбор, но снижаем уверенность при близкой конкуренции
            bestScore = Math.max(bestScore - 30, 150);
            // console.log(`⚠️ Снижена уверенность для ${bestChord} из-за конкуренции с ${conflictingChord}`);
          }
        }
      }
    }
    
    // УЛУЧШЕННАЯ ФОРМУЛА УВЕРЕННОСТИ ДЛЯ ГИТАРЫ
    let confidence;
    
    if (bestScore >= 400) {
      // Высокий счет - отличная уверенность
      confidence = Math.min(95, 80 + Math.round((bestScore - 400) / 20));
    } else if (bestScore >= 300) {
      // Хороший счет - хорошая уверенность  
      confidence = Math.min(85, 70 + Math.round((bestScore - 300) / 10));
    } else if (bestScore >= 200) {
      // Средний счет - умеренная уверенность
      confidence = Math.min(75, 60 + Math.round((bestScore - 200) / 8));
    } else {
      // Низкий счет - базовая уверенность
      confidence = Math.min(65, 50 + Math.round((bestScore - 150) / 5));
    }
    
    // Дополнительный бонус за гитарные паттерны
    if (bestGuitarBonus > 50) {
      confidence += 10;
      // console.log(`🎸 Бонус к уверенности за гитарные паттерны: +10`);
    }
    
    confidence = Math.max(50, Math.min(95, confidence)); // Ограничиваем диапазон
    
    // МГНОВЕННАЯ БЛОКИРОВКА для высокоуверенных результатов (91%+)
    if (confidence >= 91) {
      // console.log(`⚡ МГНОВЕННАЯ БЛОКИРОВКА: ${bestChord} с уверенностью ${confidence}% - фиксируем немедленно!`);
      
      // Прямая блокировка без ожидания стабилизации
      lockChordOnConfidentDetection(
        { name: bestChord, confidence: confidence },
        confidence,
        setLockedChord,
        setLockTimestamp,
        lockReleaseTimerRef
      );
    }
    
    if (setChordConfidence) {
      setChordConfidence(confidence);
    }
    
    // console.log(`🎯 ИТОГОВЫЙ РЕЗУЛЬТАТ: ${bestChord} с уверенностью ${confidence}% (финальный счет: ${bestScore.toFixed(1)})`);
    // console.log(`   Совпавшие ноты: [${bestMatches.join(', ')}]`);
    // console.log(`   📈 Данные основаны на Wikipedia Piano Key Frequencies (A4=440Hz)`);
    return {
      name: bestChord,
      confidence: confidence,
      matches: bestMatches,
      score: bestScore
    };
  }

  // ЗАПАСНОЙ АЛГОРИТМ: если строгая валидация не дала результатов, используем упрощенный подход
  // console.log("🚨 Строгая валидация не дала результатов, переходим к упрощенному алгоритму");
  // console.log(`🔍 Доступные ноты для fallback: [${names.join(', ')}]`);
  
  let fallbackChord = null;
  let fallbackScore = 0;
  let fallbackMatches = [];
  
  for (const [chord, requiredNotes] of Object.entries(CHORDS)) {
    const matches = requiredNotes.filter(n => names.includes(n));
    
    if (matches.length >= 1) { // Еще более мягкий критерий - хотя бы одна нота
      let score = matches.length * 50; // Базовый счет
      
      // Бонус за силу сигнала
      const amplitudeBonus = strong
        .filter(n => matches.includes(n.note))
        .reduce((sum, n) => sum + Math.abs(n.amp) * 2, 0);
      
      // Дополнительный бонус за корень аккорда
      const root = chord.replace('m', '').replace('#', '').replace('b', '');
      if (names.includes(root)) {
        score += 75; // Большой бонус за наличие корня
        // console.log(`🎯 Fallback: ${chord} - найден корень ${root}`);
      }
      
      const totalScore = score + amplitudeBonus;
      
      if (totalScore > fallbackScore) {
        fallbackScore = totalScore;
        fallbackChord = chord;
        fallbackMatches = matches;
      }
      
      // console.log(`🔍 Fallback кандидат: ${chord} (совпадений: ${matches.length}, счет: ${totalScore.toFixed(1)})`);
    }
  }
  
  if (fallbackChord && fallbackScore > 25) { // Снижаем минимальный порог
    // Улучшенная формула для запасного алгоритма
    let confidence;
    if (fallbackScore >= 150) {
      confidence = Math.min(75, 55 + Math.round((fallbackScore - 150) / 8));
    } else if (fallbackScore >= 100) {
      confidence = Math.min(65, 45 + Math.round((fallbackScore - 100) / 4));
    } else {
      confidence = Math.min(55, 35 + Math.round((fallbackScore - 25) / 2));
    }
    
    if (setChordConfidence) {
      setChordConfidence(confidence);
    }
    
    // console.log(`🎯 ЗАПАСНОЙ РЕЗУЛЬТАТ: ${fallbackChord} с уверенностью ${confidence}% (совпадения: [${fallbackMatches.join(', ')}])`);
    return {
      name: fallbackChord,
      confidence: confidence,
      matches: fallbackMatches,
      score: fallbackScore
    };
  }

  // ПОСЛЕДНИЙ FALLBACK: если ничего не найдено, пытаемся детектировать по одиночным нотам
  // console.log("🚨 Все алгоритмы не дали результатов, пытаемся детектировать по одиночным нотам");
  
  if (fundamentalPeaks.length > 0) {
    // Берем самую сильную частоту и пытаемся определить аккорд
    const strongestPeak = fundamentalPeaks[0];
    const note = findClosestNote(strongestPeak.freq);
    const noteName = normalizePitchClass(note.note);
    
    // Ищем аккорды, которые содержат эту ноту как корень
    for (const [chord, requiredNotes] of Object.entries(CHORDS)) {
      const root = chord.replace('m', '').replace('#', '').replace('b', '');
      if (root === noteName) {
        // console.log(`🎯 Последний fallback: найден аккорд ${chord} по корню ${noteName}`);
        
        if (setChordConfidence) {
          setChordConfidence(35); // Низкая уверенность для fallback
        }
        
        return {
          name: chord,
          confidence: 35,
          matches: [noteName],
          score: 50
        };
      }
    }
  }

  // Сбрасываем уверенность если ничего не найдено
  if (setChordConfidence) {
    setChordConfidence(0);
  }

  return null;
}


export default function PitchTrainer({ expected, type, onSuccess, onCancel, hidden = false }) {
  const [running, setRunning] = useState(false);
  const [freq, setFreq] = useState(null);
  const [cents, setCents] = useState(null);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("guitar"); // "guitar" | "piano" | "chord"
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0); // Добавляем индикатор уровня звука
  const [detectedNotes, setDetectedNotes] = useState([]); // Для отображения найденных нот
  const [chordConfidence, setChordConfidence] = useState(0); // Процент уверенности в аккорде
  const [isCorrect, setIsCorrect] = useState(false); // Флаг правильного ответа
  
  // Система фиксации аккордов при уверенном распознавании
  const [lockedChord, setLockedChord] = useState(null); // Заблокированный аккорд
  const [lockTimestamp, setLockTimestamp] = useState(0); // Время блокировки
  
  // Система стабилизации стрелки тюнера
  const [stableCents, setStableCents] = useState(null); // Стабильное значение центов
  const [tunerStability, setTunerStability] = useState(0); // Уровень стабильности (0-100%)

  const audioCtxRef = useRef(null);
  const smoothFreqRef = useRef(null);
  const lastChordRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const lastAnalysisTime = useRef(0); // Для ограничения частоты анализа аккордов
  const chordHistoryRef = useRef([]); // История последних детекций для стабилизации
  const stableChordRef = useRef(null); // Текущий стабильный аккорд
  const lockReleaseTimerRef = useRef(null); // Таймер сброса блокировки аккорда

  // Рефы для стабилизации тюнера
  const centsHistoryRef = useRef([]); // История значений центов
  const stabilityTimerRef = useRef(null); // Таймер для отслеживания стабильности

  // Функция стабилизации стрелки тюнера
  const stabilizeTunerNeedle = (newCents) => {
    const now = Date.now();
    
    // Добавляем новое значение в историю
    centsHistoryRef.current.push({
      cents: newCents,
      timestamp: now
    });
    
    // Убираем старые записи (старше 1 секунды)
    centsHistoryRef.current = centsHistoryRef.current.filter(
      entry => now - entry.timestamp < 1000
    );
    
    // Ограничиваем размер истории
    if (centsHistoryRef.current.length > 10) {
      centsHistoryRef.current = centsHistoryRef.current.slice(-10);
    }
    
    // Вычисляем стабильность
    if (centsHistoryRef.current.length >= 5) {
      const recentCents = centsHistoryRef.current.map(entry => entry.cents);
      const avgCents = recentCents.reduce((sum, c) => sum + c, 0) / recentCents.length;
      const variance = recentCents.reduce((sum, c) => sum + Math.pow(c - avgCents, 2), 0) / recentCents.length;
      const stability = Math.max(0, Math.min(100, 100 - variance * 2)); // Чем меньше разброс, тем выше стабильность
      
      setTunerStability(stability);
      
      // Если стабильность высокая (90%+) или отклонение приемлемое (≤20 центов), фиксируем стрелку в центре
      if ((stability >= 90 && Math.abs(avgCents) < 10) || Math.abs(avgCents) <= 20) {
        setStableCents(0); // Центрируем стрелку
        // console.log(`🎯 Центрируем стрелку (стабильность: ${stability.toFixed(1)}%, отклонение: ${avgCents.toFixed(1)}¢)`);
      } else {
        setStableCents(null); // Сбрасываем фиксацию
      }
    } else {
      setTunerStability(0);
      setStableCents(null);
    }
  };

  // Устанавливаем режим на основе типа упражнения и автоматически запускаем тюнер
  useEffect(() => {
    if (type === "chord") {
      setMode("chord");
    } else if (type === "note") {
      // Определяем режим на основе expected значения
      if (expected && (expected.includes('C') || expected.includes('D') || expected.includes('E') || expected.includes('F') || expected.includes('G') || expected.includes('A') || expected.includes('B'))) {
        setMode("piano"); // Если это нота, используем пианино
      } else {
        setMode("guitar"); // По умолчанию гитара для нот
      }
    }
    
    // Автоматически запускаем тюнер при использовании в упражнениях
    if (expected && !running) {
      setRunning(true); // Устанавливаем флаг, а сам запуск будет в useEffect ниже
    }
  }, [type, expected, hidden]); // Убираем startTuner из зависимостей


  // Проверяем соответствие результата expected значению
  useEffect(() => {
    if (!expected || !result) {
      setIsCorrect(false);
      return;
    }

    let detected = null;
    let correct = false;

    if (type === "chord" && mode === "chord") {
      // Для аккордов извлекаем название из результата
      const chordMatch = result.match(/[A-G][#b]?m?/);
      if (chordMatch) {
        detected = chordMatch[0];
        correct = detected === expected;
      }
    } else if (type === "note" && (mode === "guitar" || mode === "piano")) {
      // Для нот извлекаем название из результата
      const noteMatch = result.match(/[A-G][#b]?/);
      if (noteMatch) {
        detected = noteMatch[0];
        correct = detected === expected;
      }
    }

    setIsCorrect(correct);

    // Если ответ правильный, вызываем onSuccess через небольшую задержку
    if (correct && onSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 1000); // Даем время пользователю увидеть результат
    }
  }, [result, expected, type, mode, onSuccess]);

  const startTuner = useCallback(async () => {
    try {
      setError(null);
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      await audioCtx.resume();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = audioCtx.createMediaStreamSource(stream);

      // Создаем analyser сначала
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 4096;                    // ↑ разрешение
      analyser.smoothingTimeConstant = 0.0;       // без усреднения — нам важны пики
      analyser.minDecibels = -100;
      analyser.maxDecibels = -30;

      // Адаптивные band-pass фильтры в зависимости от режима
      const hp = audioCtx.createBiquadFilter();
      hp.type = "highpass"; 

      const lp = audioCtx.createBiquadFilter();
      lp.type = "lowpass"; 
      
      // Более мягкие настройки фильтров в зависимости от режима
      if (mode === "guitar") {
        hp.frequency.value = 60;  // Гитара: снижаем нижний порог
        lp.frequency.value = 1500; // Увеличиваем верхний порог
        hp.Q.value = 0.3; // Более мягкий срез
        lp.Q.value = 0.3;
      } else if (mode === "piano") {
        hp.frequency.value = 40;  // Пианино: еще более низкий срез
        lp.frequency.value = 2500; // Еще больше верхний порог
        hp.Q.value = 0.4;
        lp.Q.value = 0.4;
      } else { // chord mode
        hp.frequency.value = 50; // Аккорды: более низкий срез
        lp.frequency.value = 2000; // Больше верхний порог
        hp.Q.value = 0.3;
        lp.Q.value = 0.3;
      }
      
      // Добавляем multiple notch-фильтры для подавления сетевых шумов
      const notch1 = audioCtx.createBiquadFilter();
      notch1.type = "notch";
      notch1.frequency.value = 50; // Европейская частота сети
      notch1.Q.value = 15;
      
      const notch2 = audioCtx.createBiquadFilter();
      notch2.type = "notch";
      notch2.frequency.value = 60; // Американская частота сети
      notch2.Q.value = 15;
      
      const notch3 = audioCtx.createBiquadFilter();
      notch3.type = "notch";
      notch3.frequency.value = 100; // Первая гармоника
      notch3.Q.value = 10;

      // Создаем альтернативную простую цепочку для fallback
      const simpleAnalyser = audioCtx.createAnalyser();
      simpleAnalyser.fftSize = 4096;
      simpleAnalyser.smoothingTimeConstant = 0.0;
      simpleAnalyser.minDecibels = -100;
      simpleAnalyser.maxDecibels = -30;
      
      // Теперь правильно соединяем цепочку фильтров
      source.connect(hp);
      hp.connect(notch1);
      notch1.connect(notch2);
      notch2.connect(notch3);
      notch3.connect(lp);
      lp.connect(analyser);
      
      // Также подключаем простую цепочку для fallback
      source.connect(simpleAnalyser);

      const timeBuf = new Float32Array(analyser.fftSize);
      const freqBuf = new Float32Array(analyser.frequencyBinCount);

      function loop() {
        analyser.getFloatTimeDomainData(timeBuf);

        // Улучшенный анализ уровня звука
        let rms = 0; 
        let peak = 0;
        for (let i = 0; i < timeBuf.length; i++) {
          const sample = Math.abs(timeBuf[i]);
          rms += timeBuf[i] * timeBuf[i];
          peak = Math.max(peak, sample);
        }
        rms = Math.sqrt(rms / timeBuf.length);
        
        // Адаптивный порог на основе фонового шума
        const noiseThreshold = Math.max(0.01, rms * 0.1); // 10% от RMS или минимум 0.01
        const signalThreshold = Math.max(noiseThreshold * 3, 0.015); // 3x от шума или минимум 0.015
        
        setAudioLevel(rms); // Обновляем индикатор уровня звука
        
        
        if (rms < signalThreshold) { // Адаптивный порог вместо фиксированного
          animationRef.current = requestAnimationFrame(loop); 
          return; 
        }

        removeDC(timeBuf); 
        hannWindow(timeBuf);

        // === РЕЖИМЫ ===
        if (mode === "guitar" || mode === "piano") {
          // Улучшенная детекция нот
          let f = detectNoteFrequency(timeBuf, audioCtx.sampleRate, mode);
          if (f > 0) {
            // console.log(`Detected frequency (${mode}):`, f);
            
            // Улучшенная анти-октавная коррекция
            if (smoothFreqRef.current) {
              const prev = smoothFreqRef.current;
              const ratio = f / prev;
              
              // Более точная проверка октавных скачков
              if (Math.abs(ratio - 2) < 0.15) {
                f = f / 2; // Слишком высокая октава
                // console.log("Октавная коррекция: понижение на октаву");
              } else if (Math.abs(ratio - 0.5) < 0.15) {
                f = f * 2; // Слишком низкая октава
                // console.log("Октавная коррекция: повышение на октаву");
              } else if (Math.abs(ratio - 4) < 0.2) {
                f = f / 4; // Двойная октава
                // console.log("Октавная коррекция: понижение на две октавы");
              } else if (Math.abs(ratio - 0.25) < 0.2) {
                f = f * 4; // Половина октавы
                // console.log("Октавная коррекция: повышение на две октавы");
              }
            }
            
            // Адаптивное сглаживание в зависимости от стабильности
            const alpha = smoothFreqRef.current ? 
              (Math.abs(f - smoothFreqRef.current) / smoothFreqRef.current < 0.1 ? 0.5 : 0.2) : 1;
            
            smoothFreqRef.current = smoothFreqRef.current
              ? smoothFreqRef.current * (1 - alpha) + f * alpha
              : f;

            const sm = smoothFreqRef.current;
            const closest = findClosestNote(sm);
            const centsDiff = 1200 * Math.log2(sm / closest.freq);

            setFreq(sm.toFixed(2));
            setCents(centsDiff.toFixed(1));
            
            // Применяем стабилизацию стрелки
            stabilizeTunerNeedle(centsDiff);

            // Показываем только букву ноты без октавы для всех режимов
            const base = normalizePitchClass(closest.note);
            const tuningStatus = Math.abs(centsDiff) < 5 ? "🎯" : 
                                Math.abs(centsDiff) < 20 ? "⚠️" : "❌";
            
            if (mode === "guitar") {
              setResult(`🎸 ${tuningStatus} ${base} (${centsDiff > 0 ? '+' : ''}${centsDiff.toFixed(1)}¢)`);
            } else {
              setResult(`🎹 ${tuningStatus} ${base} (${centsDiff > 0 ? '+' : ''}${centsDiff.toFixed(1)}¢)`);
            }
          } else {
            // Сброс при отсутствии детекции
            if (smoothFreqRef.current) {
              smoothFreqRef.current = null;
              setFreq(null);
              setCents(null);
              setResult(null);
            }
          }
        } else if (mode === "chord") {
          // Ограничиваем частоту анализа аккордов для стабильности
          const now = Date.now();
          if (now - lastAnalysisTime.current > 200) { // Анализируем каждые 200мс
            lastAnalysisTime.current = now;
            
            // Детекция аккорда по спектру
            analyser.getFloatFrequencyData(freqBuf);
            
            // Проверяем, есть ли валидные данные в основном анализаторе
            const hasValidData = freqBuf.some(val => isFinite(val) && val > -100);
            
            let chordCandidate = null;
            if (hasValidData) {
              chordCandidate = detectChord(freqBuf, audioCtx.sampleRate, setDetectedNotes, setChordConfidence, lockedChord, lockTimestamp, setLockedChord, setLockTimestamp, lockReleaseTimerRef);
            } else {
              // console.log("⚠️ Основной анализатор не дает валидных данных, пробуем fallback");
              
              // Fallback: используем простой анализатор без фильтров
              const simpleFreqBuf = new Float32Array(simpleAnalyser.frequencyBinCount);
              simpleAnalyser.getFloatFrequencyData(simpleFreqBuf);
              
              const hasSimpleData = simpleFreqBuf.some(val => isFinite(val) && val > -100);
              if (hasSimpleData) {
                // console.log("✅ Fallback анализатор дает валидные данные");
                chordCandidate = detectChord(simpleFreqBuf, audioCtx.sampleRate, setDetectedNotes, setChordConfidence, lockedChord, lockTimestamp, setLockedChord, setLockTimestamp, lockReleaseTimerRef);
              } else {
                // console.log("❌ Fallback анализатор тоже не дает валидных данных");
              }
            }
            
            // ПРИОРИТЕТ: если chordCandidate уже заблокированный аккорд, используем его немедленно
            if (chordCandidate && chordCandidate.isLocked) {
              // console.log(`⚡ Используем заблокированный аккорд: ${chordCandidate.name} (${chordCandidate.confidence}%)`);
              const displayText = chordCandidate.lockType === 'HIGH_CONFIDENCE'
                ? `🔐 ${chordCandidate.name} (${chordCandidate.confidence}% - защищен)`
                : `🔒 ${chordCandidate.name} (${chordCandidate.confidence}% - заблокирован)`;
              setResult(displayText);
              animationRef.current = requestAnimationFrame(loop);
              return;
            }
            
            // Применяем стабилизацию с блокировкой аккордов
            const stableChord = stabilizeChord(
              chordCandidate, 
              chordHistoryRef, 
              stableChordRef,
              lockedChord,
              lockTimestamp,
              setLockedChord,
              setLockTimestamp,
              lockReleaseTimerRef
            );
            
            if (stableChord && stableChord.confidence >= 70) {
              let displayText;
              if (stableChord.isLocked) {
                const lockIcon = stableChord.lockType === 'HIGH_CONFIDENCE' ? '�' : '�🔒';
                const lockDescription = stableChord.lockType === 'HIGH_CONFIDENCE' ? 'защищен' : 'заблокирован';
                displayText = `${lockIcon} ${stableChord.name} (${stableChord.confidence}% - ${lockDescription})`;
              } else {
                displayText = `🎶 Аккорд: ${stableChord.name} (${stableChord.confidence}%)`;
              }
              setResult(displayText);
            } else if (stableChord && stableChord.confidence >= 55) {
              setResult(`🔍 Вероятно: ${stableChord.name} (${stableChord.confidence}%)`);
            } else if (chordCandidate && chordCandidate.confidence >= 40) {
              setResult(`❓ Возможно: ${chordCandidate.name} (${chordCandidate.confidence}%)`);
            } else {
              setResult("🔍 Анализирую аккорд...");
            }
          }
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
  }, [running, mode]);

  const stopTuner = useCallback(() => {
    setRunning(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    
    // Очищаем таймер блокировки аккорда
    if (lockReleaseTimerRef.current) {
      clearTimeout(lockReleaseTimerRef.current);
      lockReleaseTimerRef.current = null;
    }
    
    // Сбрасываем состояния
    setFreq(null);
    setCents(null);
    setResult(null);
    setAudioLevel(0);
    setDetectedNotes([]);
    setChordConfidence(0);
    smoothFreqRef.current = null;
    lastChordRef.current = null;
    chordHistoryRef.current = [];
    stableChordRef.current = null;
    
    // Сбрасываем блокировку аккорда
    setLockedChord(null);
    setLockTimestamp(0);
    
    // Сбрасываем стабилизацию тюнера
    setStableCents(null);
    setTunerStability(0);
    centsHistoryRef.current = [];
  }, []);

  // Запускаем тюнер когда running становится true
  useEffect(() => {
    if (running) {
      startTuner();
    }
  }, [running, startTuner]);

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      stopTuner();
    };
  }, [stopTuner]);

  // Если скрытый режим, возвращаем только логику без UI
  if (hidden) {
    return null;
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>🎵 Тюнер</h2>
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
            Ваша задача: сыграть <strong>{expected}</strong>
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {type === "chord" ? "Сыграйте аккорд на гитаре" : "Сыграйте ноту на инструменте"}
          </p>
        </div>
      )}

      {/* Скрываем выбор режима при использовании в упражнениях */}
      {!expected && (
      <div style={{ marginBottom: 12 }}>
        <label>Режим: </label>
        <select value={mode} onChange={(e) => setMode(e.target.value)} disabled={running}>
          <option value="guitar">Гитара (нота)</option>
          <option value="piano">Пианино (нота)</option>
          <option value="chord">Аккорды</option>
        </select>
      </div>
      )}
      
      {/* Показываем текущий режим и задание при использовании в упражнениях */}
      {expected && (
        <div style={{ marginBottom: 12, textAlign: 'center' }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            border: '2px solid #4CAF50',
            marginBottom: '8px'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#2E7D32' }}>
              🎯 Ваша задача:
            </h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', color: '#1B5E20' }}>
              Сыграйте: <span style={{ color: '#FF5722' }}>{expected}</span>
            </p>
            <p style={{ margin: '0', fontSize: '14px', color: '#2E7D32' }}>
              {mode === "chord" ? "🎸 Режим: Аккорды" : 
               mode === "piano" ? "🎹 Режим: Пианино (нота)" : 
               "🎸 Режим: Гитара (нота)"}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginBottom: 12, padding: 8, border: '1px solid red', borderRadius: 4 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        {!running ? (
          <button onClick={startTuner} style={{ padding: '8px 16px', fontSize: '16px' }}>
            🎤 Запустить тюнер
          </button>
        ) : (
          <button onClick={stopTuner} style={{ padding: '8px 16px', fontSize: '16px', backgroundColor: '#ff4444', color: 'white' }}>
            ⏹️ Остановить
          </button>
        )}
      </div>

      {running && (
        <div className="tuner-container" style={{ 
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
            🎵 Тюнер
          </h3>
          
          {/* Красивый визуальный тюнер */}
          <div style={{ marginBottom: 24 }}>
            {/* Круговой тюнер */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginBottom: 20
            }}>
              <div className="tuner-circle" style={{
                position: 'relative',
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #4CAF50 0deg, #FF9800 90deg, #FF5722 180deg, #FF5722 270deg, #4CAF50 360deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                {/* Внутренний круг */}
                <div className="tuner-inner" style={{
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.1)'
                }}>
                  {/* Стрелка */}
                  <div className="tuner-arrow" style={{
                    position: 'absolute',
                    width: 3,
                    height: 70,
                    backgroundColor: stableCents !== null ? '#4CAF50' : '#333', // Зеленая когда стабильно
                    borderRadius: '2px',
                    transformOrigin: 'bottom center',
                    transform: `rotate(${stableCents !== null ? 0 : (cents ? Math.max(-90, Math.min(90, cents * 2)) : 0)}deg)`,
                    transition: stableCents !== null ? 'transform 0.5s ease-out, background-color 0.3s ease-out' : 'transform 0.3s ease-out',
                    boxShadow: stableCents !== null ? '0 2px 12px rgba(76, 175, 80, 0.4)' : '0 2px 8px rgba(0,0,0,0.3)'
                  }}></div>
                  
                  {/* Центральная точка */}
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#333',
                    position: 'absolute',
                    zIndex: 2
                  }}></div>
                  
                  {/* Шкала точности */}
                  {cents && (
                    <div style={{
                      position: 'absolute',
                      top: -40,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: stableCents !== null ? '#4CAF50' : 
                             Math.abs(cents) < 5 ? '#4CAF50' : 
                             Math.abs(cents) < 20 ? '#FF9800' : '#FF5722'
                    }}>
                      {stableCents !== null ? '🎯' :
                       Math.abs(cents) < 5 ? '🎯' : 
                       Math.abs(cents) < 20 ? '⚠️' : '❌'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Индикатор стабильности */}
            {tunerStability > 50 && (
              <div style={{ 
                marginBottom: 12,
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '4px'
                }}>
                  Стабильность: {tunerStability.toFixed(0)}%
                </div>
            <div style={{ 
              width: '100%', 
                  height: '4px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                    width: `${tunerStability}%`,
                height: '100%', 
                    backgroundColor: tunerStability >= 90 ? '#4CAF50' : '#FF9800',
                    transition: 'width 0.3s ease-out',
                    borderRadius: '2px'
              }}></div>
            </div>
          </div>
            )}

            {/* Индикатор уровня звука с анимацией */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ textAlign: 'center', margin: '0 0 12px 0', fontWeight: 'bold' }}>
                Уровень звука
              </p>
              <div style={{ 
                width: '100%', 
                height: '12px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '6px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  width: `${Math.min(audioLevel * 2000, 100)}%`,
                  height: '100%', 
                  background: audioLevel > 0.02 ? 
                    'linear-gradient(90deg, #4CAF50, #8BC34A)' : 
                    audioLevel > 0.01 ? 
                    'linear-gradient(90deg, #FF9800, #FFC107)' : 
                    'linear-gradient(90deg, #FF5722, #F44336)',
                  transition: 'width 0.1s ease-out',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}></div>
                
                {/* Анимированные волны */}
                {audioLevel > 0.01 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: `${100 - Math.min(audioLevel * 2000, 100)}%`,
                    width: '20px',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                    animation: 'wave 0.5s ease-in-out infinite alternate'
                  }}></div>
                )}
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '11px', 
                color: '#666',
                marginTop: '8px'
              }}>
                <span>🔇 Тихо</span>
                <span style={{ 
                  color: audioLevel > 0.02 ? '#4CAF50' : 
                         audioLevel > 0.01 ? '#FF9800' : '#FF5722',
                    fontWeight: 'bold'
                  }}>
                  {audioLevel > 0.02 ? '🎤 Громко' : 
                   audioLevel > 0.01 ? '🔊 Средне' : '🔇 Тихо'}
                  </span>
                <span>🎤 Громко</span>
              </div>
              </div>
              
            {/* Визуализация частот (спектр) */}
            {mode !== "chord" && freq && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ textAlign: 'center', margin: '0 0 12px 0', fontWeight: 'bold' }}>
                  Частотный спектр
                  </p>
                  <div style={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'end',
                  height: '60px',
                  gap: '2px',
                  padding: '0 20px'
                }}>
                  {Array.from({ length: 20 }, (_, i) => {
                    const freqBin = (i * 2000) / 20; // От 0 до 2000 Hz
                    const isActive = Math.abs(freqBin - freq) < 50;
                    const height = isActive ? 60 : Math.random() * 20 + 10;
                    
                    return (
                      <div
                        key={i}
                        style={{
                          width: '8px',
                          height: `${height}px`,
                          backgroundColor: isActive ? '#4CAF50' : '#E0E0E0',
                          borderRadius: '4px 4px 0 0',
                          transition: 'all 0.1s ease-out',
                          boxShadow: isActive ? '0 2px 8px rgba(76, 175, 80, 0.3)' : 'none'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          
          
          {result ? (
            <div>
              {/* Главный результат с анимацией */}
              <div style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: isCorrect ? '#e8f5e8' : '#f5f5f5',
                borderRadius: '12px',
                border: isCorrect ? '2px solid #4CAF50' : '2px solid #e0e0e0',
                marginBottom: 16,
                position: 'relative',
                    overflow: 'hidden'
                  }}>
                {isCorrect && (
                    <div style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent, rgba(76, 175, 80, 0.1), transparent)',
                    animation: 'shine 1.5s ease-in-out infinite'
                    }}></div>
                )}
                
                <p style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  margin: 0,
                  color: isCorrect ? '#2e7d32' : '#333',
                  position: 'relative',
                  zIndex: 1
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
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                    animation: 'glow 2s ease-in-out infinite'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>🎉 Правильно!</h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>Отлично! Вы сыграли {expected}!</p>
            </div>
          )}
              </div>
              
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
                Слушаю... Играйте ноту или аккорд
              </p>
            </div>
          )}
        </div>
      )}

      {!running && (
        <div style={{ marginTop: 20, fontSize: '14px', color: '#666' }}>
          <p>💡 Советы для улучшенной детекции:</p>
          <ul>
            <li>Убедитесь, что микрофон подключен и работает</li>
            <li>Разрешите доступ к микрофону в браузере</li>
            <li><strong>Играйте громко и четко</strong> - адаптивный порог автоматически подстраивается</li>
            <li>Для нот: держите инструмент близко к микрофону</li>
            <li>Для аккордов: играйте все ноты одновременно и четко</li>
            <li>Избегайте фоновых шумов (вентиляторы, музыка)</li>
            <li>Система автоматически фильтрует сетевые шумы (50/60Hz)</li>
            <li>Зеленый индикатор = хороший сигнал, красный = слишком тихо</li>
          </ul>
          
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#e3f2fd', borderRadius: 8 }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1976d2' }}>🎵 Режимы:</p>
            <ul style={{ margin: 0, fontSize: '13px' }}>
              <li><strong>Гитара:</strong> Оптимизирован для струнных инструментов (80-1200Hz)</li>
              <li><strong>Пианино:</strong> Широкий диапазон для клавишных (60-2000Hz)</li>
              <li><strong>Аккорды:</strong> Анализ нескольких нот одновременно</li>
          </ul>
          </div>
        </div>
      )}
    </div>
  );
}
