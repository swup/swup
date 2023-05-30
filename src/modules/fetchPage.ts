import Swup from '../Swup.js';
import { fetch } from '../helpers.js';
import { TransitionOptions } from './loadPage.js';
import { PageRecord } from './Cache.js';

export async function fetchPage(this: Swup, data: TransitionOptions): Promise<PageRecord> {
	const headers = this.options.requestHeaders;
	const { url } = data;

	if (this.cache.exists(url)) {
		await this.hooks.call('pageRetrievedFromCache');
		return this.cache.getPage(url);
	}

	return new Promise((resolve, reject) => {
		fetch({ ...data, headers }, (response) => {
			if (response.status === 500) {
				this.hooks.call('serverError');
				reject(url);
				return;
			}
			// get json data
			const page = this.getPageData(response);
			if (!page || !page.blocks.length) {
				reject(url);
				return;
			}
			// render page
			const cacheablePageData = { ...page, url };
			this.cache.cacheUrl(cacheablePageData);
			this.hooks.call('pageLoaded');
			resolve(cacheablePageData);
		});
	});
}
