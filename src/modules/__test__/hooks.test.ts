import { describe, expect, it, vi } from 'vitest';
import Swup from '../../Swup.js';

describe('hooks', () => {
	it('should add handlers to the registry', () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.hooks.add('enabled', handler);
		const ledger = swup.hooks.registry.get('enabled');

		expect(ledger).toBeInstanceOf(Map);
		expect(ledger?.size).toBe(1);

		const registrations = Array.from(ledger.values());
		const registration = registrations.find(reg => reg.handler === handler);

		expect(registration?.handler).toEqual(handler);
	});

	it('should trigger handlers', async () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.on('enabled', handler);

		await swup.hooks.call('enabled');

		expect(handler).toBeCalledTimes(1);
	});
});
