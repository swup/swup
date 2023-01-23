import Swup from '../Swup';
import { fetch } from '../helpers';
import { TransitionOptions } from './loadPage';
import { PageRecord } from './Cache';

export function fetchPage(this: Swup, data: TransitionOptions): Promise<PageRecord> {
	const headers = this.options.requestHeaders;
	const { url } = data;

	const cachedPage = this.cache.getPage(url);

	if (cachedPage !== null) {
		this.triggerEvent('pageRetrievedFromCache');
		return Promise.resolve(cachedPage);
	}

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
