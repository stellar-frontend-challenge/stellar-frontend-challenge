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

const MAX_UINT64 = 18446744073709551615n;

/**
 * Validates an optional memo. `type` is one of "none", "text", or "id".
 * Returns `{ valid, memo }` where `memo` is null (no memo) or
 * `{ type, value }`. On failure returns `{ valid, error }`.
 */
export function validateMemo(type, value) {
  if (type === 'none' || !type) return { valid: true, memo: null };

  const trimmed = (value ?? '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Memo is required when a memo type is selected.' };
  }

  if (type === 'text') {
    const bytes = new TextEncoder().encode(trimmed).length;
    if (bytes > 28) {
      return { valid: false, error: 'Text memo must be at most 28 bytes.' };
    }
    return { valid: true, memo: { type: 'text', value: trimmed } };
  }

  if (type === 'id') {
    if (!/^\d+$/.test(trimmed)) {
      return { valid: false, error: 'Memo ID must be a whole number.' };
    }
    let fits = false;
    try {
      fits = BigInt(trimmed) <= MAX_UINT64;
    } catch {
      fits = false;
    }
    if (!fits) {
      return { valid: false, error: 'Memo ID must be an unsigned 64-bit integer.' };
    }
    return { valid: true, memo: { type: 'id', value: trimmed } };
  }

  return { valid: false, error: 'Unknown memo type.' };
}
