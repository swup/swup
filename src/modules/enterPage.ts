import Swup from '../Swup.js';
import { PageRenderOptions } from './renderPage.js';

export const enterPage = async function (
	this: Swup,
	{ event, skipTransition }: PageRenderOptions = {}
) {
	if (skipTransition) {
		await this.hooks.trigger('transitionEnd', event);
		this.cleanupAnimationClasses();
		return;
	}

	const animationPromises = this.getAnimationPromises('in');

	await this.hooks.trigger('animationInStart', undefined, () => {
		document.documentElement.classList.remove('is-animating');
	});

	await Promise.all(animationPromises);
	await this.hooks.trigger('animationInDone');

	await this.hooks.trigger('transitionEnd', event);
	this.cleanupAnimationClasses();
};
