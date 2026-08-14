import { getNetwork, isConnected, requestAccess } from '@stellar/freighter-api';

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
