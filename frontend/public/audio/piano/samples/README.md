# Аудио сэмплы для Allegro

## Структура папок

```
audio/samples/
├── piano/          # Ноты пианино (C3.mp3, C4.mp3, etc.)
├── guitar/         # Аккорды гитары (C.mp3, Am.mp3, etc.)
└── README.md       # Этот файл
```

## Поддерживаемые форматы

- `.mp3` (рекомендуется)
- `.wav`
- `.ogg`

## Названия файлов

### Ноты пианино
- C3.mp3, C#3.mp3, D3.mp3, D#3.mp3, E3.mp3, F3.mp3, F#3.mp3, G3.mp3, G#3.mp3, A3.mp3, A#3.mp3, B3.mp3
- C4.mp3, C#4.mp3, D4.mp3, D#4.mp3, E4.mp3, F4.mp3, F#4.mp3, G4.mp3, G#4.mp3, A4.mp3, A#4.mp3, B4.mp3
- C5.mp3, C#5.mp3, D5.mp3, D#5.mp3, E5.mp3, F5.mp3, F#5.mp3, G5.mp3, G#5.mp3, A5.mp3, A#5.mp3, B5.mp3
- C6.mp3, C#6.mp3, D6.mp3, D#6.mp3, E6.mp3, F6.mp3, F#6.mp3, G6.mp3, G#6.mp3, A6.mp3, A#6.mp3, B6.mp3

### Аккорды гитары
- C.mp3 (мажор)
- Am.mp3 (ля минор)
- F.mp3 (фа мажор)
- G.mp3 (соль мажор)
- Dm.mp3 (ре минор)
- Em.mp3 (ми минор)
- D.mp3 (ре мажор)
- A.mp3 (ля мажор)
- E.mp3 (ми мажор)
- Bm.mp3 (си минор)
- B.mp3 (си мажор)
- F#m.mp3 (фа диез минор)

## Источники бесплатных сэмплов

### Пианино
- [Freesound.org](https://freesound.org/) - поиск "piano note"
- [University of Iowa Piano Samples](https://theremin.music.uiowa.edu/MISpiano.html)
- [FreePats](https://freepats.zenvoid.org/Piano/)

### Гитара
- [Freesound.org](https://freesound.org/) - поиск "guitar chord"
- [FreePats](https://freepats.zenvoid.org/Guitar/)
- [Guitar Chord Samples](https://www.guitar-chords.org.uk/sound-samples.html)

## Качество звука

Рекомендуемые параметры:
- **Частота дискретизации**: 44.1 kHz или 48 kHz
- **Битность**: 16-bit или 24-bit
- **Длительность**: 1-3 секунды для нот, 2-4 секунды для аккордов
- **Формат**: MP3 с качеством 128-320 kbps

## Автоматическая генерация

Используйте инструмент "Генератор аудио" в приложении для создания базовых сэмплов.

## Fallback

Если сэмпл не найден, приложение автоматически использует синтетические звуки.