import Swup from '../Swup.js';
import { Location, fetch } from '../helpers.js';
import { PageLoadOptions } from './loadPage.js';

export type PageData = {
	url: string;
	html: string;
};

export async function fetchPage(
	this: Swup,
	url: string,
	data: PageLoadOptions = {}
): Promise<PageData> {
	const headers = this.options.requestHeaders;
	const { url: requestURL } = Location.fromUrl(url);

	const cachedPage = this.cache.getPage(requestURL);
	if (cachedPage) {
		await this.hooks.trigger('pageRetrievedFromCache', { page: cachedPage });
		return Promise.resolve(cachedPage);
	}

	const page = await new Promise<PageData>((resolve, reject) => {
		fetch(url, { ...data, headers }, (request) => {
			const { status, responseText, responseURL } = request;
			const { url } = Location.fromUrl(responseURL || requestURL);

			if (status === 500) {
				this.hooks.trigger('serverError', { url, status, request });
				reject(requestURL);
				return;
			}

			if (!responseText) {
				reject(requestURL);
				return;
			}

			const html = responseText;
			const page: PageData = { url, html };

			// Only save cache entry for non-redirects
			if (requestURL === url) {
				this.cache.cacheUrl(page);
			}

			this.hooks.trigger('pageLoaded', { page });
			resolve(page);
		});
	});

	return page;
}
