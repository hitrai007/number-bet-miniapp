import React from 'react';
import Cell from './Cell';
import { MAX_NUMBER } from '../../lib/constants';
import { BetButton } from '../BettingGrid/BetButton';

// Remove the empty interface
// interface GridProps {
// }

export function Grid(/* props: GridProps */) { // Remove props usage if any
  // TODO: Implement grid rendering logic based on props
  const numbers = Array.from({ length: MAX_NUMBER }, (_, i) => i + 1);

  // Handler for bet button click - receives the number clicked
  const handleBetClick = (number: number) => {
    console.log('Grid received bet click for:', number);
    // TODO: Implement logic to initiate bet placement transaction
    // This might involve:
    // 1. Setting the selected number in a parent component's state
    // 2. Showing a confirmation modal
    // 3. Calling the placeBet function from the useBetting hook
  };

  return (
    <div className="grid grid-cols-10 gap-1 md:gap-2 p-1 md:p-4 bg-white rounded-lg shadow">
      {numbers.map((number) => (
        <Cell key={number} number={number} onClick={() => handleBetClick(number)} />
      ))}
    </div>
  );
}

export default Grid; 