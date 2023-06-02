import Swup from '../Swup.js';
import { fetch } from '../helpers.js';
import { TransitionOptions } from './loadPage.js';
import { PageData } from './getPageData.js';

export function fetchPage(this: Swup, data: TransitionOptions): Promise<PageData> {
	const headers = this.options.requestHeaders;
	const { url } = data;

	if (this.cache.exists(url)) {
		this.triggerEvent('pageRetrievedFromCache');
		return Promise.resolve(this.cache.getPage(url));
	}

	return new Promise((resolve, reject) => {
		fetch({ ...data, headers }, (response) => {
			if (response.status === 500) {
				this.triggerEvent('serverError');
				reject(url);
				return;
			}
			const page = this.getPageData(response);
			if (!page) {
				reject(url);
				return;
			}
			this.cache.cacheUrl(page);
			this.triggerEvent('pageLoaded');
			resolve(page);
		});
	});
}
