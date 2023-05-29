import { describe, expect, it, vi } from 'vitest';
import Swup from '../../Swup.js';

describe('events', () => {
	it('should call hooks.add()', () => {
		const swup = new Swup();
		const add = vi.fn();

		swup.hooks.add = add;

		swup.on('enabled', () => {});

		expect(add).toBeCalledTimes(1);
	});

	it('should call hooks.remove()', () => {
		const swup = new Swup();
		const remove = vi.fn();

		swup.hooks.remove = remove;

		swup.off('enabled', () => {});

		expect(remove).toBeCalledTimes(1);
	});

	it('should call hooks.call()', () => {
		const swup = new Swup();
		const call = vi.fn();

		swup.hooks.call = call;

		swup.on('enabled', () => {});
		swup.triggerEvent('enabled');

		expect(call).toBeCalledTimes(1);
	});

	// it('should trigger event handler with event', () => {
	// 	const swup = new Swup();
	// 	const handler: Handler<'popState'> = vi.fn();
	// 	const event = new PopStateEvent('');

	// 	swup.on('popState', handler);
	// 	swup.triggerEvent('popState', event);

	// 	expect(handler).toBeCalledWith(event);
	// });

	// it('types work and error when necessary', () => {
	// 	const swup = new Swup();

	// 	// @ts-expect-no-error
	// 	swup.on('popState', (event: PopStateEvent) => {});
	// 	// @ts-expect-no-error
	// 	swup.triggerEvent('popState', new PopStateEvent(''));

	// 	// @ts-expect-error
	// 	swup.on('popState', (event: MouseEvent) => {});
	// 	// @ts-expect-error
	// 	swup.triggerEvent('popState', new MouseEvent(''));
	// });
});
