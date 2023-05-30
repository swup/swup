import Swup from '../Swup.js';
import { PageRenderOptions } from './renderPage.js';

export const leavePage = async function (
	this: Swup,
	{ event, skipTransition }: PageRenderOptions = {}
) {
	const isHistoryVisit = event instanceof PopStateEvent;

	if (skipTransition) {
		await this.hooks.call('animationSkipped');
		return;
	}

	await this.hooks.call('animationOutStart', event, () => {
		// handle classes
		document.documentElement.classList.add('is-changing', 'is-leaving', 'is-animating');
		if (isHistoryVisit) {
			document.documentElement.classList.add('is-popstate');
		}
	});

	// animation promise stuff
	const animationPromises = this.getAnimationPromises('out');
	await Promise.all(animationPromises);

	await this.hooks.call('animationOutDone');
};
