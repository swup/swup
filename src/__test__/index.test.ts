import { DelegateEvent } from 'delegate-it';
import { describe, expect, it, vi } from 'vitest';

import pckg from '../../package.json';
import Swup, { Options, Plugin } from '../index.js';
import * as SwupUMD from '../umd.js';

const baseUrl = window.location.origin;

describe('Exports', () => {
	it('should export Swup and Options/Plugin types', () => {
		class SwupPlugin implements Plugin {
			name = 'SwupPlugin';
			isSwupPlugin = true as const;
			mount = () => {};
			unmount = () => {};
		}

		const options: Partial<Options> = {
			animateHistoryBrowsing: false,
			animationSelector: '[class*="transition-"]',
			cache: true,
			containers: ['#swup'],
			ignoreVisit: (url, { el } = {}) => !!el?.closest('[data-no-swup]'),
			linkSelector: 'a[href]',
			plugins: [new SwupPlugin()],
			resolveUrl: (url) => url,
			requestHeaders: {
				'X-Requested-With': 'swup',
				'Accept': 'text/html, application/xhtml+xml'
			},
			skipPopStateHandling: (event) => event.state?.source !== 'swup'
		};

		const swup = new Swup(options);
		expect(swup).toBeInstanceOf(Swup);
	});

	it('should define a version', () => {
		const swup = new Swup();
		expect(swup.version).not.toBeUndefined();
		expect(swup.version).toEqual(pckg.version);
	});

	it('UMD compatibility: should only have a default export', () => {
		expect(Object.keys(SwupUMD)).toEqual(['default']);
	});
});

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
