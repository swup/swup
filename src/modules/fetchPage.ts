import Swup from '../Swup.js';
import { Location, fetch } from '../helpers.js';
import { TransitionOptions } from './loadPage.js';

export type PageData = {
	url: string;
	html: string;
};

export function fetchPage(this: Swup, data: TransitionOptions): Promise<PageData> {
	const headers = this.options.requestHeaders;
	const { url: requestURL } = data;

	const cachedPage = this.cache.get(requestURL);
	if (cachedPage) {
		this.triggerEvent('pageRetrievedFromCache');
		return Promise.resolve(cachedPage);
	}

	return new Promise((resolve, reject) => {
		fetch({ ...data, headers }, (response) => {
			const { status, responseText, responseURL } = response;

			if (status === 500) {
				this.triggerEvent('serverError');
				reject(requestURL);
				return;
			}

			if (!responseText) {
				reject(requestURL);
				return;
			}

			const html = responseText;
			const { url } = Location.fromUrl(responseURL || requestURL);

			// Save cache entry for loaded page
			const page: PageData = { url, html };
			this.cache.save(url, page);

			// If there was a redirect, save cache entry for that as well
			if (requestURL !== url && status === 301) {
				const page: PageData = { url, html };
				this.cache.save(requestURL, page);
			}

			this.triggerEvent('pageLoaded');
			resolve(page);
		});
	});
}
