const INDIAN_PHONE_LENGTH = 10;

export function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits;
}

export function isValidIndianPhone(value: string) {
  return /^[6-9]\d{9}$/.test(normalizePhone(value));
}

export function phoneLookupCandidates(value: string) {
  const raw = value.trim();
  const normalized = normalizePhone(raw);
  const candidates = new Set([raw, normalized]);

  if (normalized.length === INDIAN_PHONE_LENGTH) {
    candidates.add(`0${normalized}`);
    candidates.add(`91${normalized}`);
    candidates.add(`+91${normalized}`);
  }

  return [...candidates].filter(Boolean);
}
