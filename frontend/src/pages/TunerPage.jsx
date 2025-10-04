import { useState } from "react";
import ChordDetector from "./ChordDetector";
import PitchTrainerPitchy from "./PitchTrainerPitchy";

export default function TunerPage() {
  const [mode, setMode] = useState("chords"); // "chords" или "notes"

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        🎵 Тюнер
      </h1>
      
      {/* Переключатель режимов */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '30px' 
      }}>
        <button
          onClick={() => setMode("chords")}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: mode === "chords" ? '#3498db' : '#ecf0f1',
            color: mode === "chords" ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: 'bold',
            boxShadow: mode === "chords" ? '0 4px 12px rgba(52, 152, 219, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          🎸 Аккорды
        </button>
        <button
          onClick={() => setMode("notes")}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: mode === "notes" ? '#3498db' : '#ecf0f1',
            color: mode === "notes" ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: 'bold',
            boxShadow: mode === "notes" ? '0 4px 12px rgba(52, 152, 219, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          🎹 Ноты
        </button>
      </div>

      {/* Информация о режиме */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: mode === "chords" ? '#e8f5e8' : '#e3f2fd',
        borderRadius: '10px',
        textAlign: 'center',
        border: `2px solid ${mode === "chords" ? '#4CAF50' : '#2196F3'}`
      }}>
        <h3 style={{ 
          margin: '0 0 8px 0', 
          color: mode === "chords" ? '#2E7D32' : '#1976D2' 
        }}>
          {mode === "chords" ? "🎸 Режим: Детекция аккордов" : "🎹 Режим: Детекция нот"}
        </h3>
        <p style={{ 
          margin: 0, 
          color: mode === "chords" ? '#388E3C' : '#1565C0',
          fontSize: '14px'
        }}>
          {mode === "chords" 
            ? "Определяет мажорные и минорные аккорды на гитаре или пианино"
            : "Определяет отдельные ноты с точностью до центов на гитаре или пианино"
          }
        </p>
      </div>

      {/* Рендерим выбранный компонент */}
      {mode === "chords" ? (
        <ChordDetector />
      ) : (
        <PitchTrainerPitchy />
      )}
    </div>
  );
}
