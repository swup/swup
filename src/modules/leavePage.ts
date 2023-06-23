import Swup from '../Swup.js';
import { classify } from '../helpers.js';

export const leavePage = async function (this: Swup) {
	if (!this.context.animate) {
		await this.hooks.trigger('animationSkipped');
		return;
	}

	await this.hooks.trigger('animationOutStart', undefined, () => {
		document.documentElement.classList.add('is-changing', 'is-leaving', 'is-animating');
		if (this.context.history.popstate) {
			document.documentElement.classList.add('is-popstate');
		}
		if (this.context.transition) {
			document.documentElement.classList.add(`to-${classify(this.context.transition)}`);
		}
	});

	await this.hooks.trigger(
		'awaitAnimation',
		{ selector: this.options.animationSelector },
		async (_, { selector }) => {
			await Promise.all(this.getAnimationPromises({ selector, direction: 'out' }));
		}
	);

	await this.hooks.trigger('animationOutDone');
};
