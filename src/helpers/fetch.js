const defaults = {
	url: window.location.pathname + window.location.search,
	method: 'GET',
	headers: {}
};

const fetchWrapper = (options, callback = false) => {
	const { url, method, data, body, headers } = { ...defaults, ...options };

	const init = { method, headers, body: body || data };

	return fetch(url, init)
		.then((response) => response.text())
		.then((html) => {
			// Compatibility layer for other methods expecting XHR properties
			response.responseURL = response.url;
			response.responseText = html;
			callback(response);
		});
};

export default fetchWrapper;
