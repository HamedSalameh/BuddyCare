const ERROR_MAP: Record<string, string> = {
  'auth/invalid-email':           'AUTH.ERRORS.INVALID_EMAIL',
  'auth/user-not-found':          'AUTH.ERRORS.WRONG_PASSWORD',
  'auth/wrong-password':          'AUTH.ERRORS.WRONG_PASSWORD',
  'auth/invalid-credential':      'AUTH.ERRORS.WRONG_PASSWORD',
  'auth/email-already-in-use':    'AUTH.ERRORS.EMAIL_IN_USE',
  'auth/weak-password':           'AUTH.ERRORS.WEAK_PASSWORD',
  'auth/network-request-failed':  'AUTH.ERRORS.NETWORK_ERROR',
  'auth/too-many-requests':       'AUTH.ERRORS.NETWORK_ERROR',
};

export function mapAuthError(code?: string): string {
  if (!code) return 'AUTH.ERRORS.GENERIC';
  return ERROR_MAP[code] ?? 'AUTH.ERRORS.GENERIC';
}
