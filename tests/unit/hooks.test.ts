import { describe, expect, it, vi } from 'vitest';
import Swup from '../../src/Swup.js';
import { Hooks, type HookHandler, type HookDefaultHandler } from '../../src/modules/Hooks.js';
import { type Visit, createVisit } from '../../src/modules/Visit.js';

class SwupWithPublicVisitMethods extends Swup {
	public createVisit = createVisit;
}

const swup = new SwupWithPublicVisitMethods();

describe('Hook registry', () => {
	it('should add handlers', () => {
		const swup = new Swup();
		const handler = vi.fn();

		// Make private fields public for this test
		const HooksWithAccess = class extends Hooks {
			getRegistry() {
				return this.registry;
			}
		};
		const hooks = new HooksWithAccess(swup);

		hooks.on('enable', handler);
		const ledger = hooks.getRegistry().get('enable');

		expect(ledger).toBeDefined();
		expect(ledger).toBeInstanceOf(Map);
		expect(ledger!.size).toBe(1);

		const registrations = Array.from(ledger!.values());
		const registration = registrations.find((reg) => reg.handler === handler);

		expect(registration?.handler).toEqual(handler);
	});

	it('should remove handlers', async () => {
		const swup = new Swup();
		const handler1 = vi.fn();
		const handler2 = vi.fn();

		swup.hooks.on('enable', handler1);
		swup.hooks.on('enable', handler2);

		await swup.hooks.call('enable', undefined, undefined);

		expect(handler1).toBeCalledTimes(1);
		expect(handler2).toBeCalledTimes(1);

		swup.hooks.off('enable', handler2);

		await swup.hooks.call('enable', undefined, undefined);

		expect(handler1).toBeCalledTimes(2);
		expect(handler2).toBeCalledTimes(1);
	});

	it('should return a function to unregister the handler', async () => {
		const swup = new Swup();
		const handler1 = vi.fn();
		const handler2 = vi.fn();

		const unregister1 = swup.hooks.on('enable', handler1);
		const unregister2 = swup.hooks.on('enable', handler2);

		expect(unregister1).toBeTypeOf('function');

		await swup.hooks.call('enable', undefined, undefined);

		expect(handler1).toBeCalledTimes(1);
		expect(handler2).toBeCalledTimes(1);

		unregister2();

		await swup.hooks.call('enable', undefined, undefined);

		expect(handler1).toBeCalledTimes(2);
		expect(handler2).toBeCalledTimes(1);
	});

	it('should trigger custom handlers', async () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.hooks.on('enable', handler);

		await swup.hooks.call('enable', undefined, undefined);

		expect(handler).toBeCalledTimes(1);
	});

	it('should only trigger custom handlers once if requested', async () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.hooks.on('enable', handler, { once: true });

		await swup.hooks.call('enable', undefined, undefined, () => {});
		await swup.hooks.call('enable', undefined, undefined, () => {});

		expect(handler).toBeCalledTimes(1);
	});

	it('should only trigger custom handlers once if using alias', async () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.hooks.once('enable', handler);

		await swup.hooks.call('enable', undefined, undefined, () => {});
		await swup.hooks.call('enable', undefined, undefined, () => {});

		expect(handler).toBeCalledTimes(1);
	});

	it('should trigger original handlers', async () => {
		const swup = new Swup();
		const handler = vi.fn();

		await swup.hooks.call('enable', undefined, undefined, handler);

		expect(handler).toBeCalledTimes(1);
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

		swup.hooks.on('disable', handlers.before, { before: true });
		swup.hooks.on('disable', handlers.normal, {});
		swup.hooks.on('disable', handlers.after, {});

		await swup.hooks.call('disable', undefined, undefined, handlers.original);

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
			},
			7: () => {
				called.push(7);
			},
			8: () => {
				called.push(8);
			},
			9: () => {
				called.push(9);
			}
		};

		swup.hooks.on('disable', handlers['1'], { priority: 2, before: true });
		swup.hooks.on('disable', handlers['2'], { priority: -1, before: true });
		swup.hooks.on('disable', handlers['3'], { priority: 1 });
		swup.hooks.on('disable', handlers['9']);
		swup.hooks.on('disable', handlers['4']);
		swup.hooks.on('disable', handlers['8'], { priority: 4 });
		swup.hooks.on('disable', handlers['7'], { priority: 4 });

		await swup.hooks.call('disable', undefined, undefined, handlers['5']);

		expect(called).toEqual([2, 1, 5, 9, 4, 3, 8, 7]);
	});

	it('should allow replacing original handlers', async () => {
		const swup = new Swup();
		const customHandler = vi.fn();
		const defaultHandler = vi.fn();

		swup.hooks.on('enable', customHandler, { replace: true });

		await swup.hooks.call('enable', undefined, undefined, defaultHandler);

		expect(defaultHandler).toBeCalledTimes(0);
		expect(customHandler).toBeCalledTimes(1);
	});

	it('should only execute the last replacing handler', async () => {
		const swup = new Swup();
		const firstHandler = vi.fn();
		const secondHandler = vi.fn();
		const defaultHandler = vi.fn();

		swup.hooks.on('enable', firstHandler, { replace: true });
		swup.hooks.on('enable', secondHandler, { replace: true });

		await swup.hooks.call('enable', undefined, undefined, defaultHandler);

		expect(defaultHandler).toBeCalledTimes(0);
		expect(firstHandler).toBeCalledTimes(0);
		expect(secondHandler).toBeCalledTimes(1);
	});

	it('should pass original handler into replacing handlers', async () => {
		const swup = new Swup();
		const args = { foo: 'bar' };
		const customHandler = vi.fn((c, a, handler) => handler(c, args));
		const defaultHandler = vi.fn();
		const visit = swup.visit;

		swup.hooks.on('enable', customHandler, { replace: true });

		await swup.hooks.call('enable', undefined, undefined, defaultHandler);

		expect(customHandler).toBeCalledWith(visit, undefined, defaultHandler);
		expect(defaultHandler).toBeCalledWith(visit, args);
	});

	it('should return result of replacing handler', async () => {
		const swup = new Swup();
		const customHandler = vi.fn(async () => 'foo');
		const defaultHandler = vi.fn(async () => 'bar');

		swup.hooks.on('enable', customHandler, { replace: true });

		const result = await swup.hooks.call('enable', undefined, undefined, defaultHandler);

		expect(result).toEqual('foo');
	});

	it('should pass previous handler into nested replacing handlers', async () => {
		const swup = new Swup();
		const args1 = { foo: 'bar' };
		const args2 = { foo: 'baz' };
		const args3 = { foo: 'bag' };
		const defaultHandler = vi.fn();
		const firstHandler = vi.fn((c, a, handler) => handler(c, args1));
		const secondHandler = vi.fn((c, a, handler) => handler(c, args2));
		const thirdHandler = vi.fn((c, a, handler) => handler(c, args3, handler));
		const visit = swup.visit;

		swup.hooks.on('enable', firstHandler, { replace: true });
		swup.hooks.on('enable', secondHandler, { replace: true });
		swup.hooks.on('enable', thirdHandler, { replace: true });

		await swup.hooks.call('enable', undefined, undefined, defaultHandler);

		expect(defaultHandler).toBeCalledWith(visit, args1);
		expect(thirdHandler).toBeCalledWith(visit, undefined, expect.any(Function));
		expect(secondHandler).toBeCalledWith(visit, args3, expect.any(Function));
		expect(firstHandler).toBeCalledWith(visit, args2, expect.any(Function));
	});

	it('should not pass original handler into normal handlers', async () => {
		const swup = new Swup();
		const listener = vi.fn();
		const handler = vi.fn();
		const visit = swup.visit;

		swup.hooks.on('enable', listener);

		await swup.hooks.call('enable', undefined, undefined, handler);

		expect(listener).toBeCalledWith(visit, undefined, undefined);
	});

	it('should allow replacing original handler only once', async () => {
		const swup = new Swup();
		const customHandler = vi.fn();
		const defaultHandler = vi.fn();

		swup.hooks.on('enable', customHandler, { replace: true, once: true });

		await swup.hooks.call('enable', undefined, undefined, defaultHandler);
		expect(defaultHandler).toBeCalledTimes(0);
		expect(customHandler).toBeCalledTimes(1);

		await swup.hooks.call('enable', undefined, undefined, defaultHandler);
		expect(defaultHandler).toBeCalledTimes(1);
		expect(customHandler).toBeCalledTimes(1);
	});

	it('should trigger hook handler with visit and args', async () => {
		const swup = new SwupWithPublicVisitMethods();
		const handler: HookHandler<'history:popstate'> = vi.fn();
		const visit = swup.visit;
		const customVisit = swup.createVisit({ to: '' });
		const args = { event: new PopStateEvent('') };

		swup.hooks.on('history:popstate', handler);

		// Trigger with specific visit
		await swup.hooks.call('history:popstate', visit, args);
		await swup.hooks.call('history:popstate', customVisit, args);
		// Trigger without specific visit, i.e. with fallback visit
		await swup.hooks.call('history:popstate', undefined, args);

		expect(handler).toBeCalledTimes(3);
		expect(handler).toHaveBeenNthCalledWith(1, visit, args, undefined);
		expect(handler).toHaveBeenNthCalledWith(2, customVisit, args, undefined);
		expect(handler).toHaveBeenNthCalledWith(3, visit, args, undefined);
	});

	it('should accept legacy argument position', async () => {
		const swup = new SwupWithPublicVisitMethods();
		const handler: HookHandler<'history:popstate'> = vi.fn();
		const enableHandler: HookHandler<'enable'> = vi.fn();
		const defaultHandler: HookDefaultHandler<'history:popstate'> = vi.fn();
		const visit = swup.visit;
		const args = { event: new PopStateEvent('') };

		swup.hooks.on('history:popstate', handler);
		swup.hooks.on('enable', enableHandler);

		// Trigger with legacy argument position
		await swup.hooks.call('history:popstate', args, defaultHandler);
		await swup.hooks.call('history:popstate', args);
		await swup.hooks.call('enable', undefined, undefined);

		expect(handler).toBeCalledTimes(2);
		expect(handler).toHaveBeenNthCalledWith(1, visit, args, undefined);
		expect(handler).toHaveBeenNthCalledWith(2, visit, args, undefined);
		expect(enableHandler).toHaveBeenNthCalledWith(1, visit, undefined, undefined);

		expect(defaultHandler).toBeCalledTimes(1);
		expect(defaultHandler).toHaveBeenNthCalledWith(1, visit, args, undefined);
	});

	it('should swallow exceptions in user handlers', async () => {
		const swup = new Swup();
		const handlerWithError = vi.fn(() => {
			throw new Error('UserError');
		});

		swup.hooks.on('enable', handlerWithError);
		await expect(swup.hooks.call('enable', undefined, undefined)).resolves.toBeUndefined();
		expect(handlerWithError).toBeCalledTimes(1);
	});

	it('should re-throw exceptions in default handlers', async () => {
		const swup = new Swup();
		const handlerWithError = vi.fn(() => {
			throw new Error('UserError');
		});

		swup.hooks.before('enable', handlerWithError); // run before default handler
		await expect(() => swup.hooks.call('enable', undefined, undefined, handlerWithError)).rejects.toThrow(/^UserError$/);
		expect(handlerWithError).toBeCalledTimes(2);
	});

	it('should register hook handlers from options', async function () {
		const hookSpy = vi.spyOn(Hooks.prototype, 'on');
		const handler = vi.fn();
		const swup = new Swup({ hooks: { 'visit:start': handler } });

		await swup.hooks.call('visit:start', undefined, undefined);

		expect(hookSpy).toBeCalledTimes(1);
		expect(hookSpy).toBeCalledWith('visit:start', handler, {});
		expect(handler).toBeCalledTimes(1);
	});

	it('should accept hook registration modifiers from options', async function () {
		const hookSpy = vi.spyOn(Hooks.prototype, 'on');
		const handler = vi.fn();
		const swup = new Swup({
			hooks: {
				'visit:start': handler,
				'visit:start.before': handler,
				'visit:start.once': handler,
				'visit:start.once.before': handler
			}
		});

		expect(hookSpy).toBeCalledTimes(4);
		expect(hookSpy).toBeCalledWith('visit:start', handler, {});
		expect(hookSpy).toBeCalledWith('visit:start', handler, { before: true });
		expect(hookSpy).toBeCalledWith('visit:start', handler, { once: true });
		expect(hookSpy).toBeCalledWith('visit:start', handler, { once: true, before: true });
	});
});

describe('Types', () => {
	it('error when necessary', async () => {
		const swup = new Swup();

		// @ts-expect-no-error
		swup.hooks.on(
			'history:popstate',
			(visit: Visit, { event }: { event: PopStateEvent }) => {}
		);
		// @ts-expect-no-error
		await swup.hooks.call('history:popstate', undefined, { event: new PopStateEvent('') });

		// @ts-expect-error: first arg must be Visit object
		swup.hooks.on('history:popstate', ({ event: MouseEvent }) => {});
		// @ts-expect-error: event arg must be PopStateEvent
		swup.hooks.on('history:popstate', (visit: Visit, { event }: { event: MouseEvent }) => {});
		// @ts-expect-error: event arg must be PopStateEvent
		await swup.hooks.call('history:popstate', undefined, { event: new MouseEvent('') });
		// @ts-expect-error: handler arg must be optional: handler?
		swup.hooks.replace('enable', (visit: Visit, args: undefined, handler: HookDefaultHandler<'enable'>) => {});
	});
});
