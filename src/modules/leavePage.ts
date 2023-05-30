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

	console.log('Before animationOutStart');
	await this.hooks.call('animationOutStart', event, () => {
		console.log('Inside animationOutStart');
		console.log(document.documentElement.className);

		// handle classes
		document.documentElement.classList.add('is-changing', 'is-leaving', 'is-animating');
		if (isHistoryVisit) {
			document.documentElement.classList.add('is-popstate');
		}
		console.log(document.documentElement.className);
	});
	console.log('After animationOutStart');

	// animation promise stuff
	const animationPromises = this.getAnimationPromises('out');
	await Promise.all(animationPromises);

	console.log('Before animationOutDone');
	await this.hooks.call('animationOutDone');
	console.log('After animationOutDone');
};
