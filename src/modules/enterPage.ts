import Swup from '../Swup.js';
import { PageRenderOptions } from './renderPage.js';

export const enterPage = async function (
	this: Swup,
	{ event, skipTransition }: PageRenderOptions = {}
) {
	if (skipTransition) {
		await this.hooks.run('transitionEnd', event);
		this.cleanupAnimationClasses();
		return;
	}

	const animationPromises = this.getAnimationPromises('in');

	await this.hooks.run('animationInStart', undefined, () => {
		document.documentElement.classList.remove('is-animating');
	});

	await Promise.all(animationPromises);
	await this.hooks.run('animationInDone');

	await this.hooks.run('transitionEnd', event);
	this.cleanupAnimationClasses();
};
