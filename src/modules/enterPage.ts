import { nextTick } from '../utils.js';
import Swup from '../Swup.js';
import { PageRenderOptions } from './renderPage.js';

export const enterPage = async function (
	this: Swup,
	{ event, skipTransition }: PageRenderOptions = {}
) {
	if (skipTransition) {
		await this.hooks.call('transitionEnd', event);
		this.cleanupAnimationClasses();
		return;
	}

	const tick: Promise<void> = new Promise((resolve) => nextTick(() => resolve()));
	await tick;
	await this.hooks.call('animationInStart', undefined, () => {
		document.documentElement.classList.remove('is-animating');
	});

	const animationPromises = this.getAnimationPromises('in');
	await Promise.all(animationPromises);
	await this.hooks.call('animationInDone');
	await this.hooks.call('transitionEnd', event);
	this.cleanupAnimationClasses();
};
