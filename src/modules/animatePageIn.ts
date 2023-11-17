import type Swup from '../Swup.js';
import { nextTick } from '../utils.js';

/**
 * Perform the in/enter animation of the next page.
 * @returns Promise<void>
 */
export const animatePageIn = async function (this: Swup) {
	const visit = this.visit;
	if (!this.visit.animation.animate) {
		return;
	}

	const animation = this.hooks.call(
		'animation:in:await',
		{ skip: false },
		async (visit, { skip }) => {
			if (skip) return;
			if (visit.expired) return;
			await this.awaitAnimations({ selector: visit.animation.selector });
		}
	);

	if (visit.expired) return;
	await nextTick();

	await this.hooks.call('animation:in:start', undefined, () => {
		if (visit.expired) return;
		this.classes.remove('is-animating');
	});

	if (visit.expired) return;
	await animation;

	if (visit.expired) return;
	await this.hooks.call('animation:in:end', undefined);
};
