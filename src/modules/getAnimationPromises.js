import { queryAll } from '../utils';
import { transitionEnd, transitionProperty } from '../helpers';

const getAnimationPromises = function() {
	const selector = this.options.animationSelector;
	const durationProperty = `${transitionProperty()}Duration`;
	const animatedElements = queryAll(selector, document.body);

	if (!animatedElements.length) {
		console.warn(`[swup] No animated elements found by selector ${selector}`);
		return [Promise.resolve()];
	}

	const promises = animatedElements.map((element) => {
		const transitionDuration = window.getComputedStyle(element)[durationProperty];
		// Resolve immediately if no transition defined
		if (!transitionDuration || transitionDuration == '0s') {
			console.warn(
				`[swup] No CSS transition duration defined for element of selector ${selector}`
			);
			return Promise.resolve();
		}
		return new Promise((resolve) => {
			element.addEventListener(transitionEnd(), (event) => {
				if (element == event.target) {
					resolve();
				}
			});
			setTimeout(() => resolve(), transitionDuration + 1);
		});
	});

	return promises;
};

export default getAnimationPromises;
