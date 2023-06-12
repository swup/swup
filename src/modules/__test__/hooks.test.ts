import { describe, expect, it, vi } from 'vitest';
import Swup from '../../Swup.js';
import { Handler } from '../Hooks.js';

describe('Hook registry', () => {
	it('should add custom handlers', () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.hooks.on('enabled', handler);
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

		swup.hooks.on('enabled', handler);

		await swup.hooks.trigger('enabled');

		expect(handler).toBeCalledTimes(1);
	});

	it('should only trigger custom handlers once if requested', async () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.hooks.on('enabled', handler, { once: true });

		await swup.hooks.trigger('enabled', undefined, () => {});
		await swup.hooks.trigger('enabled', undefined, () => {});

		expect(handler).toBeCalledTimes(1);
	});

	it('should only trigger custom handlers once if using alias', async () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.hooks.once('enabled', handler);

		await swup.hooks.trigger('enabled', undefined, () => {});
		await swup.hooks.trigger('enabled', undefined, () => {});

		expect(handler).toBeCalledTimes(1);
	});

	it('should trigger original handlers', async () => {
		const swup = new Swup();
		const handler = vi.fn();

		await swup.hooks.trigger('enabled', undefined, handler);

		expect(handler).toBeCalledTimes(1);
	});

	it('should preserve original handler `this` context', async () => {
		const swup = new Swup();
		let thisArg;
		const handler = vi.fn(function (this: Swup) {
			thisArg = this;
		});

		await swup.hooks.trigger('enabled', undefined, handler);

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

		swup.hooks.on('disabled', handlers.before, { before: true });
		swup.hooks.on('disabled', handlers.normal, {});
		swup.hooks.on('disabled', handlers.after, {});

		await swup.hooks.trigger('disabled', undefined, handlers.original);

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

		swup.hooks.on('disabled', handlers['1'], { priority: 1, before: true });
		swup.hooks.on('disabled', handlers['2'], { priority: 2, before: true });
		swup.hooks.on('disabled', handlers['4'], { priority: 5 });
		swup.hooks.on('disabled', handlers['6'], { priority: 4 });
		swup.hooks.on('disabled', handlers['5'], { priority: 4 });

		await swup.hooks.trigger('disabled', undefined, handlers['3']);

		expect(called).toEqual([2, 1, 3, 4, 6, 5]);
	});

	it('should allow replacing original handlers', async () => {
		const swup = new Swup();
		const listener = vi.fn();
		const handler = vi.fn();

		swup.hooks.on('enabled', listener, { replace: true });

		await swup.hooks.trigger('enabled', undefined, handler);

		expect(handler).toBeCalledTimes(0);
		expect(listener).toBeCalledTimes(1);
	});

	it('should trigger event handler with event', async () => {
		const swup = new Swup();
		const handler: Handler<'popState'> = vi.fn();
		const event = new PopStateEvent('');

		swup.hooks.on('popState', handler);
		await swup.hooks.trigger('popState', event);

		expect(handler).toBeCalledTimes(1);
		expect(handler).toBeCalledWith(event);
	});
});

describe('Event aliases', () => {
	it('should call events.on()', () => {
		const swup = new Swup();
		const on = vi.fn();

		swup.hooks.on = on;

		swup.on('enabled', () => {});

		expect(on).toBeCalledTimes(1);
	});

	it('should call events.off()', () => {
		const swup = new Swup();
		const off = vi.fn();

		swup.hooks.off = off;

		swup.off('enabled', () => {});

		expect(off).toBeCalledTimes(1);
	});
});

describe('Types', () => {
	it('error when necessary', async () => {
		const swup = new Swup();

		// @ts-expect-no-error
		swup.hooks.on('popState', (event: PopStateEvent) => {});
		// @ts-expect-no-error
		await swup.hooks.trigger('popState', new PopStateEvent(''));

		// @ts-expect-error
		swup.hooks.on('popState', (event: MouseEvent) => {});
		// @ts-expect-error
		await swup.hooks.trigger('popState', new MouseEvent(''));
	});
});
