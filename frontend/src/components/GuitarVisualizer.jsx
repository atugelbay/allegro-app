import React, { useState, useEffect, useCallback, useMemo } from 'react';
import audioPlayer from '../utils/audioPlayer';

const GuitarVisualizer = ({ 
  chordName, 
  autoPlay = false, 
  autoPlayDelay = 2000,
  onPlay,
  showLabels = true,
  size = 'medium', // small, medium, large
  // showPlayButton = true // показывать ли кнопку воспроизведения
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedFrets, setHighlightedFrets] = useState(new Set());
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  // Размеры компонента (оптимизированы для 5 ладов без лишнего пространства)
  const sizes = {
    small: { height: 140, fretWidth: 35, stringHeight: 100, headWidth: 30 },
    medium: { height: 180, fretWidth: 45, stringHeight: 130, headWidth: 40 },
    large: { height: 220, fretWidth: 55, stringHeight: 160, headWidth: 50 }
  };

  const currentSize = sizes[size];
  
  // Вычисляем точную ширину контейнера: голова + 5 ладов
  const totalWidth = currentSize.headWidth + (5 * currentSize.fretWidth);
  const containerSize = { ...currentSize, width: totalWidth };

  // Гриф гитары - 6 струн, 5 ладов
  // Правильный порядок: сверху вниз E, A, D, G, B, E
  const stringSpacing = currentSize.stringHeight / 5;
  const strings = [
    { note: 'E', number: 6, y: 20 }, // 6-я струна (самая толстая, E низкое) - СВЕРХУ
    { note: 'A', number: 5, y: 20 + stringSpacing },
    { note: 'D', number: 4, y: 20 + stringSpacing * 2 },
    { note: 'G', number: 3, y: 20 + stringSpacing * 3 },
    { note: 'B', number: 2, y: 20 + stringSpacing * 4 },
    { note: 'E', number: 1, y: 20 + stringSpacing * 5 } // 1-я струна (самая тонкая, E высокое) - СНИЗУ
  ];

  const frets = [0, 1, 2, 3, 4, 5]; // Открытые струны + 4 лада

  // Позиции пальцев для аккордов
  // Новый порядок струн: 6(E)-5(A)-4(D)-3(G)-2(B)-1(E)
  const chordPositions = useMemo(() => ({
    'C': [
      { string: 2, fret: 1 }, // B (2-я струна) на 1-м ладу
      { string: 4, fret: 2 }, // D (4-я струна) на 2-м ладу
      { string: 5, fret: 3 }  // A (5-я струна) на 3-м ладу
    ],
    'Am': [
      { string: 2, fret: 1 }, // B (2-я струна) на 1-м ладу
      { string: 3, fret: 2 }, // G (3-я струна) на 2-м ладу
      { string: 4, fret: 2 }  // D (4-я струна) на 2-м ладу
    ],
    'F': [
      { string: 1, fret: 1 }, // E (1-я струна) на 1-м ладу
      { string: 2, fret: 1 }, // B (2-я струна) на 1-м ладу
      { string: 3, fret: 2 }, // G (3-я струна) на 2-м ладу
      { string: 4, fret: 3 }  // D (4-я струна) на 3-м ладу
    ],
    'G': [
      { string: 1, fret: 3 }, // E (1-я струна) на 3-м ладу
      { string: 5, fret: 2 }, // A (5-я струна) на 2-м ладу
      { string: 6, fret: 3 }  // E (6-я струна) на 3-м ладу
    ],
    'D': [
      { string: 1, fret: 2 }, // E (1-я струна) на 2-м ладу
      { string: 2, fret: 2 }, // B (2-я струна) на 2-м ладу
      { string: 3, fret: 2 }  // G (3-я струна) на 2-м ладу
    ],
    'Dm': [
      { string: 1, fret: 1 }, // E (1-я струна) на 1-м ладу
      { string: 2, fret: 2 }, // B (2-я струна) на 2-м ладу
      { string: 3, fret: 2 }  // G (3-я струна) на 2-м ладу
    ],
    'Em': [
      { string: 4, fret: 2 }, // D (4-я струна) на 2-м ладу
      { string: 5, fret: 2 }  // A (5-я струна) на 2-м ладу
    ]
  }), []);

  const playChord = useCallback(async () => {
    if (!chordName || isPlaying) return;
    
    try {
      // Останавливаем все предыдущие звуки
      audioPlayer.stopAll();
      setIsPlaying(true);
      await audioPlayer.initialize();
      await audioPlayer.playChord(chordName, 2.5);
      
      // Анимация подсветки
      const positions = chordPositions[chordName] || [];
      const fretSet = new Set();
      positions.forEach(pos => {
        fretSet.add(`${pos.string}-${pos.fret}`);
      });
      setHighlightedFrets(fretSet);
      
      // Убираем подсветку через 2 секунды
      setTimeout(() => {
        setHighlightedFrets(new Set());
      }, 2000);
      
      if (onPlay) {
        onPlay(chordName);
      }
    } catch (error) {
      console.error('Ошибка воспроизведения аккорда:', error);
    } finally {
      setTimeout(() => {
        setIsPlaying(false);
      }, 2000);
    }
  }, [chordName, isPlaying, chordPositions, onPlay]);

  // Подсвечиваем позиции аккорда
  useEffect(() => {
    if (chordName && chordPositions[chordName]) {
      const positions = chordPositions[chordName];
      const fretSet = new Set();
      positions.forEach(pos => {
        fretSet.add(`${pos.string}-${pos.fret}`);
      });
      setHighlightedFrets(fretSet);
    } else {
      setHighlightedFrets(new Set());
    }
  }, [chordName, chordPositions]);

  // Автовоспроизведение только один раз при входе
  useEffect(() => {
    if (autoPlay && chordName && !isPlaying && !hasAutoPlayed) {
      const timer = setTimeout(async () => {
        await playChord();
        setHasAutoPlayed(true);
      }, autoPlayDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoPlay, chordName, autoPlayDelay, isPlaying, hasAutoPlayed, playChord]);

  // Остановка звука при размонтировании компонента
  useEffect(() => {
    return () => {
      audioPlayer.stopAll();
    };
  }, []);

  const handleFretClick = (stringNum, fretNum) => {
    if (isPlaying) return;
    
    const fretKey = `${stringNum}-${fretNum}`;
    const newHighlighted = new Set(highlightedFrets);
    
    if (newHighlighted.has(fretKey)) {
      newHighlighted.delete(fretKey);
    } else {
      newHighlighted.add(fretKey);
    }
    
    setHighlightedFrets(newHighlighted);
  };

  const getFretX = (fretNum) => {
    if (fretNum === 0) return currentSize.headWidth; // Открытые струны (сразу после головы)
    return currentSize.headWidth + (fretNum - 1) * currentSize.fretWidth; // Лады начинаются сразу после головы
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      margin: '20px 0'
    }}>
      {/* Заголовок */}
      {chordName && (
        <div style={{ 
          marginBottom: '15px', 
          textAlign: 'center' 
        }}>
          <h3 style={{ 
            margin: '0 0 5px 0', 
            color: '#2c3e50',
            fontSize: size === 'large' ? '24px' : size === 'medium' ? '20px' : '16px'
          }}>
            {chordName}
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

      {/* Номера ладов */}
      <div style={{ 
        position: 'relative',
        width: containerSize.width,
        height: '25px',
        marginBottom: '10px'
      }}>
        {frets.slice(1).map((fretNum) => {
          // Позиционируем номера в центре каждого лада
          const fretCenterX = getFretX(fretNum) + currentSize.fretWidth / 2;
          return (
            <div
              key={`fret-label-${fretNum}`}
              style={{
                position: 'absolute',
                left: fretCenterX - 12,
                top: 0,
                width: '24px',
                height: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#2c3e50',
                backgroundColor: '#f8f9fa',
                borderRadius: '50%',
                border: '2px solid #dee2e6'
              }}
            >
              {fretNum}
            </div>
          );
        })}
      </div>

      {/* Гриф гитары */}
      <div 
        onClick={playChord}
        style={{ 
          position: 'relative',
          width: containerSize.width,
          height: currentSize.height,
          border: '2px solid #6c757d',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          cursor: chordName ? 'pointer' : 'default',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
        
        {/* Голова гитары */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: currentSize.headWidth,
          height: currentSize.height,
          backgroundColor: '#6c757d',
          borderTopLeftRadius: '6px',
          borderBottomLeftRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '10px 5px'
        }}>
          {strings.map((string) => (
            <div
              key={`tuning-peg-${string.number}`}
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#adb5bd',
                borderRadius: '50%',
                border: '1px solid #495057'
              }}
            />
          ))}
        </div>


        {/* Лады */}
        {frets.slice(1).map((fretNum) => (
          <div
            key={fretNum}
            style={{
              position: 'absolute',
              left: getFretX(fretNum),
              top: 0,
              width: '1px',
              height: currentSize.height,
              backgroundColor: '#adb5bd',
              zIndex: 1
            }}
          />
        ))}

        {/* Струны */}
        {strings.map((string) => (
          <div
            key={string.number}
            style={{
              position: 'absolute',
              left: 0,
              top: string.y,
              width: containerSize.width,
              height: '1px',
              backgroundColor: string.number <= 2 ? '#adb5bd' : '#ffc107',
              zIndex: 2,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          />
        ))}

        {/* Названия нот струн (справа) */}
        <div style={{
          position: 'absolute',
          right: -25,
          top: 0,
          height: currentSize.height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}>
          {strings.map((string) => (
            <div
              key={`string-note-${string.number}`}
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#495057',
                backgroundColor: '#ffffff',
                padding: '2px 6px',
                borderRadius: '3px',
                border: '1px solid #dee2e6'
              }}
            >
              {string.note}
            </div>
          ))}
        </div>

        {/* Позиции пальцев */}
        {chordPositions[chordName]?.map((position, index) => {
          const fretKey = `${position.string}-${position.fret}`;
          const isHighlighted = highlightedFrets.has(fretKey);
          const string = strings.find(s => s.number === position.string);
          
          if (!string) return null;
          
          // Для открытых струн (fret 0) позиционируем в начале лада
          // Для остальных ладов - в центре лада
          const fingerX = position.fret === 0 
            ? getFretX(position.fret) + 5
            : getFretX(position.fret) + currentSize.fretWidth / 2;
          
          return (
            <div
              key={fretKey}
              onClick={() => handleFretClick(position.string, position.fret)}
              style={{
                position: 'absolute',
                left: fingerX - 10,
                top: string.y - 10,
                width: '20px',
                height: '20px',
                backgroundColor: isHighlighted ? '#dc3545' : '#007bff',
                borderRadius: '50%',
                border: '2px solid #ffffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isHighlighted 
                  ? '0 0 15px rgba(220, 53, 69, 0.6)' 
                  : '0 4px 8px rgba(0,123,255,0.3)',
                transform: isHighlighted ? 'scale(1.3)' : 'scale(1)',
                zIndex: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showLabels && (
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {index + 1}
                </span>
              )}
            </div>
          );
        })}

        {/* Открытые струны (кружочки на головке грифа) */}
        {chordPositions[chordName]?.map((position) => {
          if (position.fret !== 0) return null;
          
          const string = strings.find(s => s.number === position.string);
          if (!string) return null;
          
          return (
            <div
              key={`${position.string}-0`}
              style={{
                position: 'absolute',
                left: 2,
                top: string.y - 6,
                width: '12px',
                height: '12px',
                backgroundColor: '#e74c3c',
                borderRadius: '50%',
                border: '2px solid #c0392b',
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ 
                fontSize: '8px', 
                fontWeight: 'bold',
                color: 'white'
              }}>
                O
              </span>
            </div>
          );
        })}
      </div>


      {/* Информация об аккорде */}
      {chordName && (
        <div style={{ 
          marginTop: '10px', 
          textAlign: 'center',
          fontSize: '12px',
          color: '#7f8c8d'
        }}>
          <p style={{ margin: '2px 0' }}>
            Ноты: {audioPlayer.getChordNotes(chordName)?.join(', ') || 'Неизвестный аккорд'}
          </p>
          <p style={{ margin: '2px 0' }}>
            Позиция: {chordPositions[chordName]?.length || 0} пальцев
          </p>
          <div style={{ marginTop: '5px', fontSize: '10px', color: '#95a5a6' }}>
            💡 Кликните по гитаре для воспроизведения
          </div>
        </div>
      )}
    </div>
  );
};

export default GuitarVisualizer;
