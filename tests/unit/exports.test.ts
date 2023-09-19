import { describe, expect, it } from 'vitest';

import pckg from '../../package.json';
import Swup, { Options, Plugin } from '../../src/index.js';
import * as SwupTS from '../../src/Swup.js';

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

	it('UMD compatibility: Swup.ts should only have a default export', () => {
		expect(Object.keys(SwupTS)).toEqual(['default']);
	});
});
