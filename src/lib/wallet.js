import { getNetwork, isConnected } from '@stellar/freighter-api';

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
