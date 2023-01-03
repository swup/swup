const fetchWrapper = (options, callback = false) => {
	const defaults = {
		url: window.location.pathname + window.location.search,
		method: 'GET',
		headers: {}
	};

	const { url, method, data, body, headers } = {
		...defaults,
		...options
	};

	const controller = new AbortController();
	const signal = controller.signal;

	const init = { method, headers, body: body || data, signal };

	fetch(url, init)
		.then((response) => {
			return response.text().then((html) => ({ response, html }));
		})
		.then(({ response, html }) => {
			// Compatibility layer for other methods expecting XHR properties
			response.responseURL = response.url || url;
			response.responseText = html;
			callback(response);
		})
		.catch((error) => {
			// Handle intentionally aborted requests
			if (signal.aborted && signal.reason === 'aborted') {
				callback({ error: 'aborted' });
				return;
			}
			// Handle all other errors
			callback({ error: 'error' });
		});
	/**
	 * Make `controller.abort` accessible from the outside
	 */
	return {
		abort: () => controller.abort('aborted')
	};
};

export default fetchWrapper;
