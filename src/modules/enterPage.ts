import { nextTick } from '../utils.js';
import Swup from '../Swup.js';
import { PageRenderOptions } from './renderPage.js';

export const enterPage = function (this: Swup, { event, skipTransition }: PageRenderOptions = {}) {
	if (skipTransition) {
		this.triggerEvent('transitionEnd', event);
		this.cleanupAnimationClasses();
		return [Promise.resolve()];
	}

	nextTick(() => {
		this.triggerEvent('animationInStart');
		document.documentElement.classList.remove('is-animating');
	});

	const animationPromises = this.getAnimationPromises('in');
	Promise.all(animationPromises).then(() => {
		this.triggerEvent('animationInDone');
		this.triggerEvent('transitionEnd', event);
		this.cleanupAnimationClasses();
	});
	return animationPromises;
};
