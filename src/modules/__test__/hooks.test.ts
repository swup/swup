import { describe, expect, it, vi } from 'vitest';
import Swup from '../../Swup.js';
import { HookData } from '../Hooks.js';

describe('hooks', () => {
	it('should add custom handlers to the registry', () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.hooks.add('enabled', handler);
		const ledger = swup.hooks.registry.get('enabled');

		expect(ledger).toBeDefined();
		expect(ledger).toBeInstanceOf(Map);
		expect(ledger!.size).toBe(1);

		const registrations = Array.from(ledger!.values());
		const registration = registrations.find((reg) => reg.handler === handler);

		expect(registration?.handler).toEqual(handler);
	});

	it('should trigger custom handlers', async () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.hooks.add('enabled', handler);

		const data = { swup, hook: 'enabled' } as HookData<'enabled'>;
		await swup.hooks.call('enabled', data);

		expect(handler).toBeCalledTimes(1);
		expect(handler).toBeCalledWith(data);
	});

	it('should trigger original handlers', async () => {
		const swup = new Swup();
		const handler = vi.fn();

		const data = { swup, hook: 'enabled' } as HookData<'enabled'>;
		await swup.hooks.call('enabled', data, handler);

		expect(handler).toBeCalledTimes(1);
		expect(handler).toBeCalledWith(data);
	});

	it('should preserve original handler this context', async () => {
		const swup = new Swup();
		let thisArg;
		const handler = vi.fn(function(this: Swup) {
			thisArg = this;
		});

		const data = { swup, hook: 'enabled' } as HookData<'enabled'>;
		await swup.hooks.call('enabled', data, handler);

		expect(thisArg).toBeInstanceOf(Swup);
		expect(thisArg).toBe(swup);
	});
});
