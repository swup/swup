import { Options } from '../Swup.js';

type Headers = Options['requestHeaders'];

export type FetchOptions = {
	method?: 'GET' | 'POST';
	headers?: Headers;
	data?: XMLHttpRequestBodyInit;
};

export const fetch = (
	url: string,
	options: FetchOptions = {},
	callback: (request: XMLHttpRequest) => void
): XMLHttpRequest => {
	const { method = 'GET', headers = {}, data = null } = options;

	const request = new XMLHttpRequest();

	request.onreadystatechange = () => {
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
