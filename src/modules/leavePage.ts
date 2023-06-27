import Swup from '../Swup.js';
import { PageRenderOptions } from './renderPage.js';

export const leavePage = function (this: Swup, { event, skipTransition }: PageRenderOptions = {}) {
	const isHistoryVisit = event instanceof PopStateEvent;

	if (skipTransition) {
		this.triggerEvent('animationSkipped');
		return [Promise.resolve()];
	}

	this.triggerEvent('animationOutStart');

	// handle classes
	document.documentElement.classList.add('is-changing', 'is-leaving', 'is-animating');
	if (isHistoryVisit) {
		document.documentElement.classList.add('is-popstate');
	}

	// animation promise stuff
	const animationPromises: Promise<void>[] = this.getAnimationPromises('out');
	Promise.all(animationPromises).then(() => {
		this.triggerEvent('animationOutDone');
	});

	return animationPromises;
};
