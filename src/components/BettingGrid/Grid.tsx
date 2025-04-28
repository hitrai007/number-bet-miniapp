import React from 'react';
import Cell from './Cell';
import { MAX_NUMBER } from '../../lib/constants';

interface GridProps {
  // TODO: Add props for bets data, selected number, click handler, winner, revealing state
}

function Grid({}: GridProps) {
  // TODO: Implement grid rendering logic based on props
  return (
    <div className="grid grid-cols-10 gap-1 md:gap-2 p-1 md:p-4 bg-white rounded-lg shadow">
      {Array.from({ length: MAX_NUMBER }, (_, i) => i + 1).map((number) => (
        <Cell key={number} number={number} onClick={() => console.log(`Cell ${number} clicked (TODO)`)} />
      ))}
    </div>
  );
}

export default Grid; 