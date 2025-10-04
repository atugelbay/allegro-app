/**
 * Утилита для загрузки SoundFont файлов гитары
 * Использует FluidR3_GM acoustic_guitar_steel soundfont для получения нот гитары
 * Источник: https://github.com/gleitz/midi-js-soundfonts/tree/gh-pages/FluidR3_GM/acoustic_guitar_steel-mp3
 */

class GuitarSoundfontLoader {
  constructor() {
    this.cache = new Map();
    this.baseUrl = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/';
  }

  /**
   * Загружает сэмпл ноты гитары из SoundFont
   */
  async loadNoteSample(noteName) {
    // Проверяем кэш
    if (this.cache.has(noteName)) {
      return this.cache.get(noteName);
    }

    try {
      const sampleUrl = this.getSampleUrl(noteName);
      console.log(`🎸 Загружаем акустическую гитару SoundFont: ${sampleUrl}`);
      
      const response = await fetch(sampleUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.decodeAudioData(arrayBuffer);
      
      // Кэшируем результат
      this.cache.set(noteName, audioBuffer);
      
      console.log(`✅ Акустическая гитара SoundFont загружен: ${noteName}`);
      return audioBuffer;
      
    } catch (error) {
      console.warn(`❌ Не удалось загрузить SoundFont сэмпл гитары для ${noteName}:`, error);
      return null;
    }
  }

  /**
   * Возвращает URL для сэмпла ноты из SoundFont
   */
  getSampleUrl(noteName) {
    const noteMap = {
      // 4-я октава - акустическая гитара
      'C4': 'C4.mp3',
      'C#4': 'C4.mp3',
      'D4': 'D4.mp3',
      'D#4': 'D4.mp3',
      'E4': 'E4.mp3',
      'F4': 'F4.mp3',
      'F#4': 'F4.mp3',
      'G4': 'G4.mp3',
      'G#4': 'G4.mp3',
      'A4': 'A4.mp3',
      'A#4': 'A4.mp3',
      'B4': 'B4.mp3',
      
      // 5-я октава - акустическая гитара
      'C5': 'C5.mp3',
      'C#5': 'C5.mp3',
      'D5': 'D5.mp3',
      'D#5': 'D5.mp3',
      'E5': 'E5.mp3',
      'F5': 'F5.mp3',
      'F#5': 'F5.mp3',
      'G5': 'G5.mp3',
      'G#5': 'G5.mp3',
      'A5': 'A5.mp3',
      'A#5': 'A5.mp3',
      'B5': 'B5.mp3',
      
      // 3-я октава - акустическая гитара
      'C3': 'C3.mp3',
      'C#3': 'C3.mp3',
      'D3': 'D3.mp3',
      'D#3': 'D3.mp3',
      'E3': 'E3.mp3',
      'F3': 'F3.mp3',
      'F#3': 'F3.mp3',
      'G3': 'G3.mp3',
      'G#3': 'G3.mp3',
      'A3': 'A3.mp3',
      'A#3': 'A3.mp3',
      'B3': 'B3.mp3',
    };

    const fileName = noteMap[noteName];
    if (!fileName) {
      throw new Error(`Неизвестная нота: ${noteName}`);
    }

    return `${this.baseUrl}${fileName}`;
  }

  /**
   * Декодирует аудио данные из MP3 файла
   */
  async decodeAudioData(arrayBuffer) {
    // Теперь мы работаем с прямыми MP3 файлами
    // Создаем AudioContext для декодирования
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
  }

  /**
   * Проверяет, доступен ли SoundFont для данной ноты
   */
  isNoteAvailable(noteName) {
    const availableNotes = [
      'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
      'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
      'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
    ];
    
    return availableNotes.includes(noteName);
  }
}

// Создаем глобальный экземпляр
const guitarSoundfontLoader = new GuitarSoundfontLoader();

export default guitarSoundfontLoader;
