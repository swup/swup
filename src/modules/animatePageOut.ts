import type Swup from '../Swup.js';
import { classify } from '../helpers.js';

/**
 * Perform the out/leave animation of the current page.
 * @returns Promise<void>
 */
export const animatePageOut = async function (this: Swup) {
	if (!this.visit.animation.animate) {
		await this.hooks.call('animation:skip', undefined);
		return;
	}

	await this.hooks.call('animation:out:start', undefined, (visit) => {
		this.classes.add('is-changing', 'is-leaving', 'is-animating');
		if (visit.history.popstate) {
			this.classes.add('is-popstate');
		}
		if (visit.animation.name) {
			this.classes.add(`to-${classify(visit.animation.name)}`);
		}
	});

	await this.hooks.call('animation:out:await', { skip: false }, async (visit, { skip }) => {
		if (skip) return;
		await this.awaitAnimations({ selector: visit.animation.selector });
	});

	await this.hooks.call('animation:out:end', undefined);
};
