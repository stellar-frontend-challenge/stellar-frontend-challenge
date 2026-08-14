import {
  getNetwork,
  isConnected,
  requestAccess,
  signTransaction,
  WatchWalletChanges,
} from '@stellar/freighter-api';

import { NETWORK_PASSPHRASE } from './constants';

/** Returns true if the Freighter browser extension is installed. */
export async function isFreighterInstalled() {
  const { isConnected: installed, error } = await isConnected();
  if (error) return false;
  return installed;
}

/** Returns the network name Freighter is currently set to (e.g. "TESTNET"). */
export async function getWalletNetworkName() {
  const { network, error } = await getNetwork();
  if (error) throw new Error(error.message);
  return network;
}

/** Requests access and returns the connected account's public key. */
export async function connectWallet() {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new Error(
      'Freighter is not installed. Install the extension and refresh the page.',
    );
  }

  const { address, error } = await requestAccess();
  if (error) throw new Error(error.message);
  if (!address) throw new Error('No account selected in Freighter.');
  return address;
}

/** Asks Freighter to sign a transaction XDR for the given account. */
export async function signTransactionXdr(xdr, address) {
  const { signedTxXdr, signerAddress, error } = await signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address,
  });
  if (error) throw new Error(error.message);
  return { signedTxXdr, signerAddress };
}

/**
 * Watches Freighter for account or network changes and calls `onChange` only
 * when something actually changes. Returns a function that stops watching.
 */
export function watchWalletChanges(onChange, timeout) {
  const watcher = new WatchWalletChanges(timeout);
  const { error } = watcher.watch(
    ({ address, network, networkPassphrase, error: apiError }) => {
      if (apiError) return;
      onChange({ address, network, networkPassphrase });
    },
  );
  if (error) return () => {};
  return () => watcher.stop();
}
