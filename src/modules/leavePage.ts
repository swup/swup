import Swup from '../Swup';
import { TransitionOptions } from './loadPage';

export const leavePage = function (
	this: Swup,
	data: TransitionOptions,
	{ popstate, skipTransition }: { popstate: PopStateEvent | null; skipTransition?: boolean } = {
		popstate: null
	}
) {
	if (skipTransition) {
		this.triggerEvent('animationSkipped');
		return [Promise.resolve()];
	}

	this.triggerEvent('animationOutStart');

	// handle classes
	document.documentElement.classList.add('is-changing', 'is-leaving', 'is-animating');
	if (popstate) {
		document.documentElement.classList.add('is-popstate');
	}

	// animation promise stuff
	const animationPromises: Promise<void>[] = this.getAnimationPromises('out');
	Promise.all(animationPromises).then(() => {
		this.triggerEvent('animationOutDone');
	});

	return animationPromises;
};
