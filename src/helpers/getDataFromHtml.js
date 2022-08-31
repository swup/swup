import { query, queryAll } from '../utils';

const getDataFromHtml = (html, options) => {
	let fakeDom = document.createElement('html');
	fakeDom.innerHTML = html;
	let blocks = [];
	let fragments = [];

	if (Array.isArray(options)) {
		// Support old container-only param
		options = { containers: options };
	}

	const { containers = [], fragmentContainerAttr } = options || {};

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

	queryAll(`[${fragmentContainerAttr}]`, fakeDom).forEach((container) => {
		fragments.push(container.outerHTML);
	});

	const title = (fakeDom.querySelector('title') || {}).innerText;
	const pageClass = fakeDom.querySelector('body').className;

	// Prevent memory leaks
	fakeDom.innerHTML = '';
	fakeDom = null;

	return { title, pageClass, blocks, fragments, originalContent: html };
};

export default getDataFromHtml;
