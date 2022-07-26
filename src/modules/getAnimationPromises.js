import { queryAll } from '../utils';
import { transitionEnd } from '../helpers';

const getAnimationPromises = function() {
	const promises = [];
	const animatedElements = queryAll(this.options.animationSelector, document.body);
	animatedElements.forEach((element) => {
		const promise = new Promise((resolve) => {
			element.addEventListener(transitionEnd(), (event) => {
				if (element == event.target) {
					resolve();
				}
			});
		});
		promises.push(promise);
	});
	return promises;
};

export default getAnimationPromises;
