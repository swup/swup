import { classify } from '../helpers.js';

const leavePage = function(data, { popstate = false, skipTransition = false } = {}) {
	if (skipTransition) {
		this.triggerEvent('animationSkipped');
		return [Promise.resolve()];
	}

	this.triggerEvent('animationOutStart');

	// handle classes
	document.documentElement.classList.add('is-changing');
	document.documentElement.classList.add('is-leaving');
	document.documentElement.classList.add('is-animating');
	if (popstate) {
		document.documentElement.classList.add('is-popstate');
	}
	document.documentElement.classList.add(`to-${classify(data.url)}`);

	// animation promise stuff
	const animationPromises = this.getAnimationPromises('out');
	Promise.all(animationPromises).then(() => {
		this.triggerEvent('animationOutDone');
	});
	return animationPromises;
};

export default leavePage;
