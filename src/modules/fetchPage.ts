import Swup from '../Swup.js';
import { fetch } from '../helpers.js';
import { TransitionOptions } from './loadPage.js';

export type PageData = {
	url: string;
	html: string;
};

export async function fetchPage(this: Swup, data: TransitionOptions): Promise<PageData> {
	const headers = this.options.requestHeaders;
	const { url } = data;

	const cachedPage = this.cache.getPage(url);
	if (cachedPage) {
		await this.events.trigger('pageRetrievedFromCache');
		return Promise.resolve(cachedPage);
	}

	const page = await new Promise<PageData>((resolve, reject) => {
		fetch({ ...data, headers }, (response) => {
			const {
				status,
				responseText: html,
				responseURL: url = window.location.href
			} = response;
			if (status === 500) {
				this.events.trigger('serverError');
				reject(url);
				return;
			}
			if (!html) {
				reject(url);
				return;
			}
			const page = { url, html };
			this.cache.cacheUrl(page);
			this.events.trigger('pageLoaded');
			resolve(page);
		});
	});

	return page;
}
