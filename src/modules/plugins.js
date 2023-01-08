export function use(plugin) {
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

export function unuse(pluginOrName) {
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
};

export function findPlugin(pluginOrName) {
	return this.plugins.find(
		(plugin) => plugin === pluginOrName || plugin.name === pluginOrName
	);
};
