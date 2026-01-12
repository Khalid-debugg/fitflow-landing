import { nanoid } from 'nanoid';

/**
 * Generate a unique license key in format: XXXX-XXXX-XXXX-XXXX
 * Uses alphanumeric characters (uppercase) for readability
 * Example: FG7K-9P2M-XH4N-8QW3
 */
export function generateLicenseKey(): string {
  // Generate 4 segments of 4 characters each
  const segments: string[] = [];

  for (let i = 0; i < 4; i++) {
    // Generate random string and take uppercase letters and numbers only
    const segment = nanoid(4).toUpperCase().replace(/[^A-Z0-9]/g, '');

    // If segment is not 4 chars (due to replacement), regenerate
    if (segment.length < 4) {
      i--;
      continue;
    }

    segments.push(segment.substring(0, 4));
  }

  return segments.join('-');
}

/**
 * Validate license key format
 * @param key - License key to validate
 * @returns True if format is valid (XXXX-XXXX-XXXX-XXXX)
 */
export function validateLicenseKeyFormat(key: string): boolean {
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(key);
}
