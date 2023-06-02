import Swup from '../Swup.js';
import { fetch } from '../helpers.js';
import { TransitionOptions } from './loadPage.js';

export type PageData = {
	url: string;
	html: string;
};

export function fetchPage(this: Swup, data: TransitionOptions): Promise<PageData> {
	const headers = this.options.requestHeaders;
	const { url } = data;

	if (this.cache.exists(url)) {
		this.triggerEvent('pageRetrievedFromCache');
		return Promise.resolve(this.cache.getPage(url));
	}

	return new Promise((resolve, reject) => {
		fetch({ ...data, headers }, (response) => {
			const {
				status,
				responseText: html,
				responseURL: url = window.location.href
			} = response;
			if (status === 500) {
				this.triggerEvent('serverError');
				reject(url);
				return;
			}
			if (!html) {
				reject(url);
				return;
			}
			const page = { url, html };
			this.cache.cacheUrl(page);
			this.triggerEvent('pageLoaded');
			resolve(page);
		});
	});
}
