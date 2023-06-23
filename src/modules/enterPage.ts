import Swup from '../Swup.js';

export const enterPage = async function (this: Swup) {
	if (this.context.animate) {
		const animationPromises = this.getAnimationPromises({ selector: this.options.animationSelector, direction: 'in' });
		await this.hooks.trigger('animationInStart', undefined, () => {
			document.documentElement.classList.remove('is-animating');
		});
		await Promise.all(animationPromises);
		await this.hooks.trigger('animationInDone');
	}

	await this.hooks.trigger('transitionEnd');
	this.cleanupAnimationClasses();
	this.context = this.createContext({ to: undefined });
};
