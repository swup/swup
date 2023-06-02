import { describe, expect, it, vi } from 'vitest';
import Swup from '../../Swup.js';
import { HookData } from '../Hooks.js';

describe('Hooks', () => {
	it('should add custom handlers', () => {
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

	it('should only trigger custom handlers once if requested', async () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.hooks.add('enabled', handler, { once: true });

		const data = { swup, hook: 'enabled' } as HookData<'enabled'>;
		await swup.hooks.call('enabled', data, () => {});
		await swup.hooks.call('enabled', data, () => {});

		expect(handler).toBeCalledTimes(1);
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
		const handler = vi.fn(function (this: Swup) {
			thisArg = this;
		});

		const data = { swup, hook: 'enabled' } as HookData<'enabled'>;
		await swup.hooks.call('enabled', data, handler);

		expect(thisArg).toBeInstanceOf(Swup);
		expect(thisArg).toBe(swup);
	});

	it('should allow triggering custom handlers before original handler', async () => {
		const swup = new Swup();

		let called: Array<string> = [];
		const handlers = {
			before: () => {
				called.push('before');
			},
			original: () => {
				called.push('original');
			},
			normal: () => {
				called.push('normal');
			},
			after: () => {
				called.push('after');
			}
		};

		swup.hooks.add('disabled', handlers.before, { before: true });
		swup.hooks.add('disabled', handlers.normal, {});
		swup.hooks.add('disabled', handlers.after, {});

		const data = { swup, hook: 'disabled' } as HookData<'disabled'>;
		await swup.hooks.call('disabled', data, handlers.original);

		expect(called).toEqual(['before', 'original', 'normal', 'after']);
	});

	it('should sort custom handlers by priority', async () => {
		const swup = new Swup();

		let called: Array<number> = [];
		const handlers = {
			1: () => {
				called.push(1);
			},
			2: () => {
				called.push(2);
			},
			3: () => {
				called.push(3);
			},
			4: () => {
				called.push(4);
			},
			5: () => {
				called.push(5);
			},
			6: () => {
				called.push(6);
			}
		};

		swup.hooks.add('disabled', handlers['1'], { priority: 1, before: true });
		swup.hooks.add('disabled', handlers['2'], { priority: 2, before: true });
		swup.hooks.add('disabled', handlers['4'], { priority: 5 });
		swup.hooks.add('disabled', handlers['6'], { priority: 4 });
		swup.hooks.add('disabled', handlers['5'], { priority: 4 });

		const data = { swup, hook: 'disabled' } as HookData<'disabled'>;
		await swup.hooks.call('disabled', data, handlers['3']);

		expect(called).toEqual([2, 1, 3, 4, 6, 5]);
	});
});
