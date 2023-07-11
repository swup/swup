import Swup from '../Swup.js';
import { nextTick } from '../utils.js';

export const enterPage = async function (this: Swup) {
	if (this.context.animation.animate) {
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
	}

	await this.hooks.trigger('visit:end', undefined, () => {
		this.classes.clear();
	});
};
