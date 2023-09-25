import type Swup from '../Swup.js';

export type Plugin = {
	/** Identify as a swup plugin */
	isSwupPlugin: true;
	/** Name of this plugin */
	name: string;
	/** Version of this plugin. Currently not in use, defined here for backward compatiblity. */
	version?: string;
	/** The swup instance that mounted this plugin */
	swup?: Swup;
	/** Version requirements of this plugin. Example: `{ swup: '>=4' }` */
	requires?: Record<string, string | string[]>;
	/** Run on mount */
	mount: () => void;
	/** Run on unmount */
	unmount: () => void;
	_beforeMount?: () => void;
	_afterUnmount?: () => void;
	_checkRequirements?: () => boolean;
};

const isSwupPlugin = (maybeInvalidPlugin: unknown): maybeInvalidPlugin is Plugin => {
	// @ts-ignore: this might be anything, object or no
	return Boolean(maybeInvalidPlugin?.isSwupPlugin);
};

/** Install a plugin. */
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

/** Uninstall a plugin. */
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

/** Find a plugin by name or reference. */
export function findPlugin(this: Swup, pluginOrName: Plugin | string) {
	return this.plugins.find(
		(plugin) =>
			plugin === pluginOrName ||
			plugin.name === pluginOrName ||
			plugin.name === `Swup${String(pluginOrName)}`
	);
}
