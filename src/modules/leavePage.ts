import Swup from '../Swup.js';
import { classify } from '../helpers.js';

export const leavePage = async function (this: Swup) {
	if (!this.context.transition.animate) {
		await this.hooks.trigger('animationSkipped');
		return;
	}

	await this.hooks.trigger('animationOutStart', undefined, () => {
		document.documentElement.classList.add('is-changing', 'is-leaving', 'is-animating');
		if (this.context.history.popstate) {
			document.documentElement.classList.add('is-popstate');
		}
		if (this.context.transition.name) {
			document.documentElement.classList.add(`to-${classify(this.context.transition.name)}`);
		}
	});

	await this.hooks.trigger(
		'awaitAnimation',
		{ selector: this.options.animationSelector, direction: 'out' },
		async (context, { selector, direction }) => {
			await Promise.all(this.getAnimationPromises({ selector, direction }));
		}
	);

	await this.hooks.trigger('animationOutDone');
};
