import React, { useState } from 'react';
import { useAdminActions } from '../../hooks/useAdminActions';

function AdminPanel() {
  const [drawNumber, setDrawNumber] = useState<string>('');
  const [overrideNumber, setOverrideNumber] = useState<string>('');
  const [refundAddress, setRefundAddress] = useState<string>('');
  const [refundRoundId, setRefundRoundId] = useState<string>('');
  const [refundBetNumber, setRefundBetNumber] = useState<string>('');

  return (
    <div className="space-y-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-purple-800">Admin Dashboard</h2>
      <p className="text-center text-gray-600">Current Round ID: (TODO)</p>

      {/* Actions for Current Round */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded">
         <h3 className="text-xl font-semibold col-span-full text-center mb-4">Current Round Actions (ID: TODO)</h3>

        {/* Draw Winner */}
        <div className="space-y-2 border p-3 rounded bg-gray-50">
            <label htmlFor="overrideNumDraw" className="block text-sm font-medium text-gray-700">Winning Number (1-100):</label>
            <input id="overrideNumDraw" type="number" min="1" max="100" value={overrideNumber} onChange={(e) => setOverrideNumber(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g., 42" />
            <button onClick={() => console.log('TODO: Draw Winner')} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50">
                Draw Winner & Distribute
            </button>
        </div>

        {/* Override Winner */}
         <div className="space-y-2 border p-3 rounded bg-gray-50">
             <label htmlFor="overrideNumOverride" className="block text-sm font-medium text-gray-700">Override Number (1-100):</label>
            <input id="overrideNumOverride" type="number" min="1" max="100" value={overrideNumber} onChange={(e) => setOverrideNumber(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g., 42" />
            <button onClick={() => console.log('TODO: Override Winner')} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded disabled:opacity-50">
                Override Winner
            </button>
         </div>

        {/* Cancel Round */}
        <div className="col-span-full flex justify-around space-x-4 border p-3 rounded bg-red-50">
            <button onClick={() => console.log('TODO: Cancel Game')} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50">
                Cancel Round (Full Refund)
            </button>
        </div>

         {/* Refund Specific Bet */}
         <div className="col-span-full space-y-2 border p-3 rounded bg-blue-50">
             <h4 className="text-lg font-medium text-center">Refund Specific Bet</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                 <input type="text" value={refundAddress} onChange={(e) => setRefundAddress(e.target.value)} className="p-2 border rounded" placeholder="User Address (0x...)" />
                 <input type="number" min="1" max="100" value={refundBetNumber} onChange={(e) => setRefundBetNumber(e.target.value)} className="p-2 border rounded" placeholder="Number (1-100)" />
                 <button onClick={() => console.log('TODO: Refund Bet')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50">
                    Refund Bet
                </button>
             </div>
         </div>
      </div>

      {/* General Actions */}
       <div className="border p-4 rounded">
            <h3 className="text-xl font-semibold text-center mb-4">General Actions</h3>
            <button onClick={() => console.log('TODO: Reset Timer')} className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50">
                Reset Timer (Start New Round)
            </button>
       </div>

      {/* Bet Table (Placeholder) */}
      <div className="mt-8 border p-4 rounded">
          <h3 className="text-xl font-semibold text-center mb-4">Bet History (Current Round - Placeholder)</h3>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                    {/* TODO: Table Head and Body */}
              </table>
          </div>
      </div>
    </div>
  );
}

export default AdminPanel; 