import { describe, expect, it, vi } from 'vitest';

import Swup from '../../index.js';

function createPlugin(plugin = {}) {
	return {
		name: 'SwupTestPlugin',
		isSwupPlugin: true as const,
		mount: vi.fn(() => {}),
		unmount: vi.fn(() => {}),
		_checkRequirements: vi.fn(() => true),
		...plugin
	};
}

describe('Plugins', () => {
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
		const plugin = createPlugin({ name: 'SwupExamplePlugin' });
		const swup = new Swup({ plugins: [plugin] });
		const instance = swup.findPlugin(plugin);

		expect(instance).toEqual(expect.objectContaining({ name: 'SwupExamplePlugin' }));
	});

	it('should not find a plugin instance by wrong reference', function () {
		const plugin = createPlugin({ name: 'SwupExamplePlugin' });
		const otherPlugin = createPlugin({ name: 'SwupOtherPlugin' });
		const swup = new Swup({ plugins: [plugin] });
		const instance = swup.findPlugin(otherPlugin);

		expect(instance).toEqual(undefined);
	});

	it('should find a plugin instance by name', function () {
		const plugin = createPlugin({ name: 'SwupExamplePlugin' });
		const swup = new Swup({ plugins: [plugin] });
		const instance = swup.findPlugin('SwupExamplePlugin');

		expect(instance).toEqual(expect.objectContaining({ name: 'SwupExamplePlugin' }));
	});

	it('should find a plugin instance by unprefixed name', function () {
		const plugin = createPlugin({ name: 'SwupExamplePlugin' });
		const swup = new Swup({ plugins: [plugin] });
		const instance = swup.findPlugin('ExamplePlugin');

		expect(instance).toEqual(expect.objectContaining({ name: 'SwupExamplePlugin' }));
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
