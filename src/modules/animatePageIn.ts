import Swup from '../Swup.js';
import { forceReflow } from '../utils.js';

/**
 * Perform the in/enter animation of the next page.
 * @returns Promise<void>
 */
export const animatePageIn = async function (this: Swup) {
	if (!this.context.animation.animate) {
		return;
	}

	await this.hooks.trigger('animation:in:start', undefined, () => {
		this.classes.remove('is-animating');
	});

	forceReflow();

	await this.hooks.trigger(
		'animation:await',
		{ direction: 'in' },
		async (context, { direction }) => {
			await this.awaitAnimations({ selector: context.animation.selector, direction });
		}
	);

	await this.hooks.trigger('animation:in:end');
};
