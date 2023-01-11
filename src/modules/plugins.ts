import Swup from '../Swup.js';

// this should probably just be imported from @swup/plugin, but it doesn't have type defs now
export type Plugin = {
	name: string;
	mount: () => void;
	unmount: () => void;
	isSwupPlugin: true;
	swup?: Swup;

	// these are possibly undefined for backward compatibility
	_beforeMount?: () => void;
	_afterUnmount?: () => void;
	_checkRequirements?: () => boolean;
};

export const use = function(this: Swup, plugin: Plugin) {
	if (!plugin.isSwupPlugin) {
		console.error('Not a swup plugin instance', plugin);
		return;
	}

	plugin.swup = this;
	if (plugin._checkRequirements) {
		if (!plugin._checkRequirements()) {
			return;
		}
	}
	if (plugin._beforeMount) {
		plugin._beforeMount();
	}
	plugin.mount();

	this.plugins.push(plugin);

	return this.plugins;
};

export function unuse(this: Swup, pluginOrName: Plugin | string) {
	const plugin = this.findPlugin(pluginOrName);
	if (!plugin) {
		console.error('No such plugin', plugin);
		return;
	}

	plugin.unmount();
	if (plugin._afterUnmount) {
		plugin._afterUnmount();
	}

	this.plugins = this.plugins.filter((p) => p !== plugin);

	return this.plugins;
}

export function findPlugin(this: Swup, pluginOrName: Plugin | string) {
	return this.plugins.find((plugin) => plugin === pluginOrName || plugin.name === pluginOrName);
}
