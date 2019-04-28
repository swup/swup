import { getDataFromHTML, fetch, getCurrentUrl, Link } from '../helpers';

module.exports = function(pathname) {
	let link = new Link(pathname);
	return new Promise((resolve, reject) => {
		if (link.getAddress() != getCurrentUrl() && !this.cache.exists(link.getAddress())) {
			fetch({ url: link.getAddress() }, (response, request) => {
				if (request.status === 500) {
					this.triggerEvent('serverError');
					reject();
				} else {
					// get json data
					let page = getDataFromHTML(response, request);
					if (page != null) {
						page.url = link.getAddress();
						this.cache.cacheUrl(page, this.options.debugMode);
						this.triggerEvent('pagePreloaded');
					}
					resolve(this.cache.getPage(link.getAddress()));
				}
			});
		} else {
			resolve(this.cache.getPage(link.getAddress()));
		}
	});
};
