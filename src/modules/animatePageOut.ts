import type Swup from '../Swup.js';
import { classify } from '../helpers.js';

/**
 * Perform the out/leave animation of the current page.
 * @returns Promise<void>
 */
export const animatePageOut = async function (this: Swup) {
	const visit = this.visit;

	if (!this.visit.animation.animate) {
		await this.hooks.call('animation:skip', undefined);
		return;
	}

	if (visit.expired) return false;
	await this.hooks.call('animation:out:start', undefined, (visit) => {
		if (visit.expired) return false;

		this.classes.add('is-changing', 'is-leaving', 'is-animating');
		if (visit.history.popstate) {
			this.classes.add('is-popstate');
		}
		if (visit.animation.name) {
			this.classes.add(`to-${classify(visit.animation.name)}`);
		}
	});

	if (visit.expired) return false;

	await this.hooks.call('animation:out:await', { skip: false }, async (visit, { skip }) => {
		if (skip) return;
		if (visit.expired) return false;
		await this.awaitAnimations({ selector: visit.animation.selector });
	});

	if (visit.expired) return false;
	await this.hooks.call('animation:out:end', undefined);
};
