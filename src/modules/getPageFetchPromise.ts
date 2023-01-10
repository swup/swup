import Swup from '../index.js';
import { fetch } from '../helpers.js';
import { TransitionOptions } from '../modules/loadPage.js';
import { PageRecord } from './Cache.js';

export default function getPageFetchPromise(this: Swup, data: TransitionOptions): Promise<PageRecord> {
	const { url } = data;
	const headers = this.options.requestHeaders;

	return new Promise((resolve, reject) => {
		fetch({ ...data, headers }, (response) => {
			if (response.status === 500) {
				this.triggerEvent('serverError');
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
			this.triggerEvent('pageLoaded');
			resolve(cacheablePageData);
		});
	});
}
