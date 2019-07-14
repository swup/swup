import { queryAll } from '../utils';

const markSwupElements = (element, containers) => {
	let blocks = 0;

	for (let i = 0; i < containers.length; i++) {
		if (element.querySelector(containers[i]) == null) {
			console.warn(`Element ${containers[i]} is not in current page.`);
		} else {
			queryAll(containers[i]).forEach((item, index) => {
				queryAll(containers[i], element)[index].setAttribute('data-swup', blocks);
				blocks++;
			});
		}
	}
};

export default markSwupElements;
