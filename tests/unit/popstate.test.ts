import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Swup from '../../src/index.js';
import type { Visit } from '../../src/modules/Visit.js';

function dispatchPopState(
	url: string,
	{ hasUAVisualTransition = undefined as boolean | undefined, index = 1 } = {}
) {
	window.history.pushState({ url, source: 'swup', random: 1, index }, '', url);
	const event = new PopStateEvent('popstate', { state: window.history.state });
	if (hasUAVisualTransition !== undefined) {
		Object.defineProperty(event, 'hasUAVisualTransition', { value: hasUAVisualTransition });
	}
	window.dispatchEvent(event);
}

function captureVisit(swup: Swup): { visit: Visit | undefined } {
	const captured: { visit: Visit | undefined } = { visit: undefined };
	swup.hooks.replace('history:popstate', (visit) => {
		captured.visit = visit;
	});
	return captured;
}

describe('popstate', () => {
	let swup: Swup | undefined;

	beforeEach(() => {
		window.history.replaceState(null, '', '/page-1.html');
	});

	afterEach(async () => {
		await swup?.destroy();
		swup = undefined;
	});

	it('should disable animation and scroll by default', () => {
		swup = new Swup({ animateHistoryBrowsing: false });
		const captured = captureVisit(swup);

		dispatchPopState('/page-2.html');

		expect(captured.visit?.history.popstate).toBe(true);
		expect(captured.visit?.animation.animate).toBe(false);
		expect(captured.visit?.scroll.reset).toBe(false);
		expect(captured.visit?.scroll.target).toBe(false);
	});

	it('should enable animation and scroll reset if animating history visits', () => {
		swup = new Swup({ animateHistoryBrowsing: true });
		const captured = captureVisit(swup);

		dispatchPopState('/page-2.html');

		expect(captured.visit?.animation.animate).toBe(true);
		expect(captured.visit?.scroll.reset).toBe(true);
		expect(captured.visit?.scroll.target).toBe(false);
	});

	it('should enable animation if the browser has not animated the visit', () => {
		swup = new Swup({ animateHistoryBrowsing: true });
		const captured = captureVisit(swup);

		dispatchPopState('/page-2.html', { hasUAVisualTransition: false });

		expect(captured.visit?.animation.animate).toBe(true);
		expect(captured.visit?.scroll.reset).toBe(true);
	});

	it('should disable animation if the browser has already animated the visit', () => {
		swup = new Swup({ animateHistoryBrowsing: true });
		const captured = captureVisit(swup);

		dispatchPopState('/page-2.html', { hasUAVisualTransition: true });

		expect(captured.visit?.animation.animate).toBe(false);
		expect(captured.visit?.scroll.reset).toBe(false);
		expect(captured.visit?.scroll.target).toBe(false);
	});
});
