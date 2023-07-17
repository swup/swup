import Swup from '../Swup.js';
import { nextTick } from '../utils.js';

/**
 * Perform the in/enter animation of the next page.
 * @returns Promise<void>
 */
export const enterPage = async function (this: Swup) {
	if (!this.context.animation.animate) {
		return;
	}

	const animation = this.hooks.trigger(
		'animation:await',
		{ direction: 'in' },
		async (context, { direction }) => {
			await this.awaitAnimations({ selector: context.animation.selector, direction });
		}
	);

	await nextTick();

	await this.hooks.trigger('animation:in:start', undefined, () => {
		this.classes.remove('is-animating');
	});

	await animation;

	await this.hooks.trigger('animation:in:end');
};
