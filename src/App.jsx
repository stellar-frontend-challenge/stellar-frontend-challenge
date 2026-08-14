import { useCallback, useEffect, useState } from 'react';

import { NETWORK_NAME } from './lib/constants';
import { getWalletNetworkName, isFreighterInstalled } from './lib/wallet';

export default function App() {
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-lg px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Stellar Payment dApp</h1>
          <p className="mt-2 text-sm text-slate-400">
            Send XLM on the Stellar Testnet with Freighter.
          </p>
        </header>

        {walletInstalled === false && (
          <p className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4 text-sm text-amber-200">
            Freighter is not installed.{' '}
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Install Freighter
            </a>{' '}
            and refresh this page.
          </p>
        )}

        {walletInstalled && network && network !== NETWORK_NAME && (
          <p className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4 text-sm text-amber-200">
            Freighter is connected to{' '}
            <span className="font-mono">{network}</span>. Switch it to{' '}
            <span className="font-mono">Testnet</span> to use this app.
          </p>
        )}
      </div>
    </main>
  );
}
