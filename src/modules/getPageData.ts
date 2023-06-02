import Swup from '../Swup.js';

export type PageData = {
	url: string;
	html: string;
};

/**
 * Parse the ajax request and extract full html
 */
export const getPageData = function (this: Swup, request: XMLHttpRequest): PageData | null {
	const html = request.responseText;
	const url = request.responseURL || window.location.href;

	return { url, html };
};
