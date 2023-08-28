import { DelegateEvent } from 'delegate-it';
import { describe, expect, it, vi } from 'vitest';

import Swup from '../../src/index.js';

const baseUrl = window.location.origin;

describe('ignoreVisit', () => {
	it('should be called with relative URL', () => {
		const ignoreVisit = vi.fn(() => true);
		const swup = new Swup({ ignoreVisit });
		swup.shouldIgnoreVisit(`${baseUrl}/path/?query#hash`);

		expect(ignoreVisit.mock.calls).toHaveLength(1);
		expect((ignoreVisit.mock.lastCall as any)[0]).toEqual('/path/?query#hash');
	});

	it('should have access to element and event params', () => {
		const el = document.createElement('a');
		el.href = `${baseUrl}/path/?query#hash`;
		const event = new MouseEvent('click') as DelegateEvent<MouseEvent>;
		event.delegateTarget = el;

		const ignoreVisit = vi.fn(() => true);
		const swup = new Swup({ ignoreVisit });
		swup.navigate(el.href, {}, { el, event });

		expect(ignoreVisit.mock.calls).toHaveLength(1);
		expect((ignoreVisit.mock.lastCall as any)[1]).toEqual(
			expect.objectContaining({ el, event })
		);
	});

	it('should be called from visit method', () => {
		const ignoreVisit = vi.fn(() => true);
		const swup = new Swup({ ignoreVisit });
		swup.navigate('/path/');

		expect(ignoreVisit.mock.calls).toHaveLength(1);
	});
});
