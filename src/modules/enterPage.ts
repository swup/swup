import Swup from '../Swup.js';
import { nextTick } from '../utils.js';

export const enterPage = async function (this: Swup) {
	if (this.context.animation.animate) {
		const animation = this.hooks.trigger(
			'awaitAnimation',
			{ direction: 'in' },
			async (context, { direction }) => {
				await Promise.all(
					this.getAnimationPromises({ selector: context.animation.selector, direction })
				);
			}
		);
		await nextTick();
		await this.hooks.trigger('animationInStart', undefined, () => {
			this.classes.remove('is-animating');
		});
		await animation;
		await this.hooks.trigger('animationInDone');
	}

	await this.hooks.trigger('transitionEnd', undefined, () => {
		this.classes.clear();
	});
};
