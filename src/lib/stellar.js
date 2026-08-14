import { Horizon, Keypair, NotFoundError } from '@stellar/stellar-sdk';

import { HORIZON_URL, FRIENDBOT_URL } from './constants';

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
