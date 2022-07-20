import { queryAll } from '../utils';

const markSwupElements = (element, containers) => {
	let blocks = 0;

	for (let i = 0; i < containers.length; i++) {
		if (element.querySelector(containers[i]) == null) {
			console.error(`Container ${containers[i]} not found on page.`);
		} else {
			queryAll(containers[i]).forEach((item, index) => {
				queryAll(containers[i], element)[index].setAttribute('data-swup', blocks);
				blocks++;
			});
		}
	}
};

export default markSwupElements;
