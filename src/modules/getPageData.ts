import { getDataFromHtml } from '../helpers.js';
import Swup from '../Swup.js';
import { PageHtmlData } from '../helpers/getDataFromHtml.js';

export type PageData = PageHtmlData & {
	responseURL: string;
};
export const getPageData = function (this: Swup, request: XMLHttpRequest): PageData | null {
	// this method can be replaced in case other content than html is expected to be received from server
	// this function should always return { title, pageClass, originalContent, blocks, responseURL }
	// in case page has invalid structure - return null
	const html = request.responseText;
	const pageHtmlData = getDataFromHtml(html, this.options.containers);

	if (!pageHtmlData) {
		console.warn('[swup] Received page is invalid.');
		return null;
	}

	return {
		...pageHtmlData,
		responseURL: request.responseURL || window.location.href
	};
};
