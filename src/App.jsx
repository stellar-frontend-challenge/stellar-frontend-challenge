import { useCallback, useEffect, useState } from 'react';

import WalletConnect from './components/WalletConnect';
import {
  connectWallet,
  getWalletNetworkName,
  isFreighterInstalled,
} from './lib/wallet';

export default function App() {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState(null);

  const [walletInstalled, setWalletInstalled] = useState(null);
  const [network, setNetwork] = useState(null);

  const detectWallet = useCallback(async () => {
    let installed = false;
    try {
      installed = await isFreighterInstalled();
    } catch {
      installed = false;
    }
    setWalletInstalled(installed);

    if (installed) {
      try {
        setNetwork(await getWalletNetworkName());
      } catch {
        setNetwork(null);
      }
    } else {
      setNetwork(null);
    }
  }, []);

  useEffect(() => {
    detectWallet();
  }, [detectWallet]);

  async function handleConnect() {
    setConnecting(true);
    setConnectError(null);
    try {
      const publicKey = await connectWallet();
      setAddress(publicKey);
      await detectWallet();
    } catch (err) {
      setConnectError(err.message);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-lg px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Stellar Payment dApp</h1>
          <p className="mt-2 text-sm text-slate-400">
            Send XLM on the Stellar Testnet with Freighter.
          </p>
        </header>

        <WalletConnect
          address={address}
          connecting={connecting}
          walletInstalled={walletInstalled}
          network={network}
          connectError={connectError}
          onConnect={handleConnect}
        />
      </div>
    </main>
  );
}
