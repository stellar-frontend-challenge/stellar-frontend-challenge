export function truncateAddress(address, chars = 4) {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function validateAmount(input) {
  const trimmed = (input ?? '').trim();
  if (!trimmed) return { valid: false, error: 'Amount is required.' };
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return { valid: false, error: 'Amount must be a positive number.' };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) {
    return { valid: false, error: 'Amount must be greater than zero.' };
  }
  const decimals = trimmed.includes('.') ? trimmed.split('.')[1].length : 0;
  if (decimals > 7) {
    return { valid: false, error: 'XLM supports at most 7 decimal places.' };
  }
  return { valid: true, value: trimmed };
}
