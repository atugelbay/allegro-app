/**
 * Система воспроизведения аудио для уроков
 * Поддерживает ноты, аккорды и песни
 */

// Импорт SoundFont загрузчиков (будут загружены динамически)
let soundfontLoader = null;
let guitarSoundfontLoader = null;

class AudioPlayer {
  constructor() {
    this.audioContext = null;
    this.gainNode = null;
    this.isInitialized = false;
    this.audioBuffers = new Map(); // Кэш для загруженных аудио файлов
    this.currentSounds = new Set(); // Активные звуки для остановки
    this.shouldStopGlobal = false; // Глобальный флаг остановки
    
    // Инициализируем SoundFont загрузчик
    this.initializeSoundfontLoader();
  }

  /**
   * Инициализирует SoundFont загрузчики
   */
  async initializeSoundfontLoader() {
    try {
      const pianoModule = await import('./soundfontLoader.js');
      soundfontLoader = pianoModule.default;
      console.log('🎹 Акустическое пианино SoundFont загрузчик инициализирован');
      
      const guitarModule = await import('./guitarSoundfontLoader.js');
      guitarSoundfontLoader = guitarModule.default;
      console.log('🎸 Акустическая гитара SoundFont загрузчик инициализирован');
    } catch (error) {
      console.warn('⚠️ Не удалось загрузить SoundFont загрузчики:', error);
    }
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Создаем AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Создаем GainNode для управления громкостью
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.7; // Громкость по умолчанию
      
      this.isInitialized = true;
      console.log('🎵 AudioPlayer инициализирован');
    } catch (error) {
      console.error('Ошибка инициализации AudioPlayer:', error);
      throw error;
    }
  }

  async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Загружает аудио файл и возвращает AudioBuffer
   */
  async loadAudioBuffer(url) {
    if (this.audioBuffers.has(url)) {
      return this.audioBuffers.get(url);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.audioBuffers.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Ошибка загрузки аудио ${url}:`, error);
      throw error;
    }
  }

  /**
   * Создает более реалистичный звук пианино
   */
  createPianoTone(frequency, duration = 1.5) {
    if (!this.isInitialized) {
      throw new Error('AudioPlayer не инициализирован');
    }

    const now = this.audioContext.currentTime;
    const sounds = [];

    // Основной тон (самая громкая)
    const mainOsc = this.audioContext.createOscillator();
    const mainGain = this.audioContext.createGain();
    mainOsc.type = 'triangle';
    mainOsc.frequency.value = frequency;
    
    // Создаем реалистичную огибающую пианино
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(0.4, now + 0.05); // Быстрый атака
    mainGain.gain.exponentialRampToValueAtTime(0.2, now + 0.3); // Спад
    mainGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    mainOsc.connect(mainGain);
    mainGain.connect(this.gainNode);
    
    mainOsc.start(now);
    mainOsc.stop(now + duration);
    sounds.push({ oscillator: mainOsc, gainNode: mainGain });
    
    // Добавляем в активные звуки для отслеживания
    this.currentSounds.add(mainOsc);
    mainOsc.onended = () => {
      this.currentSounds.delete(mainOsc);
    };

    // Добавляем гармоники для богатства звука
    const harmonics = [2, 3, 4, 5];
    harmonics.forEach((harmonic, index) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = frequency * harmonic;
      
      // Гармоники тише основной частоты
      const harmonicVolume = 0.1 / (index + 1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(harmonicVolume, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(harmonicVolume * 0.5, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.8);
      
      osc.connect(gain);
      gain.connect(this.gainNode);
      
      osc.start(now);
      osc.stop(now + duration * 0.8);
      sounds.push({ oscillator: osc, gainNode: gain });
      
      // Добавляем в активные звуки для отслеживания
      this.currentSounds.add(osc);
      osc.onended = () => {
        this.currentSounds.delete(osc);
      };
    });

    // Добавляем небольшой реверберационный эффект
    const reverbOsc = this.audioContext.createOscillator();
    const reverbGain = this.audioContext.createGain();
    const delay = this.audioContext.createDelay();
    
    reverbOsc.type = 'triangle';
    reverbOsc.frequency.value = frequency * 0.99; // Небольшой детюн для хоруса
    
    delay.delayTime.value = 0.1;
    
    reverbGain.gain.value = 0.05;
    
    reverbOsc.connect(reverbGain);
    reverbGain.connect(delay);
    delay.connect(this.gainNode);
    
    reverbOsc.start(now + 0.1);
    reverbOsc.stop(now + duration * 0.7);
    sounds.push({ oscillator: reverbOsc, gainNode: reverbGain });
    
    // Добавляем в активные звуки для отслеживания
    this.currentSounds.add(reverbOsc);
    reverbOsc.onended = () => {
      this.currentSounds.delete(reverbOsc);
    };

    return sounds;
  }



  /**
   * Создает звук из частоты (для синтетических звуков) - упрощенная версия
   */
  createTone(frequency, duration = 1.0, type = 'sine') {
    if (!this.isInitialized) {
      throw new Error('AudioPlayer не инициализирован');
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    // Настройка огибающей звука
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
    
    return { oscillator, gainNode };
  }

  /**
   * Воспроизводит ноту по названию (например, "C4", "A4")
   */
  async playNote(noteName) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    await this.resumeContext();
    
    const frequency = this.noteToFrequency(noteName);
    if (!frequency) {
      console.warn(`Неизвестная нота: ${noteName}`);
      return null;
    }

    console.log(`🎹 Воспроизведение ноты: ${noteName} (${frequency.toFixed(2)} Hz)`);
    
    // Используем только SoundFont акустическое пианино
    if (soundfontLoader && soundfontLoader.isNoteAvailable(noteName)) {
      try {
        console.log(`🎹 Загружаем акустическое пианино SoundFont для ноты ${noteName}`);
        const soundfontBuffer = await soundfontLoader.loadNoteSample(noteName);
        if (soundfontBuffer) {
          console.log(`✅ Акустическое пианино SoundFont загружен для ${noteName}`);
          return this.playAudioBuffer(soundfontBuffer);
        }
      } catch (soundfontError) {
        console.warn(`SoundFont не помог для ${noteName}:`, soundfontError);
      }
    }
    
    console.warn(`❌ SoundFont недоступен для ${noteName}`);
    return null; // Не проигрываем ничего, если нет SoundFont
  }

  /**
   * Воспроизводит аккорд по названию (например, "C", "Am", "F")
   */
  async playChord(chordName, duration = 2.0, instrument = 'guitar') {
    if (!this.isInitialized) {
      await this.initialize();
    }
    await this.resumeContext();
    
    let notes;
    if (instrument === 'piano') {
      // Для пианино используем 3 ноты (трезвучие)
      notes = this.getChordNotes(chordName);
    } else {
      // Для гитары используем 5 нот (как на реальной гитаре)
      notes = this.getGuitarChordNotes(chordName);
    }
    
    if (!notes || notes.length === 0) {
      console.warn(`Неизвестный аккорд: ${chordName}`);
      return null;
    }

    console.log(`🎸 Воспроизведение аккорда: ${chordName} (${notes.join(', ')}) на ${instrument}`);
    
    if (instrument === 'piano') {
      // Для пианино используем пианино SoundFont
      return this.playChordFromNotes(notes, duration);
    } else {
      // Для гитары используем гитарный SoundFont
      return this.playGuitarChordFromNotes(notes, duration);
    }
  }

  /**
   * Воспроизводит AudioBuffer с усилением громкости и эффектами
   */
  playAudioBuffer(audioBuffer, volumeBoost = 5.5, effects = {}, delay = 0) {
    if (!this.isInitialized) {
      throw new Error('AudioPlayer не инициализирован');
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Создаем цепочку эффектов
    let lastNode = source;
    
    // 1. Усиление громкости
    const volumeGain = this.audioContext.createGain();
    volumeGain.gain.value = volumeBoost;
    
    // 2. Применяем эффекты в правильном порядке
    if (effects.stringVibrato) {
      // Вибрато применяем к исходному сигналу
      const vibratoEffect = this.createVibratoEffect(effects.stringVibrato);
      vibratoEffect.connect(source);
      lastNode = vibratoEffect.output;
    }
    
    // Подключаем громкость
    lastNode.connect(volumeGain);
    lastNode = volumeGain;
    
    if (effects.reverb) {
      // Реверберация
      const reverbEffect = this.createReverbEffect(effects.reverb);
      reverbEffect.connect(lastNode);
      lastNode = reverbEffect.output;
    }
    
    if (effects.echo) {
      // Эхо
      const echoEffect = this.createEchoEffect(effects.echo);
      echoEffect.connect(lastNode);
      lastNode = echoEffect.output;
    }
    
    // Подключаем к основному выходу
    lastNode.connect(this.gainNode);
    
    const now = this.audioContext.currentTime;
    source.start(now + delay);
    
    this.currentSounds.add(source);
    
    // Удаляем из активных звуков после завершения
    source.onended = () => {
      this.currentSounds.delete(source);
    };
    
    return source;
  }

  /**
   * Создает эффект реверберации
   */
  createReverbEffect(intensity = 0.3) {
    const inputGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    
    // Создаем несколько задержек для имитации реверберации
    const delays = [0.1, 0.2, 0.3, 0.5];
    const delayNodes = delays.map(delayTime => {
      const delay = this.audioContext.createDelay(2); // Максимальная задержка 2 секунды
      delay.delayTime.value = delayTime;
      
      const feedbackGain = this.audioContext.createGain();
      feedbackGain.gain.value = intensity * 0.2;
      
      const delayOutputGain = this.audioContext.createGain();
      delayOutputGain.gain.value = intensity * 0.15;
      
      delay.connect(feedbackGain);
      feedbackGain.connect(delay);
      delay.connect(delayOutputGain);
      
      return { delay, delayOutputGain };
    });
    
    // Подключаем задержки параллельно к wet выходу
    delayNodes.forEach(({ delayOutputGain }) => {
      delayOutputGain.connect(wetGain);
    });
    
    // Настраиваем громкости
    wetGain.gain.value = intensity;
    outputGain.gain.value = 1.0;
    
    // Подключаем wet сигнал к выходу
    wetGain.connect(outputGain);
    
    // Возвращаем объект с правильными подключениями
    return {
      input: inputGain,
      output: outputGain,
      connect: (source) => {
        source.connect(inputGain);
        inputGain.connect(outputGain); // Прямой сигнал
        delayNodes.forEach(({ delay }) => {
          inputGain.connect(delay); // Сигнал через задержки
        });
      }
    };
  }

  /**
   * Создает эффект эхо
   */
  createEchoEffect({ delay = 0.3, feedback = 0.02 } = {}) {
    const inputGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();
    const delayNode = this.audioContext.createDelay(2); // Максимальная задержка 2 секунды
    const feedbackGain = this.audioContext.createGain();
    const echoOutputGain = this.audioContext.createGain();
    
    delayNode.delayTime.value = delay;
    feedbackGain.gain.value = feedback;
    echoOutputGain.gain.value = 0.02; // Громкость эхо
    outputGain.gain.value = 0.8;
    
    // Создаем цепочку эхо
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    delayNode.connect(echoOutputGain);
    
    return {
      input: inputGain,
      output: outputGain,
      connect: (source) => {
        source.connect(inputGain);
        inputGain.connect(outputGain); // Прямой сигнал
        inputGain.connect(delayNode); // Сигнал через задержку
        echoOutputGain.connect(outputGain); // Эхо сигнал
      }
    };
  }

  /**
   * Создает эффект вибрации струны
   */
  createVibratoEffect({ speed = 5, depth = 0.02 } = {}) {
    const inputGain = this.audioContext.createGain();
    const outputGain = this.audioContext.createGain();
    const oscillator = this.audioContext.createOscillator();
    const gainModulator = this.audioContext.createGain();
    
    oscillator.frequency.value = speed;
    oscillator.type = 'sine';
    gainModulator.gain.value = depth;
    
    oscillator.connect(gainModulator);
    gainModulator.connect(inputGain.gain); // Модулируем громкость
    
    const now = this.audioContext.currentTime;
    oscillator.start(now);
    
    // Добавляем в отслеживание звуков
    this.currentSounds.add(oscillator);
    
    return {
      input: inputGain,
      output: outputGain,
      connect: (source) => {
        source.connect(inputGain);
        inputGain.connect(outputGain);
      }
    };
  }

  /**
   * Возвращает настройки эффектов для гитары
   */
  getGuitarEffects() {
    return {
      reverb: 0.4, // Умеренная реверберация для гитары
      echo: {
        delay: 0.3,
        feedback: 0.2,
        repetitions: 2
      },
      stringVibrato: {
        speed: 6, // Быстрая вибрация струны
        depth: 0.03
      }
    };
  }

  /**
   * Возвращает настройки эффектов для пианино
   */
  getPianoEffects() {
    return {
      reverb: 0.6, // Более сильная реверберация для пианино (как в концертном зале)
      echo: {
        delay: 0.5,
        feedback: 0.15,
        repetitions: 1
      },
      stringVibrato: {
        speed: 4, // Более медленная вибрация для пианино
        depth: 0.015
      }
    };
  }

  /**
   * Останавливает все активные звуки
   */
  stopAll() {
    // Устанавливаем глобальный флаг остановки
    this.shouldStopGlobal = true;
    
    this.currentSounds.forEach(sound => {
      try {
        if (sound.stop) {
          sound.stop();
        } else if (sound.oscillator) {
          sound.oscillator.stop();
        }
      } catch {
        // Звук уже остановлен
      }
    });
    this.currentSounds.clear();
  }

  /**
   * Сбрасывает глобальный флаг остановки
   */
  resetStopFlag() {
    this.shouldStopGlobal = false;
  }

  /**
   * Проверяет глобальный флаг остановки
   */
  shouldStop() {
    return this.shouldStopGlobal;
  }

  /**
   * Устанавливает громкость (0.0 - 1.0)
   */
  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Преобразует название ноты в частоту
   */
  noteToFrequency(noteName) {
    const noteMap = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };

    const match = noteName.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) return null;

    const [, note, octave] = match;
    const noteIndex = noteMap[note];
    if (noteIndex === undefined) return null;

    const octaveNumber = parseInt(octave);
    const semitonesFromC4 = noteIndex + (octaveNumber - 4) * 12;
    
    // A4 = 440 Hz, каждая октава = удвоение частоты
    return 440 * Math.pow(2, (semitonesFromC4 - 9) / 12);
  }

  /**
   * Возвращает ноты аккорда (для пианино - 3 ноты)
   */
  getChordNotes(chordName) {
    const chordMap = {
      'C': ['C4', 'E4', 'G4'],
      'D': ['D4', 'F#4', 'A4'],
      'E': ['E4', 'G#4', 'B4'],
      'F': ['F4', 'A4', 'C5'],
      'G': ['G4', 'B4', 'D5'],
      'A': ['A4', 'C#5', 'E5'],
      'B': ['B4', 'D#5', 'F#5'],
      
      'Cm': ['C4', 'Eb4', 'G4'],
      'Dm': ['D4', 'F4', 'A4'],
      'Em': ['E4', 'G4', 'B4'],
      'Fm': ['F4', 'Ab4', 'C5'],
      'Gm': ['G4', 'Bb4', 'D5'],
      'Am': ['A4', 'C5', 'E5'],
      'Bm': ['B4', 'D5', 'F#5'],
      
      'C7': ['C4', 'E4', 'G4', 'Bb4'],
      'D7': ['D4', 'F#4', 'A4', 'C5'],
      'E7': ['E4', 'G#4', 'B4', 'D5'],
      'F7': ['F4', 'A4', 'C5', 'Eb5'],
      'G7': ['G4', 'B4', 'D5', 'F5'],
      'A7': ['A4', 'C#5', 'E5', 'G5'],
      'B7': ['B4', 'D#5', 'F#5', 'A5'],
    };

    return chordMap[chordName] || null;
  }

  /**
   * Возвращает ноты гитарного аккорда (всегда 5 нот, как на реальной гитаре)
   */
  getGuitarChordNotes(chordName) {
    const guitarChordMap = {
      // Мажорные аккорды - 5 нот (как на открытых аккордах)
      'C': ['C3', 'E3', 'G3', 'C4', 'E4'],
      'D': ['D3', 'A3', 'D4', 'F#4', 'A4'],
      'E': ['E3', 'B3', 'E4', 'G#4', 'B4'],
      'F': ['F2', 'C3', 'F3', 'A3', 'C4'],
      'G': ['G3', 'B3', 'D4', 'G4', 'B4'],
      'A': ['A2', 'E3', 'A3', 'C#4', 'E4'],
      'B': ['B2', 'F#3', 'B3', 'D#4', 'F#4'],
      
      // Минорные аккорды - 5 нот
      'Cm': ['C3', 'Eb3', 'G3', 'C4', 'Eb4'],
      'Dm': ['D3', 'A3', 'D4', 'F4', 'A4'],
      'Em': ['E3', 'B3', 'E4', 'G4', 'B4'],
      'Fm': ['F2', 'C3', 'F3', 'Ab3', 'C4'],
      'Gm': ['G2', 'Bb2', 'D3', 'G3', 'Bb3'],
      'Am': ['A2', 'E3', 'A3', 'C4', 'E4'],
      'Bm': ['B2', 'F#3', 'B3', 'D4', 'F#4'],
      
      // Септаккорды - 5 нот (дополняем до 5 нот)
      'C7': ['C3', 'E3', 'G3', 'Bb3', 'C4'],
      'D7': ['D3', 'A3', 'C4', 'D4', 'F#4'],
      'E7': ['E3', 'B3', 'D4', 'E4', 'G#4'],
      'F7': ['F2', 'C3', 'Eb3', 'F3', 'A3'],
      'G7': ['G2', 'B2', 'D3', 'F3', 'G3'],
      'A7': ['A2', 'E3', 'G3', 'A3', 'C#4'],
      'B7': ['B2', 'F#3', 'A3', 'B3', 'D#4'],
    };

    return guitarChordMap[chordName] || null;
  }


  /**
   * Пытается загрузить сэмпл пианино для аккордов (только SoundFont)
   */
  async loadPianoSampleForChord(noteName) {
    // Используем только SoundFont акустическое пианино
    if (soundfontLoader && soundfontLoader.isNoteAvailable(noteName)) {
      try {
        console.log(`🎹 Загружаем акустическое пианино SoundFont для аккорда: ${noteName}`);
        const soundfontBuffer = await soundfontLoader.loadNoteSample(noteName);
        if (soundfontBuffer) {
          console.log(`✅ Акустическое пианино SoundFont загружен для аккорда ${noteName}`);
          return soundfontBuffer;
        }
      } catch (soundfontError) {
        console.warn(`SoundFont не помог для аккорда ${noteName}:`, soundfontError);
      }
    }
    
    throw new Error(`SoundFont недоступен для ноты аккорда ${noteName}`);
  }

  /**
   * Пытается загрузить сэмпл гитары для аккордов (только SoundFont)
   */
  async loadGuitarSampleForChord(noteName) {
    // Используем только SoundFont акустическая гитара
    if (guitarSoundfontLoader && guitarSoundfontLoader.isNoteAvailable(noteName)) {
      try {
        console.log(`🎸 Загружаем акустическую гитару SoundFont для аккорда: ${noteName}`);
        const soundfontBuffer = await guitarSoundfontLoader.loadNoteSample(noteName);
        if (soundfontBuffer) {
          console.log(`✅ Акустическая гитара SoundFont загружен для аккорда ${noteName}`);
          return soundfontBuffer;
        }
      } catch (soundfontError) {
        console.warn(`SoundFont не помог для гитарного аккорда ${noteName}:`, soundfontError);
      }
    }
    
    throw new Error(`SoundFont недоступен для ноты гитарного аккорда ${noteName}`);
  }



  /**
   * Возвращает URL для сэмпла аккорда гитары
   */
  getGuitarChordSampleUrl(chordName) {
    const baseUrl = '/audio/samples/guitar';
    return `${baseUrl}/${chordName}.mp3`;
  }

  /**
   * Возвращает URL для сэмпла аккорда (legacy)
   */
  getChordSampleUrl(chordName) {
    return this.getGuitarChordSampleUrl(chordName);
  }

  /**
   * Загружает и воспроизводит гитарный аккорд из отдельных нот SoundFont
   */
  async playGuitarChordFromNotes(notes, duration = 2.0) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    await this.resumeContext();

    console.log(`🎸 Воспроизведение гитарного аккорда из нот: ${notes.join(', ')}`);
    const allSounds = [];
    const now = this.audioContext.currentTime;

    // Воспроизводим каждую ноту аккорда с небольшой задержкой
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const delay = i * 0.04; // 40мс задержка между нотами для арпеджио
      console.log(`🎵 Обрабатываем ноту ${i + 1}/${notes.length}: ${note} (задержка: ${delay}с)`);
      
      try {
        // Для гитарных аккордов используем гитарный SoundFont
        const audioBuffer = await this.loadGuitarSampleForChord(note);
        
        // Используем эффекты для гитары
        const effects = this.getGuitarEffects();
        const source = this.playAudioBuffer(audioBuffer, 5.5, effects, delay);
        
        // Настраиваем время воспроизведения
        source.stop(now + delay + duration);
        
        allSounds.push(source);
        
        // Добавляем в активные звуки
        this.currentSounds.add(source);
        source.onended = () => {
          this.currentSounds.delete(source);
        };
        
        console.log(`✅ Нота ${note} добавлена в гитарный аккорд`);
        
      } catch (error) {
        console.warn(`❌ Не удалось загрузить ноту ${note} для гитарного аккорда:`, error);
      }
    }
    
    console.log(`🎸 Гитарный аккорд завершен: создано ${allSounds.length} звуков из ${notes.length} нот`);
    return allSounds;
  }

  /**
   * Загружает и воспроизводит аккорд из отдельных нот FluidR3_GM
   */
  async playChordFromNotes(notes, duration = 2.0) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    await this.resumeContext();

    console.log(`🎹 Воспроизведение аккорда из нот: ${notes.join(', ')}`);
    const allSounds = [];
    const now = this.audioContext.currentTime;

    // Воспроизводим каждую ноту аккорда с небольшой задержкой
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const delay = i * 0.04; // 40мс задержка между нотами для арпеджио
      console.log(`🎵 Обрабатываем ноту ${i + 1}/${notes.length}: ${note} (задержка: ${delay}с)`);
      
      try {
        // Для аккордов используем vL (мягкие ноты)
        const audioBuffer = await this.loadPianoSampleForChord(note);
        
        // Используем эффекты для пианино
        const effects = this.getPianoEffects();
        const source = this.playAudioBuffer(audioBuffer, 10, effects, delay);
        
        // Настраиваем время воспроизведения
        source.stop(now + delay + duration);
        
        allSounds.push(source);
        
        // Добавляем в активные звуки
        this.currentSounds.add(source);
        source.onended = () => {
          this.currentSounds.delete(source);
        };
        
      } catch (error) {
        console.warn(`❌ Не удалось загрузить ноту ${note} для аккорда:`, error);
      }
    }

    console.log(`🎹 Аккорд завершен: создано ${allSounds.length} звуков из ${notes.length} нот`);
    return allSounds;
  }

  /**
   * Освобождает ресурсы
   */
  destroy() {
    this.stopAll();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioBuffers.clear();
    this.isInitialized = false;
  }
}

// Создаем глобальный экземпляр
const audioPlayer = new AudioPlayer();

export default audioPlayer;
