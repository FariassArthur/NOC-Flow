'use client';

import { useState, useEffect, useRef } from 'react';
import { occurrenceAPI } from '@ccore/api-client';
import type { Occurrence } from '@ccore/shared';

interface TimerCardProps {
  occurrence: Occurrence;
  isNoc: boolean;
  onUpdate: (updated: Occurrence) => void;
}

function calcTimerDisplay(startTime: string | Date, pausedMinutes: number) {
  const elapsed = (Date.now() - new Date(startTime).getTime()) / 1000 + (pausedMinutes || 0) * 60;
  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = Math.floor(elapsed % 60);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function TimerCard({ occurrence, isNoc, onUpdate }: TimerCardProps) {
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const intervalRef = useRef(timerInterval);

  useEffect(() => {
    intervalRef.current = timerInterval;
  }, [timerInterval]);

  useEffect(() => {
    const tt = occurrence.timeTracking as any;
    if (tt?.status === 'running' && tt.startTime) {
      const interval = setInterval(() => {
        setTimerDisplay(calcTimerDisplay(tt.startTime, tt.pausedMinutes || 0));
      }, 1000);
      setTimerInterval(interval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setTimerInterval(null);
    }
  };

  const startTimer = async () => {
    try {
      const updated = await occurrenceAPI.startTimer(occurrence._id as string);
      onUpdate(updated);
      const tt = updated.timeTracking as any;
      if (tt?.startTime) {
        const interval = setInterval(() => {
          setTimerDisplay(calcTimerDisplay(tt.startTime, tt.pausedMinutes || 0));
        }, 1000);
        setTimerInterval(interval);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pauseTimer = async () => {
    try {
      const updated = await occurrenceAPI.pauseTimer(occurrence._id as string);
      onUpdate(updated);
      cleanup();
    } catch (err) {
      console.error(err);
    }
  };

  const stopTimer = async () => {
    try {
      const updated = await occurrenceAPI.stopTimer(occurrence._id as string);
      onUpdate(updated);
      cleanup();
      setTimerDisplay('00:00:00');
    } catch (err) {
      console.error(err);
    }
  };

  const tt = occurrence.timeTracking as any;
  const isTimerRunning = tt?.status === 'running';

  if (!isNoc || occurrence.status === 'finalizada') return null;

  return (
    <div className="card-wire">
      <h2 className="text-lg font-semibold text-white mb-3 relative z-10">Cronômetro</h2>
      <div className="relative z-10 flex items-center gap-4">
        <div className="text-3xl font-mono font-bold text-accent-500">
          {isTimerRunning
            ? timerDisplay
            : tt?.status === 'paused'
              ? timerDisplay
              : `${Math.floor(occurrence.timeSpentMinutes / 60)}h ${occurrence.timeSpentMinutes % 60}m`}
        </div>
        <div className="flex gap-2">
          {(!tt || tt.status === 'stopped') && (
            <button onClick={startTimer} className="btn-primary text-sm">
              Iniciar
            </button>
          )}
          {tt?.status === 'running' && (
            <button onClick={pauseTimer} className="btn-secondary text-sm">
              Pausar
            </button>
          )}
          {tt?.status === 'paused' && (
            <button onClick={startTimer} className="btn-primary text-sm">
              Retomar
            </button>
          )}
          {(tt?.status === 'running' || tt?.status === 'paused') && (
            <button
              onClick={stopTimer}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Parar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
