import Swup from '../Swup.js';

export const enterPage = async function (this: Swup) {
	if (this.context.animate) {
		const animation = this.hooks.trigger(
			'awaitAnimation',
			{ selector: this.options.animationSelector },
			async (_, { selector }) => {
				await Promise.all(this.getAnimationPromises({ selector, direction: 'in' }));
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
