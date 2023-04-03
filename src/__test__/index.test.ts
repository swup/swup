import delegate from 'delegate-it';
import { describe, expect, it, vi } from 'vitest';

import pckg from '../../package.json';
import Swup, { Options, Plugin } from '../index.js';

const baseUrl = window.location.origin;

function createPlugin(plugin = {}) {
	return {
		name: 'TestPlugin',
		isSwupPlugin: true as const,
		mount: vi.fn(() => {}),
		unmount: vi.fn(() => {}),
		_checkRequirements: vi.fn(() => true),
		...plugin
	};
}

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
				Accept: 'text/html, application/xhtml+xml'
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
		const event = new MouseEvent('click') as delegate.Event<MouseEvent>;
		event.delegateTarget = el;

		const ignoreVisit = vi.fn(() => true);
		const swup = new Swup({ ignoreVisit });
		swup.linkClickHandler(event);

		expect(ignoreVisit.mock.calls).toHaveLength(1);
		expect((ignoreVisit.mock.lastCall as any)[1]).toEqual(
			expect.objectContaining({ el, event })
		);
	});

	it('should be called from loadPage method', () => {
		const ignoreVisit = vi.fn(() => true);
		const swup = new Swup({ ignoreVisit });
		swup.loadPage({ url: '/path/' });

		expect(ignoreVisit.mock.calls).toHaveLength(1);
	});
});

describe('Plugin module', () => {
	it('should mount and unmount plugins', function () {
		const plugin = createPlugin();
		const swup = new Swup();
		swup.use(plugin);
		swup.unuse(plugin);

		expect(plugin.mount.mock.calls).toHaveLength(1);
		expect(plugin.unmount.mock.calls).toHaveLength(1);
	});

	it('should mount plugins from options', function () {
		const plugin = createPlugin();
		const swup = new Swup({ plugins: [plugin] });
		expect(plugin.mount.mock.calls).toHaveLength(1);
	});

	it('should find a plugin instance by reference', function () {
		const plugin = createPlugin({ name: 'ExamplePlugin' });
		const swup = new Swup({ plugins: [plugin] });
		const instance = swup.findPlugin(plugin);

		expect(instance).toEqual(expect.objectContaining({ name: 'ExamplePlugin' }));
	});

	it('should find a plugin instance by name', function () {
		const plugin = createPlugin({ name: 'ExamplePlugin' });
		const swup = new Swup({ plugins: [plugin] });
		const instance = swup.findPlugin('ExamplePlugin');

		expect(instance).toEqual(expect.objectContaining({ name: 'ExamplePlugin' }));
	});

	it('should check plugin requirements', function () {
		const plugin = createPlugin();
		const swup = new Swup({ plugins: [plugin] });
		expect(plugin._checkRequirements.mock.calls).toHaveLength(1);
	});

	it('should reject plugins with unmet requirements', function () {
		const allowedPlugin = createPlugin({
			name: 'AllowedPlugin',
			_checkRequirements: () => true
		});
		const unallowedPlugin = createPlugin({
			name: 'UnallowedPlugin',
			_checkRequirements: () => false
		});
		const swup = new Swup({ plugins: [allowedPlugin, unallowedPlugin] });

		const allowedInstance = swup.findPlugin(allowedPlugin);
		expect(allowedInstance).toEqual(expect.objectContaining({ name: 'AllowedPlugin' }));

		const unallowedInstance = swup.findPlugin(unallowedPlugin);
		expect(unallowedInstance).toBeUndefined();
	});
});
