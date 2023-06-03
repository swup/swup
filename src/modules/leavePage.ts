import Swup from '../Swup.js';
import { PageRenderOptions } from './renderPage.js';

export const leavePage = async function (
	this: Swup,
	{ event, skipTransition }: PageRenderOptions = {}
) {
	const isHistoryVisit = event instanceof PopStateEvent;

	if (skipTransition) {
		await this.events.trigger('animationSkipped');
		return;
	}

	await this.events.trigger('animationOutStart', undefined, () => {
		document.documentElement.classList.add('is-changing', 'is-leaving', 'is-animating');
		if (isHistoryVisit) {
			document.documentElement.classList.add('is-popstate');
		}
	});

	const animationPromises = this.getAnimationPromises('out');
	await Promise.all(animationPromises);
	await this.events.trigger('animationOutDone');
};
