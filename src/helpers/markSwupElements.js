import { query, queryAll } from '../utils';

const markSwupElements = (element, containers) => {
	let blocks = 0;

	containers.forEach((selector) => {
		if (query(selector, element) == null) {
			console.warn(`[swup] Container ${selector} not found on page.`);
		} else {
			queryAll(selector).forEach((item, index) => {
				queryAll(selector, element)[index].setAttribute('data-swup', blocks);
				blocks++;
			});
		}
	});
};

export default markSwupElements;
