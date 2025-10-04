import { useState, useEffect } from "react";

export default function ProgressCircle({ isCorrect, size = 120 }) {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isCorrect) {
      setIsAnimating(true);
      // Анимация заполнения кружка
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 2;
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnimating(false);
            setProgress(0);
          }, 1000); // Сброс через 1 секунду
        }
      }, 20);
      
      return () => clearInterval(interval);
    }
  }, [isCorrect]);

  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-circle-container" style={{ 
      width: size, 
      height: size, 
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Фоновый круг */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="8"
        />
        
        {/* Прогресс круг */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progress === 100 ? "#4CAF50" : "#FF9800"}
          strokeWidth="8"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.1s ease-in-out',
            filter: progress === 100 ? 'drop-shadow(0 0 10px rgba(76, 175, 80, 0.5))' : 'none'
          }}
        />
      </svg>
      
      {/* Центральный контент */}
      <div style={{
        position: 'absolute',
        textAlign: 'center',
        color: progress === 100 ? '#4CAF50' : '#666'
      }}>
        {progress === 100 ? (
          <div style={{ animation: isAnimating ? 'pulse 0.5s ease-in-out' : 'none' }}>
            <div style={{ fontSize: '24px' }}>🎉</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Отлично!</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '16px' }}>🎵</div>
            <div style={{ fontSize: '10px' }}>Играйте</div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
