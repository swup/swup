import Swup from '../Swup.js';
import { classify } from '../helpers.js';

/**
 * Perform the out/leave animation of the current page.
 * @returns Promise<void>
 */
export const animatePageOut = async function (this: Swup) {
	if (!this.context.animation.animate) {
		await this.hooks.trigger('animation:skip');
		return;
	}

	await this.hooks.trigger('animation:out:start', undefined, () => {
		this.classes.add('is-changing', 'is-leaving', 'is-animating');
		if (this.context.history.popstate) {
			this.classes.add('is-popstate');
		}
		if (this.context.animation.name) {
			this.classes.add(`to-${classify(this.context.animation.name)}`);
		}
	});

	await this.hooks.trigger(
		'animation:await',
		{ direction: 'out' },
		async (context, { direction }) => {
			await this.awaitAnimations({ selector: context.animation.selector, direction });
		}
	);

	await this.hooks.trigger('animation:out:end');
};
