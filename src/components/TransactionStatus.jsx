import { STELLAR_EXPERT_TX_URL } from '../lib/constants';

export default function TransactionStatus({ status, hash, error, onReset }) {
  if (status === 'idle') return null;

  if (status === 'pending') {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-500" />
          <p className="text-sm text-slate-200">
            Submitting transaction to the Stellar Testnet…
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-emerald-800/50 bg-emerald-900/20 p-5">
        <h3 className="font-semibold text-emerald-300">Payment successful 🎉</h3>
        <p className="mt-1 break-all font-mono text-sm text-emerald-200">
          {hash}
        </p>
        <a
          href={`${STELLAR_EXPERT_TX_URL}/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-medium text-emerald-400 underline"
        >
          View on Stellar Expert →
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-red-300">Payment failed</h3>
          <p className="mt-1 text-sm text-red-200">{error}</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 rounded-lg border border-red-800 px-3 py-1.5 text-sm text-red-200 transition hover:bg-red-900/40"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
