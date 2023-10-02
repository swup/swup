import type Swup from '../Swup.js';

/**
 * Perform the out/leave animation of the current page.
 * @returns Promise<void>
 */
export const animatePageOut = async function (this: Swup) {
	await this.hooks.call('animation:out:start', undefined, () => {
		this.classes.add('is-changing', 'is-leaving', 'is-animating');
	});

	await this.hooks.call('animation:out:await', { skip: false }, (visit, { skip }) => {
		if (skip) return;
		return this.awaitAnimations({ selector: visit.animation.selector });
	});

	await this.hooks.call('animation:out:end', undefined);
};
