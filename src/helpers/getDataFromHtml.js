import { query, queryAll } from '../utils.js';

const getDataFromHtml = (html, containers) => {
	let fakeDom = document.createElement('html');
	fakeDom.innerHTML = html;
	let blocks = [];

	containers.forEach((selector) => {
		if (query(selector, fakeDom) == null) {
			console.warn(`[swup] Container ${selector} not found on page.`);
			return null;
		} else {
			if (queryAll(selector).length !== queryAll(selector, fakeDom).length) {
				console.warn(`[swup] Mismatched number of containers found on new page.`);
			}
			queryAll(selector).forEach((item, index) => {
				queryAll(selector, fakeDom)[index].setAttribute('data-swup', blocks.length);
				blocks.push(queryAll(selector, fakeDom)[index].outerHTML);
			});
		}
	});

	const title = query('title', fakeDom)?.innerText;
	const pageClass = query('body', fakeDom)?.className;

	// to prevent memory leaks
	fakeDom.innerHTML = '';
	fakeDom = null;

	return { title, pageClass, blocks, originalContent: html };
};

export default getDataFromHtml;
