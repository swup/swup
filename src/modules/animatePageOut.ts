import type Swup from '../Swup.js';
import type { Visit } from './Visit.js';

/**
 * Perform the out/leave animation of the current page.
 * @returns Promise<void>
 */
export const animatePageOut = async function (this: Swup, visit: Visit) {
	await this.hooks.call('animation:out:start', visit, undefined, () => {
		this.classes.add('is-changing', 'is-animating', 'is-leaving');
	});

	await this.hooks.call('animation:out:await', visit, { skip: false }, (visit, { skip }) => {
		if (skip) return;
		return this.awaitAnimations({ selector: visit.animation.selector });
	});

	await this.hooks.call('animation:out:end', visit, undefined);
};
