import {
  Asset,
  Horizon,
  Keypair,
  NotFoundError,
  Operation,
  TransactionBuilder,
  TransactionFailedError,
} from '@stellar/stellar-sdk';

import {
  FRIENDBOT_URL,
  HORIZON_URL,
  NETWORK_PASSPHRASE,
} from './constants';

const server = new Horizon.Server(HORIZON_URL);

/** Validates a Stellar public key (G… address) format. */
export function isValidAddress(address) {
  try {
    Keypair.fromPublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/** Returns true when Horizon reports the account does not exist (unfunded). */
export function isAccountNotFound(error) {
  return error instanceof NotFoundError;
}

/** Returns the native XLM balance string for an account. */
export async function fetchXlmBalance(publicKey) {
  const account = await server.loadAccount(publicKey);
  const native = account.balances.find((b) => b.asset_type === 'native');
  return native?.balance ?? '0.0000000';
}

/** Funds a new testnet account via Friendbot. */
export async function fundAccount(publicKey) {
  const response = await fetch(
    `${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`,
  );
  if (!response.ok) {
    throw new Error(
      `Friendbot request failed with status ${response.status}.`,
    );
  }
  return response.json();
}

/** Builds an unsigned XLM payment transaction for the given source account. */
export async function buildPaymentTransaction({
  sourcePublicKey,
  destination,
  amount,
}) {
  const sourceAccount = await server.loadAccount(sourcePublicKey);
  const baseFee = await server.fetchBaseFee().catch(() => 100);

  return new TransactionBuilder(sourceAccount, {
    fee: baseFee.toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount: amount.toString(),
      }),
    )
    .setTimeout(60)
    .build();
}

/** Rehydrates a signed XDR string and submits it to Horizon. */
export async function submitSignedTransaction(signedTxXdr) {
  const transaction = TransactionBuilder.fromXDR(
    signedTxXdr,
    NETWORK_PASSPHRASE,
  );
  return server.submitTransaction(transaction);
}

/** Converts SDK and network errors into user-friendly messages. */
export function formatError(error) {
  if (error instanceof TransactionFailedError) {
    const { operations } = error.getResultCodes();
    const code = operations?.[0];
    const messages = {
      op_underfunded:
        'Insufficient XLM balance to cover the payment and transaction fee.',
      op_no_destination:
        'The destination account does not exist yet and must be funded first.',
      op_no_trust: 'The destination does not accept this asset.',
      op_line_full: 'The destination trustline is at its limit.',
      op_low_reserve: 'Not enough XLM to meet the minimum balance reserve.',
      tx_bad_seq: 'Transaction sequence is stale. Please refresh and try again.',
      tx_insufficient_fee: 'Insufficient fee to submit the transaction.',
      tx_bad_auth: 'The transaction was not properly signed.',
    };
    if (code && messages[code]) return messages[code];
    return `Transaction failed${code ? ` (${code})` : ''}.`;
  }

  if (error instanceof NotFoundError) {
    return 'Account not found on the Stellar Testnet.';
  }

  if (error?.response?.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  return error?.message || 'Something went wrong. Please try again.';
}
