// US numbers only: stored as +1 followed by 10 digits.

function digitsOnly(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("1") ? digits.slice(1) : digits;
}

export function formatPhoneForDisplay(value: string): string {
  const digits = digitsOnly(value).slice(0, 10);
  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  if (digits.length > 6) return `(${area}) ${prefix}-${line}`;
  if (digits.length > 3) return `(${area}) ${prefix}`;
  if (digits.length > 0) return `(${area}`;
  return "";
}

export function normalizePhone(value: string): string {
  const digits = digitsOnly(value).slice(0, 10);
  return digits ? `+1${digits}` : "";
}
