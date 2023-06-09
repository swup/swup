import Swup from '../Swup.js';
import { Location, fetch } from '../helpers.js';
import { TransitionOptions } from './loadPage.js';

export type PageData = {
	url: string;
	html: string;
};

export function fetchPage(this: Swup, data: TransitionOptions): Promise<PageData> {
	const headers = this.options.requestHeaders;
	const { url: requestURL } = Location.fromUrl(data.url);

	const cachedPage = this.cache.get(requestURL);
	if (cachedPage) {
		this.triggerEvent('pageRetrievedFromCache');
		return Promise.resolve(cachedPage);
	}

	return new Promise((resolve, reject) => {
		fetch({ ...data, headers }, (response) => {
			const { status, responseText, responseURL } = response;
			const isError = [500].includes(status);
			const isRedirect = [301, 302, 303, 307, 308].includes(status);
			const isPermanentRedirect = [301, 308].includes(status);
			const isEmpty = !responseText;

			if (isError) {
				this.triggerEvent('serverError');
				reject(requestURL);
				return;
			}

			if (isEmpty && !isRedirect) {
				reject(requestURL);
				return;
			}

			const html = responseText;
			const { url } = Location.fromUrl(responseURL || requestURL);

			// Save cache entry for loaded page
			const page: PageData = { url, html };
			this.cache.save(url, page);

			// If there was a permanent redirect, save cache entry for that as well
			if (isPermanentRedirect && requestURL !== url) {
				this.cache.save(requestURL, page);
			}

			this.triggerEvent('pageLoaded');
			resolve(page);
		});
	});
}
