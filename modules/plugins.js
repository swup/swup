export const use = function(plugin) {
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

export const unuse = function(plugin) {
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

export const findPlugin = function(pluginName) {
	return this.plugins.find((p) => pluginName === p.name);
};
