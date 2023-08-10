import Swup from '../Swup.js';
import { Location } from '../helpers.js';

/** A page object as used by swup and its cache. */
export interface PageData {
	/** The URL of the page */
	url: string;
	/** The complete HTML response received from the server */
	html: string;
}

/** Define how a page is fetched. */
export interface FetchOptions extends RequestInit {
	/** The request method. */
	method?: 'GET' | 'POST';
	/** The body of the request: raw string, form data object or URL params. */
	body?: string | FormData | URLSearchParams;
	/** Whether this request should ignore existing cache entries. */
	cacheBypass?: boolean;
	/** Whether the response should be kept out of to the cache.  */
	cacheSkipSave?: boolean;
}

export class FetchError extends Error {
	url: string;
	status: number;
	constructor(message: string, details: { url: string; status: number }) {
		super(message);
		this.name = 'FetchError';
		this.url = details.url;
		this.status = details.status;
	}
}

/**
 * Fetch a page from the server, return it and cache it.
 */
export async function fetchPage(
	this: Swup,
	url: URL | string,
	options: FetchOptions = {}
): Promise<PageData> {
	url = Location.fromUrl(url).url;

	const headers = { ...this.options.requestHeaders, ...options.headers };
	options = { ...options, headers };

	// Allow hooking before this and returning a custom response-like object (e.g. custom fetch implementation)
	const response: Response = await this.hooks.call(
		'fetch:request',
		{ url, options },
		(visit, { url, options }) => fetch(url, options)
	);

	const { status, url: responseUrl } = response;
	const html = await response.text();

	if (status === 500) {
		this.hooks.call('fetch:error', { status, response, url: responseUrl });
		throw new FetchError(`Server error: ${responseUrl}`, { status, url: responseUrl });
	}

	if (!html) {
		throw new FetchError(`Empty response: ${responseUrl}`, { status, url: responseUrl });
	}

	// Resolve real url after potential redirect
	const { url: finalUrl } = Location.fromUrl(responseUrl);
	const page = { url: finalUrl, html };

	return page;
}
