import { useCallback, useEffect, useRef, useState } from 'react';

import BalanceDisplay from './components/BalanceDisplay';
import PaymentForm from './components/PaymentForm';
import TransactionStatus from './components/TransactionStatus';
import WalletConnect from './components/WalletConnect';
import { NETWORK_NAME } from './lib/constants';
import {
  buildPaymentTransaction,
  fetchXlmBalance,
  formatError,
  fundAccount,
  isAccountNotFound,
  submitSignedTransaction,
} from './lib/stellar';
import {
  connectWallet,
  getWalletNetworkName,
  isFreighterInstalled,
  signTransactionXdr,
  watchWalletChanges,
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

  const [txStatus, setTxStatus] = useState({ status: 'idle' });

  const addressRef = useRef(address);

  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  const clearSession = useCallback(() => {
    setAddress(null);
    setConnectError(null);
    setBalance(null);
    setBalanceError(null);
    setExists(null);
    setFundMessage(null);
    setFundError(null);
    setTxStatus({ status: 'idle' });
  }, []);

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
        setBalanceError(formatError(err));
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

  // React to account / network changes coming from Freighter itself.
  useEffect(() => {
    if (!walletInstalled) return undefined;

    return watchWalletChanges(({ address: nextAddress, network: nextNetwork }) => {
      if (nextNetwork) setNetwork(nextNetwork);

      // Only react to account events while a session is active, so we never
      // auto-reconnect after the user disconnects or on a fresh page load.
      const current = addressRef.current;
      if (!current) return;

      if (nextAddress && nextAddress !== current) {
        setAddress(nextAddress); // account switched → balance refreshes
      } else if (!nextAddress) {
        clearSession(); // wallet locked or access revoked in Freighter
      }
    });
  }, [walletInstalled, clearSession]);

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

  async function handleSendPayment(destination, amount, memo) {
    setTxStatus({ status: 'pending' });
    try {
      const transaction = await buildPaymentTransaction({
        sourcePublicKey: address,
        destination,
        amount,
        memo,
      });
      const { signedTxXdr } = await signTransactionXdr(
        transaction.toXDR(),
        address,
      );
      const result = await submitSignedTransaction(signedTxXdr);
      setTxStatus({
        status: 'success',
        hash: result.hash,
        amount,
        destination,
        memo,
      });
      refreshBalance(address);
    } catch (err) {
      setTxStatus({ status: 'error', error: formatError(err) });
    }
  }

  const readyToSend = Boolean(address) && network === NETWORK_NAME;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-lg px-4 py-10">
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300">
            <span
              className={`h-2 w-2 rounded-full ${
                network === NETWORK_NAME ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            {network === NETWORK_NAME
              ? 'Testnet'
              : network
                ? network
                : 'Network unknown'}
          </div>
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
            onDisconnect={clearSession}
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

          <PaymentForm
            disabled={!readyToSend}
            submitting={txStatus.status === 'pending'}
            selfAddress={address}
            onSubmit={handleSendPayment}
          />

          <TransactionStatus
            status={txStatus.status}
            hash={txStatus.hash}
            error={txStatus.error}
            onReset={() => setTxStatus({ status: 'idle' })}
          />
        </div>

        <footer className="mt-10 text-center text-xs text-slate-600">
          Testnet only — no real funds are used.
        </footer>
      </div>
    </main>
  );
}
