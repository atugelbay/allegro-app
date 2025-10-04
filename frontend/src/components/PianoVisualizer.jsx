import React, { useState, useEffect, useCallback, useMemo } from 'react';
import audioPlayer from '../utils/audioPlayer';

const PianoVisualizer = ({ 
  noteName, 
  chordName, // новый пропс для аккордов
  noteNames, // альтернативный пропс для массива нот
  autoPlay = false, 
  autoPlayDelay = 2000,
  onPlay,
  showLabels = true,
  size = 'medium', // small, medium, large
  // showPlayButton = true // показывать ли кнопку воспроизведения
}) => {
  const [highlightedKeys, setHighlightedKeys] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  // Размеры компонента (оптимизированы для 2 октав)
  const sizes = {
    small: { width: 400, keyWidth: 20, keyHeight: 80 },
    medium: { width: 500, keyWidth: 26, keyHeight: 120 },
    large: { width: 600, keyWidth: 32, keyHeight: 150 }
  };

  const currentSize = sizes[size];

  // Вычисляем общую ширину клавиатуры и смещение для центрирования
  // 2 октавы: C4-B4 (7 клавиш) + C5-B5 (7 клавиш) = 14 белых клавиш
  const totalPianoWidth = currentSize.keyWidth * 14; // 14 белых клавиш для обеих октав
  const centeringOffset = (currentSize.width - totalPianoWidth) / 2;

  // Клавиши пианино (2 октавы C4-B5) с центрированием
  const pianoKeys = useMemo(() => [
    // Первая октава (C4-B4)
    { note: 'C4', isBlack: false, x: centeringOffset, octave: 4 },
    { note: 'C#4', isBlack: true, x: centeringOffset + 18, octave: 4 },
    { note: 'D4', isBlack: false, x: centeringOffset + currentSize.keyWidth, octave: 4 },
    { note: 'D#4', isBlack: true, x: centeringOffset + 18 + currentSize.keyWidth, octave: 4 },
    { note: 'E4', isBlack: false, x: centeringOffset + currentSize.keyWidth * 2, octave: 4 },
    { note: 'F4', isBlack: false, x: centeringOffset + currentSize.keyWidth * 3, octave: 4 },
    { note: 'F#4', isBlack: true, x: centeringOffset + 18 + currentSize.keyWidth * 3, octave: 4 },
    { note: 'G4', isBlack: false, x: centeringOffset + currentSize.keyWidth * 4, octave: 4 },
    { note: 'G#4', isBlack: true, x: centeringOffset + 18 + currentSize.keyWidth * 4, octave: 4 },
    { note: 'A4', isBlack: false, x: centeringOffset + currentSize.keyWidth * 5, octave: 4 },
    { note: 'A#4', isBlack: true, x: centeringOffset + 18 + currentSize.keyWidth * 5, octave: 4 },
    { note: 'B4', isBlack: false, x: centeringOffset + currentSize.keyWidth * 6, octave: 4 },
    // Вторая октава (C5-B5)
    { note: 'C5', isBlack: false, x: centeringOffset + currentSize.keyWidth * 7, octave: 5 },
    { note: 'C#5', isBlack: true, x: centeringOffset + 18 + currentSize.keyWidth * 7, octave: 5 },
    { note: 'D5', isBlack: false, x: centeringOffset + currentSize.keyWidth * 8, octave: 5 },
    { note: 'D#5', isBlack: true, x: centeringOffset + 18 + currentSize.keyWidth * 8, octave: 5 },
    { note: 'E5', isBlack: false, x: centeringOffset + currentSize.keyWidth * 9, octave: 5 },
    { note: 'F5', isBlack: false, x: centeringOffset + currentSize.keyWidth * 10, octave: 5 },
    { note: 'F#5', isBlack: true, x: centeringOffset + 18 + currentSize.keyWidth * 10, octave: 5 },
    { note: 'G5', isBlack: false, x: centeringOffset + currentSize.keyWidth * 11, octave: 5 },
    { note: 'G#5', isBlack: true, x: centeringOffset + 18 + currentSize.keyWidth * 11, octave: 5 },
    { note: 'A5', isBlack: false, x: centeringOffset + currentSize.keyWidth * 12, octave: 5 },
    { note: 'A#5', isBlack: true, x: centeringOffset + 18 + currentSize.keyWidth * 12, octave: 5 },
    { note: 'B5', isBlack: false, x: centeringOffset + currentSize.keyWidth * 13, octave: 5 },
  ], [centeringOffset, currentSize.keyWidth]);

  const playNote = useCallback(async () => {
    if ((!noteName && !chordName) || isPlaying) return;
    
    try {
      // Останавливаем все предыдущие звуки
      audioPlayer.stopAll();
      setIsPlaying(true);
      await audioPlayer.initialize();
      
      if (chordName) {
        // Воспроизводим аккорд на пианино (используем vL сэмплы)
        await audioPlayer.playChord(chordName, 2.5, 'piano');
        
        // Анимация нажатия клавиш аккорда
        const chordNotes = audioPlayer.getChordNotes(chordName);
        if (chordNotes) {
          setHighlightedKeys(new Set(chordNotes));
          
          // Убираем подсветку через 2 секунды
          setTimeout(() => {
            setHighlightedKeys(new Set());
          }, 2000);
        }
        
        if (onPlay) {
          onPlay(chordName);
        }
      } else if (noteName) {
        // Воспроизводим одну ноту
        await audioPlayer.playNote(noteName, 2.0);
        
        // Анимация нажатия клавиши
        setHighlightedKeys(new Set([noteName]));
        
        // Убираем подсветку через 1.5 секунды
        setTimeout(() => {
          setHighlightedKeys(new Set());
        }, 1500);
        
        if (onPlay) {
          onPlay(noteName);
        }
      }
    } catch (error) {
      console.error('Ошибка воспроизведения:', error);
    } finally {
      setTimeout(() => {
        setIsPlaying(false);
      }, chordName ? 2000 : 1500);
    }
  }, [noteName, chordName, isPlaying, onPlay, pianoKeys]);

  // Подсвечиваем нужные клавиши (для нот или аккордов)
  useEffect(() => {
    let notesToHighlight = [];
    
    if (chordName) {
      // Если передан аккорд, получаем его ноты
      const chordNotes = audioPlayer.getChordNotes(chordName);
      if (chordNotes) {
        notesToHighlight = chordNotes;
      }
    } else if (noteNames && Array.isArray(noteNames)) {
      // Если передан массив нот
      notesToHighlight = noteNames;
    } else if (noteName) {
      // Если передана одна нота
      notesToHighlight = [noteName];
    }
    
    // Проверяем, какие из этих нот есть на нашем пианино
    const validNotes = notesToHighlight.filter(note => 
      pianoKeys.some(key => key.note === note)
    );
    
    setHighlightedKeys(new Set(validNotes));
  }, [noteName, chordName, noteNames, pianoKeys]);

  // Автовоспроизведение только один раз при входе
  useEffect(() => {
    if (autoPlay && (noteName || chordName) && !isPlaying && !hasAutoPlayed) {
      const timer = setTimeout(async () => {
        await playNote();
        setHasAutoPlayed(true);
      }, autoPlayDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoPlay, noteName, chordName, autoPlayDelay, isPlaying, hasAutoPlayed, playNote]);

  // Остановка звука при размонтировании компонента
  useEffect(() => {
    return () => {
      audioPlayer.stopAll();
    };
  }, []);

  const handleKeyClick = (keyNote) => {
    if (isPlaying) return;
    
    // Подсвечиваем нажатую клавишу
    setHighlightedKeys(new Set([keyNote]));
    
    // Убираем подсветку через 0.5 секунды
    setTimeout(() => {
      setHighlightedKeys(new Set());
    }, 500);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      margin: '20px 0'
    }}>
      {/* Заголовок */}
      {noteName && (
        <div style={{ 
          marginBottom: '15px', 
          textAlign: 'center' 
        }}>
          <h3 style={{ 
            margin: '0 0 5px 0', 
            color: '#2c3e50',
            fontSize: size === 'large' ? '24px' : size === 'medium' ? '20px' : '16px'
          }}>
            {noteName}
          </h3>
          {autoPlay && (
            <p style={{ 
              margin: '0', 
              color: '#7f8c8d', 
              fontSize: '14px' 
            }}>
              Автовоспроизведение через {autoPlayDelay/1000} сек
            </p>
          )}
        </div>
      )}

      {/* Клавиатура пианино */}
      <div 
        onClick={playNote}
        style={{ 
          position: 'relative',
          width: currentSize.width,
          height: currentSize.keyHeight + 20,
          cursor: (noteName || chordName) ? 'pointer' : 'default',
          margin: '0 auto' // Центрируем клавиатуру
        }}>
        {/* Белые клавиши */}
        {pianoKeys.filter(key => !key.isBlack).map((key) => {
          const isHighlighted = highlightedKeys.has(key.note);
          const isTargetNote = noteName === key.note;
          
          return (
            <div
              key={key.note}
              onClick={() => handleKeyClick(key.note)}
              style={{
                position: 'absolute',
                left: key.x,
                top: 0,
                width: currentSize.keyWidth,
                height: currentSize.keyHeight,
                backgroundColor: isHighlighted 
                  ? '#e74c3c' 
                  : isTargetNote 
                    ? '#f39c12' 
                    : '#ffffff',
                border: '2px solid #bdc3c7',
                borderRadius: '0 0 4px 4px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '5px',
                transition: 'all 0.2s ease',
                boxShadow: isHighlighted 
                  ? '0 4px 8px rgba(231, 76, 60, 0.3)' 
                  : '0 2px 4px rgba(0,0,0,0.1)',
                transform: isHighlighted ? 'translateY(2px)' : 'translateY(0)',
                zIndex: 1
              }}
            >
              {showLabels && (
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  color: isHighlighted ? 'white' : '#2c3e50'
                }}>
                  {key.octave === 4 ? key.note : key.octave === 5 ? key.note : key.note}
                </span>
              )}
            </div>
          );
        })}

        {/* Черные клавиши */}
        {pianoKeys.filter(key => key.isBlack).map((key) => {
          const isHighlighted = highlightedKeys.has(key.note);
          const isTargetNote = noteName === key.note;
          
          return (
            <div
              key={key.note}
              onClick={() => handleKeyClick(key.note)}
              style={{
                position: 'absolute',
                left: key.x,
                top: 0,
                width: currentSize.keyWidth * 0.6,
                height: currentSize.keyHeight * 0.6,
                backgroundColor: isHighlighted 
                  ? '#c0392b' 
                  : isTargetNote 
                    ? '#e67e22' 
                    : '#2c3e50',
                border: '1px solid #34495e',
                borderRadius: '0 0 3px 3px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '3px',
                transition: 'all 0.2s ease',
                boxShadow: isHighlighted 
                  ? '0 3px 6px rgba(192, 57, 43, 0.4)' 
                  : '0 1px 3px rgba(0,0,0,0.2)',
                transform: isHighlighted ? 'translateY(1px)' : 'translateY(0)',
                zIndex: 2
              }}
            >
              {showLabels && (
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: 'bold',
                  color: isHighlighted ? 'white' : '#ecf0f1'
                }}>
                  {key.octave === 4 ? key.note.replace('#', '♯') : key.octave === 5 ? key.note.replace('#', '♯') : key.note.replace('#', '♯')}
                </span>
              )}
            </div>
          );
        })}
      </div>


      {/* Информация о ноте/аккорде */}
      {(noteName || chordName) && (
        <div style={{ 
          marginTop: '10px', 
          textAlign: 'center',
          fontSize: '12px',
          color: '#7f8c8d'
        }}>
          {chordName ? (
            <>
              <p style={{ margin: '2px 0', fontWeight: 'bold', color: '#2c3e50' }}>
                Аккорд: {chordName}
              </p>
              <p style={{ margin: '2px 0' }}>
                Ноты: {audioPlayer.getChordNotes(chordName)?.join(', ') || 'Неизвестный аккорд'}
              </p>
              <p style={{ margin: '2px 0' }}>
                Позиция: {audioPlayer.getChordNotes(chordName)?.length || 0} нот
              </p>
            </>
          ) : (
            <>
              <p style={{ margin: '2px 0' }}>
                Частота: {audioPlayer.noteToFrequency(noteName)?.toFixed(2)} Hz
              </p>
              <p style={{ margin: '2px 0' }}>
                Октава: {noteName.match(/\d+/)?.[0] || '4'}
              </p>
            </>
          )}
          <div style={{ marginTop: '5px', fontSize: '10px', color: '#95a5a6' }}>
            💡 Кликните по пианино для воспроизведения
          </div>
        </div>
      )}
    </div>
  );
};

export default PianoVisualizer;
