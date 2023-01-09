import Swup from '../index';

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
};

export const use = function (this: Swup, plugin: Plugin) {
	if (!plugin.isSwupPlugin) {
		console.warn(`Not swup plugin instance ${plugin}.`);
		return;
	}

	this.plugins.push(plugin);
	plugin.swup = this;
	if (typeof plugin._beforeMount === 'function') {
		plugin._beforeMount();
	}
	plugin.mount();

	return this.plugins;
};

export const unuse = function (this: Swup, plugin: Plugin) {
	let pluginReference;

	if (typeof plugin === 'string') {
		pluginReference = this.plugins.find((p) => plugin === p.name);
	} else {
		pluginReference = plugin;
	}

	if (!pluginReference) {
		console.warn('No such plugin.');
		return;
	}

	pluginReference.unmount();

	if (typeof pluginReference._afterUnmount === 'function') {
		pluginReference._afterUnmount();
	}

	const index = this.plugins.indexOf(pluginReference);
	this.plugins.splice(index, 1);

	return this.plugins;
};

export const findPlugin = function (this: Swup, pluginName: string): Plugin | undefined {
	return this.plugins.find((p) => pluginName === p.name);
};
