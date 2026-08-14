import { useState } from 'react';

import { validateAmount } from '../lib/format';
import { isValidAddress } from '../lib/stellar';

export default function PaymentForm({ disabled, submitting, onSubmit }) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!destination.trim()) {
      nextErrors.destination = 'Destination address is required.';
    } else if (!isValidAddress(destination.trim())) {
      nextErrors.destination = 'Please enter a valid Stellar public key.';
    }

    const amountResult = validateAmount(amount);
    if (!amountResult.valid) {
      nextErrors.amount = amountResult.error;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(destination.trim(), amountResult.value);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
    >
      <h2 className="text-lg font-semibold text-slate-100">Send XLM</h2>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="destination" className="block text-sm text-slate-300">
            Destination address
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="G…"
            autoComplete="off"
            spellCheck={false}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-500"
          />
          {errors.destination && (
            <p className="mt-1 text-sm text-red-400">{errors.destination}</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm text-slate-300">
            Amount (XLM)
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-500"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-400">{errors.amount}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled || submitting}
        className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Sending…' : 'Send payment'}
      </button>
      {disabled && (
        <p className="mt-2 text-center text-xs text-slate-500">
          Connect your Freighter wallet on Testnet to send payments.
        </p>
      )}
    </form>
  );
}
