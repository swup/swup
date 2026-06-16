import { beforeEach, describe, expect, it, vi } from 'vitest';

import Swup from '../../src/Swup.js';
import { createVisit } from '../../src/modules/Visit.js';
import { performNavigation } from '../../src/modules/navigate.js';

class SwupWithPublicVisitMethods extends Swup {
	public createVisit = createVisit;
	public performNavigation = performNavigation;
}

const htmlAttrs = [
	'data-swup-history',
	'data-swup-history-action',
	'data-swup-animation',
	'data-swup-animation-name',
	'data-swup-animation-animate',
	'data-swup-animation-native',
	'data-swup-cache-read',
	'data-swup-cache-write',
	'data-swup-scroll-reset',
	'data-swup-scroll-target'
];

describe('attributes', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		for (const attr of htmlAttrs) {
			document.documentElement.removeAttribute(attr);
		}
		vi.mocked(console.warn).mockClear();
	});

	it('resolves attributes from closest ancestors', () => {
		document.body.innerHTML = `
			<div data-swup-animation-name="outer" data-swup-cache-write="false">
				<p data-swup-animation-name="inner">
					<a href="/next">next</a>
				</p>
			</div>
		`;

		const swup = new SwupWithPublicVisitMethods();
		const link = document.querySelector('a')!;
		const visit = swup.createVisit({ to: '/next', el: link });

		expect(visit.animation.name).toBe('inner');
		expect(visit.cache.write).toBe(false);
	});

	it('keeps legacy aliases and lets canonical attributes win on the same node', () => {
		document.body.innerHTML = `
			<div data-swup-animation="legacy" data-swup-animation-name="canonical">
				<a href="/next">next</a>
			</div>
		`;

		const swup = new SwupWithPublicVisitMethods();
		const link = document.querySelector('a')!;
		const visit = swup.createVisit({ to: '/next', el: link });

		expect(visit.animation.name).toBe('canonical');
	});

	it('resolves legacy aliases when no canonical attribute is present', () => {
		document.body.innerHTML = `
			<div data-swup-history="replace" data-swup-animation="legacy">
				<a href="/next">next</a>
			</div>
		`;

		const swup = new SwupWithPublicVisitMethods();
		const link = document.querySelector('a')!;
		const visit = swup.createVisit({ to: '/next', el: link });

		expect(visit.history.action).toBe('replace');
		expect(visit.animation.name).toBe('legacy');
	});

	it('coerces boolean attributes by schema', () => {
		document.body.innerHTML = `
			<div data-swup-cache-read="false" data-swup-cache-write data-swup-animation-animate="0">
				<a href="/next">next</a>
			</div>
		`;

		const swup = new SwupWithPublicVisitMethods();
		const link = document.querySelector('a')!;
		const visit = swup.createVisit({ to: '/next', el: link });

		expect(visit.cache.read).toBe(false);
		expect(visit.cache.write).toBe(true);
		expect(visit.animation.animate).toBe(true);
	});

	it('ignores invalid enum values and warns', () => {
		document.body.innerHTML = `
			<div data-swup-history-action="invalid">
				<a href="/next">next</a>
			</div>
		`;

		const swup = new SwupWithPublicVisitMethods();
		const link = document.querySelector('a')!;
		const visit = swup.createVisit({ to: '/next', el: link });

		expect(visit.history.action).toBe('push');
		expect(console.warn).toHaveBeenCalledWith(
			expect.stringContaining('Ignoring invalid value "invalid"')
		);
	});

	it('lets empty optional strings clear farther ancestors', () => {
		document.body.innerHTML = `
			<div data-swup-animation-name="outer" data-swup-scroll-target="#outer">
				<p data-swup-animation-name="" data-swup-scroll-target="">
					<a href="/next">next</a>
				</p>
			</div>
		`;

		const swup = new SwupWithPublicVisitMethods();
		const link = document.querySelector('a')!;
		const visit = swup.createVisit({ to: '/next', el: link });

		expect(visit.animation.name).toBeUndefined();
		expect(visit.scroll.target).toBeUndefined();
	});

	it('ignores empty enum values and keeps walking ancestors', () => {
		document.body.innerHTML = `
			<div data-swup-history-action="replace">
				<p data-swup-history-action="">
					<a href="/next">next</a>
				</p>
			</div>
		`;

		const swup = new SwupWithPublicVisitMethods();
		const link = document.querySelector('a')!;
		const visit = swup.createVisit({ to: '/next', el: link });

		expect(visit.history.action).toBe('replace');
		expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Ignoring invalid value ""'));
	});

	it('skips history.action but honors other attributes for popstate visits', () => {
		document.documentElement.setAttribute('data-swup-history-action', 'replace');
		document.documentElement.setAttribute('data-swup-cache-write', 'false');
		document.documentElement.setAttribute('data-swup-animation-animate', 'true');
		document.documentElement.setAttribute('data-swup-scroll-reset', 'true');

		const swup = new SwupWithPublicVisitMethods();
		const visit = swup.createVisit({ to: '/next', popstate: true });

		expect(visit.history.action).toBe('push');
		expect(visit.cache.write).toBe(false);
		expect(visit.animation.animate).toBe(true);
		expect(visit.scroll.reset).toBe(true);
	});

	it('resolves trigger-less visits from the html element', () => {
		document.documentElement.setAttribute('data-swup-history-action', 'replace');
		document.documentElement.setAttribute('data-swup-cache-read', 'false');

		const swup = new SwupWithPublicVisitMethods();
		const visit = swup.createVisit({ to: '/next' });

		expect(visit.history.action).toBe('replace');
		expect(visit.cache.read).toBe(false);
	});

	it('lets explicit navigation options override attributes', async () => {
		document.body.innerHTML = `
			<div id="swup"><a href="/next" data-swup-history-action="replace" data-swup-animation-name="dom" data-swup-cache-read="false">next</a></div>
		`;

		const swup = new SwupWithPublicVisitMethods();
		swup.fetchPage = vi.fn(async () => ({
			url: '/next',
			html: '<html><body><div id="swup">next</div></body></html>'
		}));

		let data: unknown;
		swup.hooks.on('visit:start', (visit) => {
			data = {
				history: visit.history.action,
				animation: visit.animation.name,
				cacheRead: visit.cache.read,
				animate: visit.animation.animate
			};
		});

		const link = document.querySelector('a')!;
		const visit = swup.createVisit({ to: '/next', el: link });
		await swup.performNavigation(visit, {
			animate: false,
			animation: 'api',
			history: 'push',
			cache: { read: true }
		});

		expect(data).toEqual({
			history: 'push',
			animation: 'api',
			cacheRead: true,
			animate: false
		});
	});

	it('registers plugin-defined attributes', () => {
		document.body.innerHTML = `
			<div data-swup-test-wait>
				<a href="/next">next</a>
			</div>
		`;

		const swup = new SwupWithPublicVisitMethods();
		swup.defineAttribute({
			path: 'animation.wait',
			attr: 'data-swup-test-wait',
			type: 'boolean'
		});

		const link = document.querySelector('a')!;
		const visit = swup.createVisit({ to: '/next', el: link });

		expect(visit.animation.wait).toBe(true);
	});

	it('overrides clashing plugin-defined attributes and warns', () => {
		document.body.innerHTML = `
			<div data-swup-test-override-old="old" data-swup-test-override-new="new">
				<a href="/next">next</a>
			</div>
		`;

		const swup = new SwupWithPublicVisitMethods();
		swup.defineAttribute({
			path: 'animation.__testOverride',
			attr: 'data-swup-test-override-old',
			type: 'string'
		});
		swup.defineAttribute({
			path: 'animation.__testOverride',
			attr: 'data-swup-test-override-new',
			type: 'string'
		});

		const link = document.querySelector('a')!;
		const visit = swup.createVisit({ to: '/next', el: link });

		expect((visit.animation as any).__testOverride).toBe('new');
		expect(console.warn).toHaveBeenCalledWith(
			expect.stringContaining('Attribute path "animation.__testOverride" is already registered')
		);
	});

	it('rejects unsafe plugin-defined attribute paths', () => {
		document.body.innerHTML = `
			<div data-swup-test-pollute="yes">
				<a href="/next">next</a>
			</div>
		`;

		try {
			const swup = new SwupWithPublicVisitMethods();
			swup.defineAttribute({
				path: 'meta.__proto__.__swupPolluted',
				attr: 'data-swup-test-pollute',
				type: 'string'
			});

			const link = document.querySelector('a')!;
			const visit = swup.createVisit({ to: '/next', el: link });

			expect(visit.meta).not.toHaveProperty('__swupPolluted');
			expect('__swupPolluted' in {}).toBe(false);
			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('Ignoring unsafe attribute path')
			);
		} finally {
			delete (Object.prototype as { __swupPolluted?: unknown }).__swupPolluted;
		}
	});
});
