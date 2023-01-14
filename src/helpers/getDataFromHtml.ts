import { query, queryAll } from '../utils.js';

export type PageHtmlData = {
	title: string;
	originalContent: string;
	blocks: string[];
	pageClass?: string;
};

export const getDataFromHtml = (html: string, containers: string[]): PageHtmlData => {
	let fakeDom = document.createElement('html');
	fakeDom.innerHTML = html;
	let blocks: string[] = [];

	containers.forEach((selector) => {
		if (query(selector, fakeDom) == null) {
			console.warn(`[swup] Container ${selector} not found on page.`);
			return null;
		} else {
			if (queryAll(selector).length !== queryAll(selector, fakeDom).length) {
				console.warn(`[swup] Mismatched number of containers found on new page.`);
			}
			queryAll(selector).forEach((item, index) => {
				queryAll(selector, fakeDom)[index].setAttribute('data-swup', String(blocks.length));
				blocks.push(queryAll(selector, fakeDom)[index].outerHTML);
			});
		}
	});

	const title = query('title', fakeDom)?.innerText || '';
	const pageClass = query('body', fakeDom)?.className;

	// to prevent memory leaks
	fakeDom.innerHTML = '';
	// @ts-ignore don't want to type it as possible null, since it's created at the top of the function always
	fakeDom = null;

	return { title, pageClass, blocks, originalContent: html };
};
