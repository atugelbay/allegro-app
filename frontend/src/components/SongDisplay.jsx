import React, { useState, useEffect, useRef, useCallback } from 'react';
import GuitarVisualizer from './GuitarVisualizer';
import PianoVisualizer from './PianoVisualizer';
import audioPlayer from '../utils/audioPlayer';

const SongDisplay = ({ 
  songTitle, 
  chordSequence, 
  autoPlay = false,
  showChordSequence = true,
  instrument = 'guitar', // инструмент для воспроизведения
  onChordPlay 
}) => {
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2000); // 2 секунды на аккорд
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const isMountedRef = useRef(true);
  const shouldStopRef = useRef(false);

  // Автовоспроизведение последовательности аккордов только один раз
  useEffect(() => {
    // Сбрасываем флаг остановки при монтировании
    shouldStopRef.current = false;
    
    if (autoPlay && chordSequence && chordSequence.length > 0 && !isPlaying && !hasAutoPlayed) {
      setIsPlaying(true);
      setHasAutoPlayed(true);
      
      // Добавляем задержку 2 секунды перед началом воспроизведения
      setTimeout(() => {
        if (isMountedRef.current && !shouldStopRef.current) {
          playChordSequence();
        }
      }, 2000);
    }
  }, [autoPlay, chordSequence, isPlaying, hasAutoPlayed, playChordSequence]);

  // Остановка звука при размонтировании компонента
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      shouldStopRef.current = true;
      audioPlayer.stopAll();
    };
  }, []);

  const playChordSequence = useCallback(async () => {
    if (!chordSequence || chordSequence.length === 0) {
      return;
    }

    // Останавливаем все предыдущие звуки и сбрасываем флаги
    audioPlayer.stopAll();
    audioPlayer.resetStopFlag();
    if (isMountedRef.current) {
      setIsPlaying(true);
    }
    shouldStopRef.current = false;
    
    for (let i = 0; i < chordSequence.length; i++) {
      // Проверяем остановку перед каждой итерацией
      if (shouldStopRef.current || !isMountedRef.current || audioPlayer.shouldStop()) {
        break;
      }
      
      // Проверяем остановку перед воспроизведением аккорда
      if (shouldStopRef.current || !isMountedRef.current || audioPlayer.shouldStop()) {
        break;
      }
      
      // Обновляем индекс аккорда только если компонент все еще смонтирован
      if (isMountedRef.current) {
        setCurrentChordIndex(i);
      }
      const chord = chordSequence[i];
      
      try {
        await audioPlayer.initialize();
        
        // Проверяем еще раз перед воспроизведением
        if (shouldStopRef.current || !isMountedRef.current || audioPlayer.shouldStop()) {
          break;
        }
        
        // Проверяем, является ли это нотой (содержит цифру)
        const isNote = /\d/.test(chord);
        
        if (isNote) {
          await audioPlayer.playNote(chord, Math.max(0.8, playbackSpeed / 1000));
        } else {
          await audioPlayer.playChord(chord, Math.max(1.2, playbackSpeed / 1000), instrument);
        }
        
        if (onChordPlay && isMountedRef.current) {
          onChordPlay(chord, i);
        }
        
        // Проверяем остановку после воспроизведения аккорда
        if (shouldStopRef.current || !isMountedRef.current || audioPlayer.shouldStop()) {
          break;
        }
        
        // Ждем перед следующим аккордом/нотой, но проверяем остановку каждые 100мс
        let remainingTime = playbackSpeed;
        while (remainingTime > 0 && !shouldStopRef.current && isMountedRef.current && !audioPlayer.shouldStop()) {
          const checkInterval = Math.min(100, remainingTime);
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          remainingTime -= checkInterval;
        }
        
        // Если остановили во время ожидания, прерываем цикл
        if (shouldStopRef.current || !isMountedRef.current || audioPlayer.shouldStop()) {
          break;
        }
      } catch (error) {
        console.error(`Ошибка воспроизведения ${chord}:`, error);
      }
    }
    
    if (isMountedRef.current) {
      setIsPlaying(false);
      setCurrentChordIndex(0);
    }
  }, [chordSequence, playbackSpeed, instrument, onChordPlay]);

  const playSingleChord = async (chord, index) => {
    try {
      setCurrentChordIndex(index);
      await audioPlayer.initialize();
      
      // Проверяем, является ли это нотой (содержит цифру)
      const isNote = /\d/.test(chord);
      
      if (isNote) {
        await audioPlayer.playNote(chord, 1.8);
      } else {
        await audioPlayer.playChord(chord, 2.5, instrument);
      }
      
      if (onChordPlay) {
        onChordPlay(chord, index);
      }
    } catch (error) {
      console.error(`Ошибка воспроизведения ${chord}:`, error);
    }
  };

  const stopPlayback = () => {
    shouldStopRef.current = true;
    if (isMountedRef.current) {
      setIsPlaying(false);
      setCurrentChordIndex(0);
    }
    audioPlayer.stopAll();
  };

  if (!songTitle || !chordSequence) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#7f8c8d' 
      }}>
        <p>Информация о песне недоступна</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      backgroundColor: '#f9f9f9',
      margin: '20px 0'
    }}>
      {/* Заголовок песни */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ 
          margin: '0 0 10px 0', 
          color: '#2c3e50',
          fontSize: '24px'
        }}>
          🎵 {songTitle}
        </h3>
        <p style={{ 
          margin: '0', 
          color: '#7f8c8d',
          fontSize: '14px'
        }}>
          Последовательность аккордов для изучения
        </p>
      </div>

      {/* Управление воспроизведением */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={playChordSequence}
          disabled={isPlaying}
          style={{
            padding: '10px 20px',
            backgroundColor: isPlaying ? '#95a5a6' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: isPlaying ? 'none' : '0 2px 4px rgba(39, 174, 96, 0.3)'
          }}
        >
          {isPlaying ? '🎵 Играет...' : '▶️ Воспроизвести всю песню'}
        </button>
        
        <button
          onClick={stopPlayback}
          disabled={!isPlaying}
          style={{
            padding: '10px 20px',
            backgroundColor: !isPlaying ? '#bdc3c7' : '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: !isPlaying ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
        >
          ⏹️ Остановить
        </button>
      </div>

      {/* Настройки скорости */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <label style={{ fontSize: '14px', color: '#2c3e50' }}>
          Скорость:
        </label>
        <input
          type="range"
          min="1000"
          max="4000"
          step="500"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
          style={{ width: '150px' }}
        />
        <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
          {playbackSpeed / 1000}с
        </span>
      </div>

      {/* Последовательность аккордов */}
      {showChordSequence && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            color: '#2c3e50',
            textAlign: 'center'
          }}>
            Аккорды песни:
          </h4>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            {chordSequence.map((chord, index) => (
              <button
                key={index}
                onClick={() => playSingleChord(chord, index)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: currentChordIndex === index ? '#3498db' : '#ecf0f1',
                  color: currentChordIndex === index ? 'white' : '#2c3e50',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: currentChordIndex === index 
                    ? '0 4px 12px rgba(52, 152, 219, 0.3)' 
                    : '0 2px 4px rgba(0,0,0,0.1)',
                  transform: currentChordIndex === index ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {chord}
              </button>
            ))}
          </div>
          
          {/* Прогресс воспроизведения */}
          {isPlaying && (
            <div style={{ 
              marginTop: '15px',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#3498db',
                marginBottom: '5px'
              }}>
                Аккорд {currentChordIndex + 1} из {chordSequence.length}
              </div>
              <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#ecf0f1',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${((currentChordIndex + 1) / chordSequence.length) * 100}%`,
                  height: '100%',
                  backgroundColor: '#3498db',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Визуализация текущего аккорда/ноты */}
      {chordSequence.length > 0 && (
        <div style={{ textAlign: 'center' }}>
          {(() => {
            const currentItem = chordSequence[currentChordIndex];
            // Проверяем, является ли это нотой (содержит цифру)
            const isNote = /\d/.test(currentItem);
            
            if (isNote) {
              return (
                <PianoVisualizer 
                  noteName={currentItem}
                  autoPlay={false}
                  size="medium"
                  showPlayButton={false}
                  onPlay={(note) => console.log(`🎹 Воспроизведена нота: ${note}`)}
                />
              );
            } else {
              return (
                <GuitarVisualizer 
                  chordName={currentItem}
                  autoPlay={false}
                  size="medium"
                  showPlayButton={false}
                  onPlay={(chord) => console.log(`🎸 Воспроизведен аккорд: ${chord}`)}
                />
              );
            }
          })()}
        </div>
      )}

      {/* Информация о песне */}
      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#ecf0f1',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#2c3e50'
      }}>
        <h5 style={{ margin: '0 0 10px 0' }}>💡 Советы для изучения:</h5>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>Изучите каждый аккорд отдельно перед игрой последовательности</li>
          <li>Начните с медленной скорости и постепенно ускоряйтесь</li>
          <li>Практикуйтесь с метрономом для развития чувства ритма</li>
          <li>Используйте правильную аппликатуру для каждого аккорда</li>
        </ul>
      </div>
    </div>
  );
};

export default SongDisplay;
