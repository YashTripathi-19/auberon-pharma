// Strip HTML tags and dangerous characters from a string
export function sanitiseString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/javascript:/gi, '') // strip JS protocol
    .replace(/on\w+\s*=/gi, '') // strip event handlers
    .replace(/[<>]/g, '') // strip remaining < >
    .trim()
    .slice(0, 10000); // max length cap
}

// Sanitise a number — return null if invalid
export function sanitiseNumber(input: unknown): number | null {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) return null;
  return num;
}

// Sanitise email
export function sanitiseEmail(input: unknown): string {
  const str = sanitiseString(input);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str) ? str.toLowerCase() : '';
}

// Sanitise a phone number — digits, +, spaces, dashes only
export function sanitisePhone(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[^\d\s\+\-\(\)]/g, '').trim().slice(0, 20);
}

// Sanitise a URL — must start with http/https
export function sanitiseUrl(input: unknown): string {
  const str = sanitiseString(input);
  try {
    const url = new URL(str);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return str;
    }
    return '';
  } catch {
    return '';
  }
}

// Sanitise an entire object recursively — strings only, no deep nesting
export function sanitiseObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      result[key] = sanitiseString(val);
    } else if (typeof val === 'number') {
      result[key] = val;
    } else if (typeof val === 'boolean') {
      result[key] = val;
    } else if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        typeof item === 'string'
          ? sanitiseString(item)
          : typeof item === 'object' && item !== null
          ? sanitiseObject(item as Record<string, unknown>)
          : item
      );
    } else if (typeof val === 'object' && val !== null) {
      result[key] = sanitiseObject(val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

// Validate required fields — returns array of missing field names
export function validateRequired(
  obj: Record<string, unknown>,
  fields: string[]
): string[] {
  return fields.filter((f) => {
    const val = obj[f];
    return val === undefined || val === null || val === '';
  });
}
