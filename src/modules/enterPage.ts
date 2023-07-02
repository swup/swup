import Swup from '../Swup.js';

export const enterPage = async function (this: Swup) {
	if (this.context.transition.animate) {
		const animation = this.hooks.trigger(
			'awaitAnimation',
			{ selector: this.options.animationSelector, direction: 'in' },
			async (context, { selector, direction }) => {
				await Promise.all(this.getAnimationPromises({ selector, direction }));
			}
		);
		await this.hooks.trigger('animationInStart', undefined, () => {
			document.documentElement.classList.remove('is-animating');
		});
		await animation;
		await this.hooks.trigger('animationInDone');
	}

	await this.hooks.trigger('transitionEnd', undefined, () => {
		this.cleanupAnimationClasses();
	});

	this.context = this.createContext({ to: undefined });
};
