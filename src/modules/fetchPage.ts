import Swup from '../Swup';
import { fetch } from '../helpers';
import { TransitionOptions } from './loadPage';
import { PageRecord } from './Cache';

export function fetchPage(this: Swup, data: TransitionOptions): Promise<PageRecord> {
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
