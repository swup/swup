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

export async function fetchPage(
	this: Swup,
	url: URL | string,
	options: FetchOptions
): Promise<PageData> {
	const { url: requestUrl } = Location.fromUrl(url);

	const cachedPage = this.cache.get(requestUrl);
	if (cachedPage) {
		await this.hooks.trigger('pageLoadedFromCache', { page: cachedPage });
		return Promise.resolve(cachedPage);
	}

	const headers = { ...this.options.requestHeaders, ...options.headers };
	const response = await fetch(url, { ...options, headers });
	const { status, url: responseUrl } = response;
	const html = await response.text();

	if (status === 500) {
		this.hooks.trigger('serverError', { status, response, url: responseUrl });
		throw url;
	}

	if (!html) {
		throw url;
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
