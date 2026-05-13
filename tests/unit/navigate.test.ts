import { describe, expect, it, vi } from 'vitest';

import Swup from '../../src/index.js';

describe('navigation', () => {
	it('should refuse to navigate to unsupported schemes', () => {
		const assign = vi.fn();
		const originalLocation = window.location;
		Object.defineProperty(window, 'location', {
			configurable: true,
			value: { ...originalLocation, assign, origin: originalLocation.origin }
		});
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const swup = new Swup();

		for (const url of [
			'javascript:alert(1)',
			'JaVaScRiPt:alert(1)',
			'data:text/html,<script>alert(1)</script>',
			'vbscript:msgbox(1)'
		]) {
			swup.navigate(url);
			expect(assign).not.toHaveBeenCalledWith(url);
		}

		expect(warn).toHaveBeenCalled();

		Object.defineProperty(window, 'location', {
			configurable: true,
			value: originalLocation
		});
		warn.mockRestore();
	});

	it('should still fall back to location.assign for cross-origin http(s) URLs', () => {
		const assign = vi.fn();
		const originalLocation = window.location;
		Object.defineProperty(window, 'location', {
			configurable: true,
			value: { ...originalLocation, assign, origin: originalLocation.origin }
		});
		const swup = new Swup();

		const url = 'https://other.example.com/page';
		swup.navigate(url);
		expect(assign).toHaveBeenCalledWith(url);

		Object.defineProperty(window, 'location', {
			configurable: true,
			value: originalLocation
		});
	});
});
