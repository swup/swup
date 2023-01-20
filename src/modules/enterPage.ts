import { nextTick } from '../utils';
import Swup from '../Swup';
import { PageRenderOptions } from './renderPage';

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
