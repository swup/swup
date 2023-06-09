import Swup from '../Swup.js';
import { Location, fetch } from '../helpers.js';
import { TransitionOptions } from './loadPage.js';

export type PageData = {
	url: string;
	redirect?: string | false;
	html: string;
};

export function fetchPage(this: Swup, data: TransitionOptions): Promise<PageData> {
	const headers = this.options.requestHeaders;
	const { url: requestURL } = data;

	const cachedPage = this.cache.getPage(requestURL);
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
			const redirect = requestURL !== url ? url : false;
			const page: PageData = { url, redirect, html };
			this.cache.cacheUrl(page);
			this.triggerEvent('pageLoaded');
			resolve(page);
		});
	});
}
