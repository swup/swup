import { describe, expect, it, vi } from 'vitest';
import Swup from '../../Swup.js';
import { Handler } from '../events.js';

describe('events', () => {
	it('should add event handlers to handlers array', () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.on('enabled', handler);

		expect(swup._handlers.enabled.indexOf(handler)).toBe(0);
	});

	it('should remove event handlers from handlers array', () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.on('enabled', handler);
		swup.on('animationInDone', handler);
		swup.on('animationInStart', handler);

		expect(swup._handlers.enabled.indexOf(handler)).toBe(0);
		expect(swup._handlers.animationInDone.indexOf(handler)).toBe(0);
		expect(swup._handlers.animationInStart.indexOf(handler)).toBe(0);

		swup.off('enabled', handler);
		expect(swup._handlers.enabled.indexOf(handler)).toBe(-1);

		swup.off('animationInDone');
		expect(swup._handlers.animationInDone.indexOf(handler)).toBe(-1);

		swup.off();
		expect(swup._handlers.animationInStart.indexOf(handler)).toBe(-1);
	});

	it('should trigger event handler', () => {
		const swup = new Swup();
		const handler = vi.fn();

		swup.on('enabled', handler);

		swup.triggerEvent('enabled');

		expect(handler).toBeCalledTimes(1);
	});

	it('should trigger event handler with event', () => {
		const swup = new Swup();
		const handler: Handler<'popState'> = vi.fn();
		const event = new PopStateEvent('');

		swup.on('popState', handler);
		swup.triggerEvent('popState', event);

		expect(handler).toBeCalledWith(event);
	});

	it('types work and error when necessary', () => {
		const swup = new Swup();

		// @ts-expect-no-error
		swup.on('popState', (event: PopStateEvent) => {});
		// @ts-expect-no-error
		swup.triggerEvent('popState', new PopStateEvent(''));

		// @ts-expect-error
		swup.on('popState', (event: MouseEvent) => {});
		// @ts-expect-error
		swup.triggerEvent('popState', new MouseEvent(''));
	});
});
