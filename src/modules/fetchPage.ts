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
	const { url: requestURL } = Location.fromUrl(url);

	const cachedPage = this.cache.get(requestURL);
	if (cachedPage) {
		await this.hooks.trigger('pageLoadedFromCache', { page: cachedPage });
		return Promise.resolve(cachedPage);
	}

	return this.hooks.trigger(
		'fetchPage',
		{ url: requestURL, options, page: null },
		async (context, { url, options, page }) => {
			// Allow hooking before this handler and returning a page (e.g. preload plugin)
			if (page) {
				return page;
			}

			const headers = { ...this.options.requestHeaders, ...options.headers };

			const controller = new AbortController();
			const signal = controller.signal;

			const response = await fetch(url, { ...options, headers, signal });
			const { status, redirected } = response;
			const html = await response.text();

			if (status === 500) {
				this.hooks.trigger('serverError', { url, status, response });
				throw url;
			}

			if (!html) {
				throw url;
			}

			page = { url, html };

			// Only save cache entry for non-redirects
			if (!redirected) {
				this.cache.set(url, page);
			}

			this.hooks.trigger('pageLoaded', { page });

			return page;
		}
	);
}
