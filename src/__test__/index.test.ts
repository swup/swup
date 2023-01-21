import delegate from 'delegate-it';

import pckg from '../../package.json';
import Swup, { Options, Plugin } from '../index';

console.log = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();

const baseUrl = window.location.origin;

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
			ignoreVisit: (url, { el } = {}) => !!el?.closest('[data-no-swup]'),
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
		expect(swup).toBeInstanceOf(Swup);
	});

	it('defines a version', () => {
		const swup = new Swup();
		expect(swup.version).not.toBeUndefined();
		expect(swup.version).toEqual(pckg.version);
	});

	it('calls and passes relative URL to ignoreVisit', () => {
		const ignoreVisit = jest.fn(() => true);
		const swup = new Swup({ ignoreVisit });
		swup.shouldIgnoreVisit(`${baseUrl}/path/?query#hash`);

		expect(ignoreVisit.mock.calls).toHaveLength(1);
		expect((ignoreVisit.mock.lastCall as any)[0]).toEqual('/path/?query#hash');
	});

	it('passes element and event to ignoreVisit', () => {
		const el = document.createElement('a');
		el.href = `${baseUrl}/path/?query#hash`;
		const event = new MouseEvent('click') as delegate.Event<MouseEvent>;
		event.delegateTarget = el;

		const ignoreVisit = jest.fn(() => true);
		const swup = new Swup({ ignoreVisit });
		swup.linkClickHandler(event);

		expect(ignoreVisit.mock.calls).toHaveLength(1);
		expect((ignoreVisit.mock.lastCall as any)[1]).toEqual(
			expect.objectContaining({ el, event })
		);
	});

	it('calls ignoreVisit from loadPage method', () => {
		const ignoreVisit = jest.fn(() => true);
		const swup = new Swup({ ignoreVisit });
		swup.loadPage({ url: '/path/' });

		expect(ignoreVisit.mock.calls).toHaveLength(1);
	});
});
