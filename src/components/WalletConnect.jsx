import { NETWORK_NAME } from '../lib/constants';
import { truncateAddress } from '../lib/format';

export default function WalletConnect({
  address,
  connecting,
  walletInstalled,
  network,
  connectError,
  onConnect,
}) {
  const connected = Boolean(address);
  const wrongNetwork = network && network !== NETWORK_NAME;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Wallet</h2>
          {connected ? (
            <p className="mt-1 font-mono text-sm text-slate-300" title={address}>
              {truncateAddress(address)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-400">Not connected</p>
          )}
        </div>

        {!connected && (
          <button
            type="button"
            onClick={onConnect}
            disabled={connecting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {connecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}
      </div>

      {walletInstalled === false && (
        <p className="mt-4 rounded-lg border border-amber-700/50 bg-amber-900/20 p-3 text-sm text-amber-200">
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

      {wrongNetwork && (
        <p className="mt-4 rounded-lg border border-amber-700/50 bg-amber-900/20 p-3 text-sm text-amber-200">
          Freighter is connected to{' '}
          <span className="font-mono">{network}</span>. Switch it to{' '}
          <span className="font-mono">Testnet</span> to use this app.
        </p>
      )}

      {connectError && (
        <p className="mt-4 rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-200">
          {connectError}
        </p>
      )}
    </div>
  );
}
