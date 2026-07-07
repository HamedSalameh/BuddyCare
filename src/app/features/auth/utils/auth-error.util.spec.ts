import { mapAuthError } from './auth-error.util';

describe('mapAuthError', () => {
  it('should map invalid-email code', () => {
    expect(mapAuthError('auth/invalid-email')).toBe('AUTH.ERRORS.INVALID_EMAIL');
  });

  it('should map wrong-password code', () => {
    expect(mapAuthError('auth/wrong-password')).toBe('AUTH.ERRORS.WRONG_PASSWORD');
  });

  it('should map invalid-credential to wrong-password', () => {
    expect(mapAuthError('auth/invalid-credential')).toBe('AUTH.ERRORS.WRONG_PASSWORD');
  });

  it('should map email-already-in-use', () => {
    expect(mapAuthError('auth/email-already-in-use')).toBe('AUTH.ERRORS.EMAIL_IN_USE');
  });

  it('should map weak-password', () => {
    expect(mapAuthError('auth/weak-password')).toBe('AUTH.ERRORS.WEAK_PASSWORD');
  });

  it('should map network error', () => {
    expect(mapAuthError('auth/network-request-failed')).toBe('AUTH.ERRORS.NETWORK_ERROR');
  });

  it('should return GENERIC for unknown codes', () => {
    expect(mapAuthError('auth/unknown-error')).toBe('AUTH.ERRORS.GENERIC');
  });

  it('should return GENERIC when code is undefined', () => {
    expect(mapAuthError(undefined)).toBe('AUTH.ERRORS.GENERIC');
  });

  it('should return GENERIC when code is empty string', () => {
    expect(mapAuthError('')).toBe('AUTH.ERRORS.GENERIC');
  });
});
