import { query, queryAll } from '../utils';

const getDataFromHtml = (html, containers) => {
	let fakeDom = document.createElement('html');
	fakeDom.innerHTML = html;
	let blocks = [];

	containers.forEach((selector) => {
		if (query(selector, fakeDom) == null) {
			console.error(`Container ${selector} not found on page.`);
			return null;
		} else {
			queryAll(selector).forEach((item, index) => {
				queryAll(selector, fakeDom)[index].setAttribute('data-swup', blocks.length);
				blocks.push(queryAll(selector, fakeDom)[index].outerHTML);
			});
		}
	});

	const json = {
		title: fakeDom.querySelector('title').innerText,
		pageClass: fakeDom.querySelector('body').className,
		originalContent: html,
		blocks: blocks
	};

	// to prevent memory leaks
	fakeDom.innerHTML = '';
	fakeDom = null;

	return json;
};

export default getDataFromHtml;
