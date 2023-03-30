import { TransitionOptions } from '../modules/loadPage.js';
import { Options } from '../Swup.js';

export const fetch = (
	options: TransitionOptions & { headers: Options['requestHeaders'] },
	callback: (request: XMLHttpRequest) => void
): XMLHttpRequest => {
	const defaults = {
		url: window.location.pathname + window.location.search,
		method: 'GET',
		data: null,
		headers: {}
	};

	const { url, method, headers, data } = { ...defaults, ...options };

	const request = new XMLHttpRequest();

	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			// if (request.status === 500) {} else {}
			callback(request);
		}
	};

	request.open(method, url, true);
	Object.entries(headers).forEach(([key, header]) => {
		request.setRequestHeader(key, header);
	});
	request.send(data);

	return request;
};
