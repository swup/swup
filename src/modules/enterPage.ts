import { nextTick } from '../utils';
import Swup from '../Swup';

export const enterPage = function (
	this: Swup,
	{ popstate, skipTransition }: { popstate?: PopStateEvent; skipTransition?: boolean }
) {
	if (skipTransition) {
		this.triggerEvent('transitionEnd', popstate);
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
		this.triggerEvent('transitionEnd', popstate);
		this.cleanupAnimationClasses();
	});
	return animationPromises;
};
