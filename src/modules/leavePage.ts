import Swup from '../Swup.js';
import { classify } from '../helpers.js';

export const leavePage = async function (this: Swup) {
	if (!this.context.transition.animate) {
		await this.hooks.trigger('animation:skip');
		return;
	}

	await this.hooks.trigger('animation:out:start', undefined, () => {
		this.classes.add('is-changing', 'is-leaving', 'is-animating');
		if (this.context.history.popstate) {
			this.classes.add('is-popstate');
		}
		if (this.context.transition.name) {
			this.classes.add(`to-${classify(this.context.transition.name)}`);
		}
	});

	await this.hooks.trigger(
		'animation:await',
		{ selector: this.options.animationSelector, direction: 'out' },
		async (context, { selector, direction }) => {
			await Promise.all(this.getAnimationPromises({ selector, direction }));
		}
	);

	await this.hooks.trigger('animation:out:end');
};
