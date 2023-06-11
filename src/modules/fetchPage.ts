import Swup from '../Swup.js';
import { Location, fetch } from '../helpers.js';
import { TransitionOptions } from './loadPage.js';

export type PageData = {
	url: string;
	html: string;
};

export async function fetchPage(this: Swup, data: TransitionOptions): Promise<PageData> {
	const headers = this.options.requestHeaders;
	const { url: requestURL } = Location.fromUrl(data.url);

	const cachedPage = this.cache.getPage(requestURL);
	if (cachedPage) {
		await this.hooks.trigger('pageRetrievedFromCache');
		return Promise.resolve(cachedPage);
	}

	const page = await new Promise<PageData>((resolve, reject) => {
		fetch({ ...data, headers }, (response) => {
			const { status, responseText, responseURL } = response;

			if (status === 500) {
				this.hooks.trigger('serverError');
				reject(requestURL);
				return;
			}

			if (!responseText) {
				reject(requestURL);
				return;
			}

			const html = responseText;
			const { url } = Location.fromUrl(responseURL || requestURL);
			const page: PageData = { url, html };

			// Only save cache entry for non-redirects
			if (requestURL === url) {
				this.cache.cacheUrl(page);
			}

			this.hooks.trigger('pageLoaded');
			resolve(page);
		});
	});

	return page;
}
