export const usePlugin = function(plugin) {
	if (!plugin.isSwupPlugin) {
		console.warn(`Not swup plugin instance ${plugin}.`);
		return;
	}

	this.plugins.push(plugin);
	plugin.swup = this;
	plugin.mount();

	return this.plugins;
};

export const removePlugin = function(plugin) {
	let pluginReference;

	if (typeof plugin === 'string') {
		pluginReference = this.plugins.find((p) => plugin === p.name);
	} else {
		pluginReference = plugin;
	}

	pluginReference.unmount();
	const index = this.plugins.indexOf(pluginReference);
	this.plugins.splice(index, 1);

	return this.plugins;
};

export const findPlugin = function(pluginName) {
	return this.plugins.find((p) => pluginName === p.name);
};
