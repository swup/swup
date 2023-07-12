import Swup from '../Swup.js';

export type Plugin = {
	/** Name of this plugin */
	name: string;
	/** Identify as a swup plugin */
	isSwupPlugin: true;
	/** Run on mount */
	mount: () => void;
	/** Run on unmount */
	unmount: () => void;

	/** The swup instance that mounted this plugin */
	swup?: Swup;

	/** Version of this plugin. Currently not in use, defined here for backward compatiblity. */
	version?: string;
	/** Version requirements of this plugin. Example: `{ swup: '>=4' }` */
	requires?: Record<string, string>;
	_beforeMount?: () => void;
	_afterUnmount?: () => void;
	_checkRequirements?: () => boolean;
};

const isSwupPlugin = (maybeInvalidPlugin: unknown): maybeInvalidPlugin is Plugin => {
	// @ts-ignore
	return maybeInvalidPlugin?.isSwupPlugin;
};

export const use = function (this: Swup, plugin: unknown) {
	if (!isSwupPlugin(plugin)) {
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
