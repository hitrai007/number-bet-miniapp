import React, { useState, useEffect } from 'react';

interface TimerProps {
  // TODO: Add props for bettingEndTime, cooldownEndTime, phase
}

function Timer({}: TimerProps) {
  // TODO: Implement countdown logic and display
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [phase, setPhase] = useState("Betting (TODO)");

  return (
    <div className="bg-white p-4 rounded-lg shadow text-center">
      <p className="text-sm text-gray-500 mb-1">Current Phase: <span className="font-semibold">{phase}</span></p>
      <p className="text-2xl font-bold text-purple-700">{timeLeft}</p>
      {/* TODO: Add Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
          <div className="bg-purple-600 h-2.5 rounded-full" style={{width: '50%'}}></div> {/* Placeholder width */}      
      </div>
    </div>
  );
}

export default Timer; 