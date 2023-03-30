import { query, queryAll } from '../utils.js';

export const markSwupElements = (element: Element, containers: string[]): void => {
	let blocks = 0;

	containers.forEach((selector) => {
		if (query(selector, element) == null) {
			console.warn(`[swup] Container ${selector} not found on page.`);
		} else {
			queryAll(selector).forEach((item: Element, index: number) => {
				queryAll(selector, element)[index].setAttribute('data-swup', String(blocks));
				blocks++;
			});
		}
	});
};
