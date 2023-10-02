import type Swup from '../Swup.js';
import { nextTick } from '../utils.js';

/**
 * Perform the in/enter animation of the next page.
 * @returns Promise<void>
 */
export const animatePageIn = async function (this: Swup) {
	const animation = this.hooks.call('animation:in:await', { skip: false }, (visit, { skip }) => {
		if (skip) return;
		return this.awaitAnimations({ selector: visit.animation.selector });
	});

	await nextTick();

	await this.hooks.call('animation:in:start', undefined, () => {
		this.classes.remove('is-animating');
	});

	await animation;

	await this.hooks.call('animation:in:end', undefined);
};
