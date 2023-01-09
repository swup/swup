import { getDataFromHtml } from '../helpers.js';

const getPageData = function(request) {
	// this method can be replaced in case other content than html is expected to be received from server
	// this function should always return { title, pageClass, originalContent, blocks, responseURL }
	// in case page has invalid structure - return null
	const html = request.responseText;
	const pageObject = getDataFromHtml(html, this.options.containers);

	if (!pageObject) {
		console.warn('[swup] Received page is invalid.');
		return null;
	}

	pageObject.responseURL = request.responseURL || window.location.href;
	return pageObject;
};

export default getPageData;
