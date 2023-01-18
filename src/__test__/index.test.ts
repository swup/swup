import Swup, { Options, Plugin } from '../index';

console.log = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();

describe('exports', () => {
	it('exports Swup, and Options/Plugin types', () => {
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
			ignoreVisit: (href, { el } = {}) => !!el?.closest('[data-no-swup]'),
			linkSelector: 'a[href]',
			plugins: [new SwupPlugin()],
			resolveUrl: (url) => url,
			requestHeaders: {
				'X-Requested-With': 'swup',
				Accept: 'text/html, application/xhtml+xml'
			},
			skipPopStateHandling: (event) => event.state?.source !== 'swup'
		};

		const swup = new Swup(options);

		expect(swup.version).not.toBeUndefined();
	});
});
