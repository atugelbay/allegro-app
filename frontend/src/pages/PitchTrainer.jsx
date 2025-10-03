import { useRef, useState, useEffect } from "react";

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
  
  console.log(`🔍 Валидация ${chordName}: корень=${hasRoot}, терция=${hasThird}, квинта=${hasFifth}`);
  
  // ОСЛАБЛЕННЫЕ КРИТЕРИИ: достаточно корня ИЛИ терции для базовой валидации
  if (!hasRoot && !hasThird) {
    console.log(`❌ ${chordName}: отсутствуют базовые компоненты`);
    return { isValid: false, confidence: 0 };
  }
  
  // Проверяем правильность терции ТОЛЬКО если она найдена
  let thirdValidation = true;
  if (hasThird && hasRoot) {
    const thirdType = getThirdType(root, requiredNotes[1], fundamentalPeaks);
    const expectedThirdType = isMinor ? 'minor' : 'major';
    
    if (thirdType && thirdType !== expectedThirdType) {
      console.log(`⚠️ ${chordName}: неидеальный тип терции (ожидалось ${expectedThirdType}, найдено ${thirdType})`);
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
  
  console.log(`✅ ${chordName}: валидирован с уверенностью ${confidence}%`);
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

// ===== Подавление гармоник - улучшенная версия для гитары =====
function suppressHarmonics(peaks) {
  // Сортируем по частоте
  const sorted = [...peaks].sort((a, b) => a.freq - b.freq);
  const fundamental = [];
  
  // Открытые струны гитары - они могут звучать как басовые частоты
  const guitarOpenStrings = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63]; // E A D G B E
  
  for (const peak of sorted) {
    let isHarmonic = false;
    
    // Проверяем, является ли эта частота гармоникой уже найденной фундаментальной
    for (const fund of fundamental) {
      const ratio = peak.freq / fund.freq;
      // Для гитары используем более точные критерии гармоник
      if (Math.abs(ratio - Math.round(ratio)) < 0.08 && Math.round(ratio) >= 2 && Math.round(ratio) <= 6) {
        // Дополнительная проверка: сильные гармоники (2я, 3я) подавляются строже
        if (Math.round(ratio) <= 3 && Math.abs(ratio - Math.round(ratio)) < 0.05) {
          isHarmonic = true;
          break;
        } else if (Math.round(ratio) > 3 && Math.abs(ratio - Math.round(ratio)) < 0.08) {
          isHarmonic = true;
          break;
        }
      }
    }
    
    // Особая обработка для открытых струн гитары - они важны для аккордов
    const isOpenString = guitarOpenStrings.some(openFreq => 
      Math.abs(peak.freq - openFreq) < 3.0 // Небольшая погрешность для расстройки
    );
    
    if (!isHarmonic || isOpenString) {
      fundamental.push(peak);
      // Для открытых струн добавляем бонус к амплитуде
      if (isOpenString) {
        peak.amp *= 1.2;
        console.log(`🎸 Обнаружена открытая струна: ${peak.freq.toFixed(1)}Hz`);
      }
    }
  }
  
  // Возвращаем максимум 10 фундаментальных частот для гитары (больше чем для пианино)
  return fundamental.sort((a, b) => b.amp - a.amp).slice(0, 10);
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
    console.log(`🔒 БЛОКИРОВКА аккорда ${detectedChord.name} с уверенностью ${confidence}% на ${lockDuration}мс (тип: ${lockType})`);
    
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
      console.log(`🔓 Автоматический сброс блокировки аккорда (${lockType})`);
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
    
    console.log(`${lockIcon} Аккорд ${lockedChord.name} заблокирован (${lockedChord.lockType}, осталось ${timeLeft}мс)`);
    
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
    console.log(`✅ Стабилизированный аккорд: ${candidateChord.name} (${recentMatches.length} подтверждений)`);
    
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
          console.log(`🎸 Бонус за открытую струну ${note}: +30`);
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
    console.log(`🎸 Бонус за басовую ноту ${root}: +25`);
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
      console.log(`🎸 Бонус за полный гитарный паттерн ${chordName}: +40`);
    }
  }
  
  return bonus;
}

// ===== Улучшенная детекция аккордов с мягким матчем и подавлением гармоник =====
function yinPitch(buf, sampleRate, minFreq = 70, maxFreq = 1200, threshold = 0.1) {
  const tauMin = Math.floor(sampleRate / maxFreq);
  const tauMax = Math.floor(sampleRate / minFreq);
  const yin = new Float32Array(tauMax + 1);

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

  let tauEst = -1;
  for (let tau = tauMin; tau <= tauMax; tau++) {
    if (yin[tau] < threshold) {
      while (tau + 1 <= tauMax && yin[tau + 1] < yin[tau]) tau++;
      tauEst = tau;
      break;
    }
  }
  if (tauEst <= 0) return -1;

  const x0 = tauEst - 1 >= 1 ? tauEst - 1 : tauEst;
  const x2 = tauEst + 1 <= tauMax ? tauEst + 1 : tauEst;
  const s0 = yin[x0], s1 = yin[tauEst], s2 = yin[x2];
  let betterTau = tauEst;
  const denom = (s2 + s0 - 2 * s1);
  if (denom !== 0) betterTau = tauEst + (s2 - s0) / (2 * denom);

  const f = sampleRate / betterTau;
  return (f < minFreq || f > maxFreq) ? -1 : f;
}

// ===== Улучшенная детекция аккордов с мягким матчем и подавлением гармоник =====
function detectChord(freqBuf, sampleRate, setDetectedNotes, setChordConfidence, lockedChord, lockTimestamp, setLockedChord, setLockTimestamp, lockReleaseTimerRef) {
  // ПРИОРИТЕТНАЯ ПРОВЕРКА: если уже есть заблокированный аккорд с высокой уверенностью, не перезаписываем его
  if (lockedChord && isChordLocked(lockedChord, lockTimestamp) && lockedChord.originalConfidence >= 91) {
    console.log(`🛡️ ЗАЩИТА: ${lockedChord.name} уже заблокирован с высокой уверенностью ${lockedChord.originalConfidence}%, пропускаем новый анализ`);
    return {
      name: lockedChord.name,
      confidence: lockedChord.originalConfidence,
      isLocked: true,
      lockType: lockedChord.lockType
    };
  }
  
  const peaks = [];
  
  // Более строгая фильтрация пиков
  for (let i = 5; i < freqBuf.length - 5; i++) {
    // Проверяем, что это действительно выдающийся пик
    const isStrongPeak = freqBuf[i] > freqBuf[i-1] && freqBuf[i] > freqBuf[i+1] && 
                        freqBuf[i] > freqBuf[i-2] && freqBuf[i] > freqBuf[i+2] &&
                        freqBuf[i] > freqBuf[i-3] && freqBuf[i] > freqBuf[i+3];
    
    if (isStrongPeak && freqBuf[i] > -60) { // Увеличиваем порог до -60дБ для анализа только громких звуков
      const freq = (i * sampleRate) / (freqBuf.length * 2);
      if (freq > 80 && freq < 1000) { // Музыкальный диапазон
        peaks.push({ freq, amp: freqBuf[i] });
      }
    }
  }

  // Сортируем по амплитуде и берем сильные пики
  peaks.sort((a, b) => b.amp - a.amp);
  const strongPeaks = peaks.slice(0, 20).filter(p => p.amp > -55); // Увеличиваем порог до -55дБ для громких звуков
  
  // Подавляем гармоники - оставляем только фундаментальные частоты
  const fundamentalPeaks = suppressHarmonics(strongPeaks);
  
  console.log(`Анализ завершен. Исходных пиков: ${peaks.length}, Сильных: ${strongPeaks.length}, Фундаментальных: ${fundamentalPeaks.length}`);
  
  const strong = fundamentalPeaks.map(p => ({
    note: normalizePitchClass(findClosestNote(p.freq).note),
    amp: p.amp,
    freq: p.freq
  }));

  const names = [...new Set(strong.map(n => n.note))];
  console.log("🎵 Найденные фундаментальные ноты:", names);
  console.log("📊 Детали частот:", strong.map(s => `${s.note}=${s.freq.toFixed(1)}Hz`).join(', '));
  
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
        console.log(`❌ Аккорд ${chord} не прошел валидацию`);
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
        
        console.log(`🎵 Анализ ${chord}: корень=${root}, терция=${expectedThird}, тип терции=${thirdType}`);
        
        if (isMinorChord) {
          // Для минорных аккордов требуем малую терцию
          if (thirdType === 'minor') {
            matchScore += 150; // Бонус за правильную минорную терцию
            console.log(`✅ Подтвержден минорный аккорд ${chord} с малой терцией`);
          } else if (thirdType === 'major') {
            matchScore -= 50; // Уменьшаем штраф со 150 до 50
            console.log(`⚠️ ${chord}: найдена большая терция вместо малой`);
          }
        } else {
          // Для мажорных аккордов требуем большую терцию
          if (thirdType === 'major') {
            matchScore += 120; // Бонус за правильную мажорную терцию
            console.log(`✅ Подтвержден мажорный аккорд ${chord} с большой терцией`);
          } else if (thirdType === 'minor') {
            matchScore -= 50; // Уменьшаем штраф со 150 до 50
            console.log(`⚠️ ${chord}: найдена малая терция вместо большой`);
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
              console.log(`⚠️ Конфликт: ${conflictingChord} может быть более подходящим`);
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
      
      console.log(`🎼 Кандидат аккорда: ${chord} (совпадений: ${matches.length}/${requiredNotes.length}, финальный счет: ${totalScore.toFixed(1)})`);
      console.log(`   Требуемые ноты: [${requiredNotes.join(', ')}]`);
      console.log(`   Найденные ноты: [${matches.join(', ')}]`);
      
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
          
          console.log(`🔍 Конфликт между ${bestChord} (валидация: ${bestValidation.confidence}%) и ${conflictingChord} (валидация: ${conflictValidation.confidence}%)`);
          
          // Если конфликтующий аккорд имеет лучшую валидацию, выбираем его
          if (conflictValidation.isValid && conflictValidation.confidence > bestValidation.confidence + 10) {
            console.log(`🔄 Переключение с ${bestChord} на ${conflictingChord} из-за лучшей валидации`);
            bestChord = conflictingChord;
            bestScore = conflictScore;
            bestMatches = conflictMatches;
          } else if (!conflictValidation.isValid || bestValidation.confidence > conflictValidation.confidence + 5) {
            // Оставляем текущий лучший выбор, но снижаем уверенность при близкой конкуренции
            bestScore = Math.max(bestScore - 30, 150);
            console.log(`⚠️ Снижена уверенность для ${bestChord} из-за конкуренции с ${conflictingChord}`);
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
      console.log(`🎸 Бонус к уверенности за гитарные паттерны: +10`);
    }
    
    confidence = Math.max(50, Math.min(95, confidence)); // Ограничиваем диапазон
    
    // МГНОВЕННАЯ БЛОКИРОВКА для высокоуверенных результатов (91%+)
    if (confidence >= 91) {
      console.log(`⚡ МГНОВЕННАЯ БЛОКИРОВКА: ${bestChord} с уверенностью ${confidence}% - фиксируем немедленно!`);
      
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
    
    console.log(`🎯 ИТОГОВЫЙ РЕЗУЛЬТАТ: ${bestChord} с уверенностью ${confidence}% (финальный счет: ${bestScore.toFixed(1)})`);
    console.log(`   Совпавшие ноты: [${bestMatches.join(', ')}]`);
    console.log(`   📈 Данные основаны на Wikipedia Piano Key Frequencies (A4=440Hz)`);
    return {
      name: bestChord,
      confidence: confidence,
      matches: bestMatches,
      score: bestScore
    };
  }

  // ЗАПАСНОЙ АЛГОРИТМ: если строгая валидация не дала результатов, используем упрощенный подход
  console.log("🚨 Строгая валидация не дала результатов, переходим к упрощенному алгоритму");
  
  let fallbackChord = null;
  let fallbackScore = 0;
  
  for (const [chord, requiredNotes] of Object.entries(CHORDS)) {
    const matches = requiredNotes.filter(n => names.includes(n));
    
    if (matches.length >= 1) { // Еще более мягкий критерий - хотя бы одна нота
      let score = matches.length * 50; // Базовый счет
      
      // Бонус за силу сигнала
      const amplitudeBonus = strong
        .filter(n => matches.includes(n.note))
        .reduce((sum, n) => sum + Math.abs(n.amp) * 2, 0);
      
      const totalScore = score + amplitudeBonus;
      
      if (totalScore > fallbackScore) {
        fallbackScore = totalScore;
        fallbackChord = chord;
      }
    }
  }
  
  if (fallbackChord && fallbackScore > 30) {
    // Улучшенная формула для запасного алгоритма
    let confidence;
    if (fallbackScore >= 150) {
      confidence = Math.min(70, 50 + Math.round((fallbackScore - 150) / 10));
    } else if (fallbackScore >= 100) {
      confidence = Math.min(60, 40 + Math.round((fallbackScore - 100) / 5));
    } else {
      confidence = Math.min(50, 30 + Math.round((fallbackScore - 30) / 3));
    }
    
    if (setChordConfidence) {
      setChordConfidence(confidence);
    }
    
    console.log(`🎯 ЗАПАСНОЙ РЕЗУЛЬТАТ: ${fallbackChord} с уверенностью ${confidence}% (упрощенный алгоритм)`);
    return {
      name: fallbackChord,
      confidence: confidence,
      matches: [],
      score: fallbackScore
    };
  }

  // Сбрасываем уверенность если ничего не найдено
  if (setChordConfidence) {
    setChordConfidence(0);
  }

  return null;
}


export default function PitchTrainer({ expected, type, onSuccess, onCancel }) {
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

  const audioCtxRef = useRef(null);
  const smoothFreqRef = useRef(null);
  const lastChordRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const lastAnalysisTime = useRef(0); // Для ограничения частоты анализа аккордов
  const chordHistoryRef = useRef([]); // История последних детекций для стабилизации
  const stableChordRef = useRef(null); // Текущий стабильный аккорд
  const lockReleaseTimerRef = useRef(null); // Таймер сброса блокировки аккорда

  // Устанавливаем режим на основе типа упражнения
  useEffect(() => {
    if (type === "chord") {
      setMode("chord");
    } else if (type === "note") {
      setMode("guitar"); // По умолчанию гитара для нот
    }
  }, [type]);

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

  const startTuner = async () => {
    if (running) return;
    
    try {
      setError(null);
      console.log("Starting tuner...");
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      await audioCtx.resume();
      console.log("Audio context resumed");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log("Microphone access granted");
      
      const source = audioCtx.createMediaStreamSource(stream);

      // Создаем analyser сначала
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 4096;                    // ↑ разрешение
      analyser.smoothingTimeConstant = 0.0;       // без усреднения — нам важны пики
      analyser.minDecibels = -100;
      analyser.maxDecibels = -30;

      // Band-pass фильтры с улучшенными настройками для подавления шумов
      const hp = audioCtx.createBiquadFilter();
      hp.type = "highpass"; 
      hp.frequency.value = 120; // Повышаем до 120Hz для фильтрации шума вентилятора
      hp.Q.value = 0.7; // Добавляем Q-factor для более резкого среза

      const lp = audioCtx.createBiquadFilter();
      lp.type = "lowpass"; 
      lp.frequency.value = 1500; // Снижаем до 1500Hz - большинство музыкальных аккордов в этом диапазоне
      lp.Q.value = 0.7;
      
      // Добавляем дополнительный notch-фильтр на частоте шума вентилятора (обычно 50-60Hz)
      const notch = audioCtx.createBiquadFilter();
      notch.type = "notch";
      notch.frequency.value = 60; // Убираем частоту сетевого шума/вентилятора
      notch.Q.value = 10; // Узкий notch

      // Теперь правильно соединяем цепочку
      source.connect(hp);
      hp.connect(notch);
      notch.connect(lp);
      lp.connect(analyser);

      const timeBuf = new Float32Array(analyser.fftSize);
      const freqBuf = new Float32Array(analyser.frequencyBinCount);

      function loop() {
        analyser.getFloatTimeDomainData(timeBuf);

        // шум- и тишина-гейт
        let rms = 0; 
        for (let i = 0; i < timeBuf.length; i++) rms += timeBuf[i] * timeBuf[i];
        rms = Math.sqrt(rms / timeBuf.length);
        
        setAudioLevel(rms); // Обновляем индикатор уровня звука
        
        if (rms < 0.025) { // Увеличиваем порог до 0.025 (примерно 85% громкости) для точной детекции
          animationRef.current = requestAnimationFrame(loop); 
          return; 
        }

        removeDC(timeBuf); 
        hannWindow(timeBuf);

        // === РЕЖИМЫ ===
        if (mode === "guitar" || mode === "piano") {
          // YIN для одиночных нот
          let f = yinPitch(timeBuf, audioCtx.sampleRate);
          if (f > 0) {
            console.log("Detected frequency:", f);
            
            // анти-октавные скачки
            if (smoothFreqRef.current) {
              const prev = smoothFreqRef.current, ratio = f / prev;
              if (Math.abs(ratio - 2) < 0.1) f = f / 2;
              else if (Math.abs(ratio - 0.5) < 0.1) f = f * 2;
            }
            // сглаживание
            const alpha = 0.3;
            smoothFreqRef.current = smoothFreqRef.current
              ? smoothFreqRef.current * (1 - alpha) + f * alpha
              : f;

            const sm = smoothFreqRef.current;
            const closest = findClosestNote(sm);
            const centsDiff = 1200 * Math.log2(sm / closest.freq);

            setFreq(sm.toFixed(2));
            setCents(centsDiff.toFixed(1));

            // Показываем только букву ноты без октавы для всех режимов
            const base = normalizePitchClass(closest.note);
            if (mode === "guitar") {
              setResult(`🎸 Нота: ${base}`);
            } else {
              setResult(`🎹 Нота: ${base}`);
            }
          }
        } else if (mode === "chord") {
          // Ограничиваем частоту анализа аккордов для стабильности
          const now = Date.now();
          if (now - lastAnalysisTime.current > 200) { // Анализируем каждые 200мс
            lastAnalysisTime.current = now;
            
            // Детекция аккорда по спектру
            analyser.getFloatFrequencyData(freqBuf);
            const chordCandidate = detectChord(freqBuf, audioCtx.sampleRate, setDetectedNotes, setChordConfidence, lockedChord, lockTimestamp, setLockedChord, setLockTimestamp, lockReleaseTimerRef);
            
            // ПРИОРИТЕТ: если chordCandidate уже заблокированный аккорд, используем его немедленно
            if (chordCandidate && chordCandidate.isLocked) {
              console.log(`⚡ Используем заблокированный аккорд: ${chordCandidate.name} (${chordCandidate.confidence}%)`);
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
      console.log("Tuner started successfully");
      
    } catch (err) {
      console.error("Error starting tuner:", err);
      setError(`Ошибка: ${err.message}. Убедитесь, что микрофон подключен и разрешен доступ.`);
      setRunning(false);
    }
  };

  const stopTuner = () => {
    console.log("Stopping tuner...");
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
    
    console.log("Tuner stopped");
  };

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      if (running) {
        stopTuner();
      }
    };
  }, [running]);

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

      <div style={{ marginBottom: 12 }}>
        <label>Режим: </label>
        <select value={mode} onChange={(e) => setMode(e.target.value)} disabled={running}>
          <option value="guitar">Гитара (нота)</option>
          <option value="piano">Пианино (нота)</option>
          <option value="chord">Аккорды</option>
        </select>
      </div>

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
        <div style={{ marginTop: 20, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
          <h3>Результаты:</h3>
          
          {/* Индикатор уровня звука */}
          <div style={{ marginBottom: 16 }}>
            <p><strong>Уровень звука:</strong></p>
            <div style={{ 
              width: '100%', 
              height: '20px', 
              backgroundColor: '#eee', 
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${Math.min(audioLevel * 2000, 100)}%`, // Корректируем для нового порога 85%
                height: '100%', 
                backgroundColor: audioLevel > 0.025 ? '#4CAF50' : '#FF5722', // Обновляем порог индикатора
                transition: 'width 0.1s'
              }}></div>
            </div>
            <small>RMS: {audioLevel.toFixed(4)}</small>
          </div>
          
          {(mode !== "chord") && freq && (
            <>
              <p><strong>Частота:</strong> {freq} Hz</p>
              <p><strong>Отклонение:</strong> {cents} cents</p>
            </>
          )}
          
          {/* Показываем найденные ноты для режима аккордов */}
          {mode === "chord" && detectedNotes.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p><strong>Обнаруженные ноты:</strong></p>
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap',
                marginBottom: '8px'
              }}>
                {detectedNotes.map((note, index) => (
                  <span key={index} style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {note}
                  </span>
                ))}
              </div>
              
              {/* Индикатор уверенности */}
              {chordConfidence > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    <strong>Уверенность: {chordConfidence}%</strong>
                  </p>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: '#eee', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${chordConfidence}%`, 
                      height: '100%', 
                      backgroundColor: chordConfidence >= 75 ? '#4CAF50' : 
                                     chordConfidence >= 60 ? '#FF9800' : '#F44336',
                      transition: 'width 0.3s, background-color 0.3s'
                    }}></div>
                  </div>
                </div>
              )}
              
              <small style={{ color: '#666', fontSize: '12px' }}>
                Найдено: {detectedNotes.length} нот | Требуется громкий звук (85%+ уровня)<br/>
                <span style={{ fontSize: '10px' }}>Частоты аккордов основаны на стандарте A4=440Hz (Wikipedia Piano Key Frequencies)</span>
              </small>
            </div>
          )}
          
          {result ? (
            <div>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{result}</p>
              {isCorrect && (
                <div style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  borderRadius: 8,
                  textAlign: 'center'
                }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>🎉 Правильно!</h3>
                  <p style={{ margin: 0 }}>Отлично! Вы сыграли {expected}!</p>
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontStyle: 'italic' }}>Слушаю... Играйте ноту или аккорд</p>
          )}
        </div>
      )}

      {!running && (
        <div style={{ marginTop: 20, fontSize: '14px', color: '#666' }}>
          <p>💡 Советы:</p>
          <ul>
            <li>Убедитесь, что микрофон подключен и работает</li>
            <li>Разрешите доступ к микрофону в браузере</li>
            <li><strong>Играйте громко</strong> - тюнер реагирует только на сильные сигналы (85%+ громкости)</li>
            <li>Для точного определения аккордов играйте все ноты четко</li>
            <li>Фоновые шумы автоматически фильтруются</li>
          </ul>
        </div>
      )}
    </div>
  );
}
