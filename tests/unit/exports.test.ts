import { describe, expect, it } from 'vitest';

import Swup from '../../src/index.js';
import type { Options, Plugin } from '../../src/index.js';
import * as SwupTS from '../../src/Swup.js';

describe('Exports', () => {
	it('should export Swup', () => {
		const swup = new Swup();
		expect(swup).toBeInstanceOf(Swup);
	});

	it('should export Options type', () => {
		const options: Partial<Options> = {
			animateHistoryBrowsing: false,
			animationSelector: '[class*="transition-"]',
			cache: true,
			containers: ['#swup'],
			ignoreVisit: (url, { el } = {}) => !!el?.closest('[data-no-swup]'),
			linkSelector: 'a[href]',
			plugins: [],
			hooks: {},
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

	it('should export Plugin type', () => {
		class SwupPlugin implements Plugin {
			name = 'SwupPlugin';
			isSwupPlugin = true as const;
			mount = () => {};
			unmount = () => {};
		}

		const options: Partial<Options> = {
			plugins: [new SwupPlugin()]
		};

		const swup = new Swup(options);
		expect(swup.plugins[0]).toBeInstanceOf(SwupPlugin);
	});

	it('should only have a default export for UMD compatibility', () => {
		expect(Object.keys(SwupTS)).toEqual(['default']);
	});
});
