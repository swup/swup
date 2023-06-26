import Swup from '../Swup.js';
import { Location } from '../helpers.js';

export interface PageData {
	url: string;
	html: string;
}

export interface FetchOptions extends RequestInit {
	method?: 'GET' | 'POST';
	body?: string | FormData | URLSearchParams;
	headers?: Record<string, string>;
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
	options: FetchOptions
): Promise<PageData> {
	const { url: requestUrl } = Location.fromUrl(url);

	if (this.cache.has(requestUrl)) {
		const page = this.cache.get(requestUrl) as PageData;
		await this.hooks.trigger('pageLoadedFromCache', { page });
		return page;
	}

	const headers = { ...this.options.requestHeaders, ...options.headers };

	const response = await this.hooks.trigger(
		'fetchPage',
		{ url: requestUrl, options },
		async (context, { url, options, response }) => {
			return await (response || fetch(url, { ...options, headers }));
		}
	);
	const { status, url: responseUrl } = response;
	const html = await response.text();

	if (status === 500) {
		this.hooks.trigger('serverError', { status, response, url: responseUrl });
		throw new FetchError(`Server error: ${responseUrl}`, { status, url: responseUrl });
	}

	if (!html) {
		throw new FetchError(`Empty response: ${responseUrl}`, { status, url: responseUrl });
	}

	// Resolve real url after potential redirect
	const { url: finalUrl } = new Location(responseUrl);
	const page = { url: finalUrl, html };

	// Only save cache entry for non-redirects
	if (requestUrl === finalUrl) {
		this.cache.set(page.url, page);
	}

	await this.hooks.trigger('pageLoaded', { page });

	return page;
}
