import { queryAll } from '../utils';
import { transitionEnd, transitionProperty } from '../helpers.js';

const getAnimationPromises = function() {
	const selector = this.options.animationSelector;
	const durationProperty = `${transitionProperty()}Duration`;
	const promises = [];
	const animatedElements = queryAll(selector, document.body);

	if (!animatedElements.length) {
		console.warn(`[swup] No animated elements found by selector ${selector}`);
		return [Promise.resolve()];
	}

	animatedElements.forEach((element) => {
		const transitionDuration = window.getComputedStyle(element)[durationProperty];
		// Resolve immediately if no transition defined
		if (!transitionDuration || transitionDuration == '0s') {
			console.warn(
				`[swup] No CSS transition duration defined for element of selector ${selector}`
			);
			promises.push(Promise.resolve());
			return;
		}
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
