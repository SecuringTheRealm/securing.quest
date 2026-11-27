import { describe, expect, test } from 'bun:test';
import { isPrivateAddress, isSafeRemoteUrl } from './send-webmentions.mjs';

describe('webmention URL safety', () => {
	test('rejects private IPv4 and IPv6 addresses', () => {
		expect(isPrivateAddress('127.0.0.1')).toBe(true);
		expect(isPrivateAddress('10.0.0.1')).toBe(true);
		expect(isPrivateAddress('192.168.1.1')).toBe(true);
		expect(isPrivateAddress('::1')).toBe(true);
		expect(isPrivateAddress('fd00::1')).toBe(true);
		expect(isPrivateAddress('8.8.8.8')).toBe(false);
	});

	test('requires HTTPS and rejects local hosts', () => {
		expect(isSafeRemoteUrl(new URL('http://example.com/webmention'))).toBe(false);
		expect(isSafeRemoteUrl(new URL('https://localhost/webmention'))).toBe(false);
		expect(isSafeRemoteUrl(new URL('https://example.com/webmention'))).toBe(true);
	});
});
