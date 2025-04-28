import React from 'react';

function Header() {
  // TODO: Implement Wallet Connect Button, Address Display, Allowance Status
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
      <h1 className="text-xl font-bold text-purple-700">100Bet</h1>
      <div>
        {/* Placeholder for Connect Button / User Info */}
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
          Connect Wallet (TODO)
        </button>
      </div>
    </header>
  );
}

export default Header; 