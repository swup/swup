import { TransitionOptions } from '../modules/loadPage';
import { Options } from '../Swup';

export const fetch = (
	options: TransitionOptions & {
		timeout: Options['timeout'];
		headers: Options['requestHeaders'];
	},
	callback: (request: XMLHttpRequest) => void
): XMLHttpRequest => {
	const defaults = {
		url: window.location.pathname + window.location.search,
		method: 'GET',
		data: null,
		headers: {}
	};

	const { url, method, timeout, headers, data } = { ...defaults, ...options };

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

	if (timeout > 0) {
		request.timeout = timeout;
		request.ontimeout = function () {
			window.location.href = url;
		};
	}

	request.send(data);

	return request;
};
