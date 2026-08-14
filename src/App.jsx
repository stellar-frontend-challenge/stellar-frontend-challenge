import { useCallback, useEffect, useState } from 'react';

import BalanceDisplay from './components/BalanceDisplay';
import WalletConnect from './components/WalletConnect';
import {
  fetchXlmBalance,
  fundAccount,
  isAccountNotFound,
} from './lib/stellar';
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

  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [exists, setExists] = useState(null);

  const [funding, setFunding] = useState(false);
  const [fundMessage, setFundMessage] = useState(null);
  const [fundError, setFundError] = useState(null);

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

  const refreshBalance = useCallback(async (publicKey) => {
    if (!publicKey) return;
    setBalanceLoading(true);
    setBalanceError(null);
    try {
      const value = await fetchXlmBalance(publicKey);
      setBalance(value);
      setExists(true);
    } catch (err) {
      if (isAccountNotFound(err)) {
        setExists(false);
        setBalance(null);
      } else {
        setBalanceError(
          err?.message || 'Failed to load balance. Please try again.',
        );
      }
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) refreshBalance(address);
  }, [address, refreshBalance]);

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

  function handleDisconnect() {
    setAddress(null);
    setConnectError(null);
    setBalance(null);
    setBalanceError(null);
    setExists(null);
    setFundMessage(null);
    setFundError(null);
  }

  async function handleFund() {
    setFunding(true);
    setFundError(null);
    setFundMessage(null);
    try {
      await fundAccount(address);
      setFundMessage('Account funded! Refreshing balance…');
      await refreshBalance(address);
    } catch (err) {
      setFundError(err?.message || 'Funding failed. Please try again.');
    } finally {
      setFunding(false);
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

        <div className="space-y-4">
          <WalletConnect
            address={address}
            connecting={connecting}
            walletInstalled={walletInstalled}
            network={network}
            connectError={connectError}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />

          <BalanceDisplay
            address={address}
            balance={balance}
            loading={balanceLoading}
            error={balanceError}
            exists={exists}
            funding={funding}
            fundMessage={fundMessage}
            fundError={fundError}
            onRefresh={() => refreshBalance(address)}
            onFund={handleFund}
          />
        </div>
      </div>
    </main>
  );
}
