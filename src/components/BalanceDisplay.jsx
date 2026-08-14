export default function BalanceDisplay({
  address,
  balance,
  loading,
  error,
  exists,
  funding,
  fundMessage,
  fundError,
  onRefresh,
  onFund,
}) {
  if (!address) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-100">XLM Balance</h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="mt-3">
        {loading ? (
          <p className="text-sm text-slate-400">Loading balance…</p>
        ) : error ? (
          <p className="rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-200">
            {error}
          </p>
        ) : exists === false ? (
          <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4">
            <p className="text-sm text-amber-200">
              This account is not funded on the testnet yet.
            </p>
            <button
              type="button"
              onClick={onFund}
              disabled={funding}
              className="mt-3 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
            >
              {funding ? 'Funding…' : 'Fund with Friendbot'}
            </button>
            {fundMessage && (
              <p className="mt-2 text-sm text-emerald-300">{fundMessage}</p>
            )}
            {fundError && (
              <p className="mt-2 text-sm text-red-300">{fundError}</p>
            )}
          </div>
        ) : (
          <p className="text-2xl font-semibold text-slate-100">
            {balance}{' '}
            <span className="text-base font-normal text-slate-400">XLM</span>
          </p>
        )}
      </div>
    </div>
  );
}
