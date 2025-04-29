import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import { Header } from './components/Core/Header';
import Footer from './components/Core/Footer';
import useFrame from '@farcaster/frame-sdk';
// const { address } = useAccount(); // Keep address commented out for now

function App() {
  const { sdk } = useFrame();
  const location = useLocation();

  // Notify Farcaster client that the app is ready
  useEffect(() => {
    // Checking if sdk is available (runs only in Farcaster client environment)
    if (sdk) {
      sdk.actions.ready().catch((error: unknown) => {
        console.warn('Failed to signal ready to Farcaster client:', error);
      });
    }
  }, [sdk]);

  // Optional: Request account connection automatically on load if needed
  // useEffect(() => {
  //   if (!isConnected && sdk?.wallet.ethProvider) {
  //     sdk.wallet.ethProvider.request({ method: 'eth_requestAccounts' }).catch(console.error);
  //   }
  // }, [isConnected, sdk]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Only show header/footer on non-admin routes or adjust as needed */}
      {location.pathname !== '/admin' && <Header />}
      <main className="flex-grow container mx-auto p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      {location.pathname !== '/admin' && <Footer />}
    </div>
  );
}

export default App; 