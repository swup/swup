import type Swup from '../Swup.js';
import { nextTick } from '../utils.js';

/**
 * Perform the in/enter animation of the next page.
 * @returns Promise<void>
 */
export const animatePageIn = async function (this: Swup) {
	const { id: visitId } = this.visit;
	if (!this.visit.animation.animate) {
		return;
	}

	const animation = this.hooks.call(
		'animation:in:await',
		{ skip: false },
		async (visit, { skip }) => {
			if (skip) return;
			if (visitId !== this.visit.id) return;
			await this.awaitAnimations({ selector: visit.animation.selector });
		}
	);

	if (visitId !== this.visit.id) return;
	await nextTick();

	await this.hooks.call('animation:in:start', undefined, () => {
		if (visitId !== this.visit.id) return;
		this.classes.remove('is-animating');
	});

	if (visitId !== this.visit.id) return;
	await animation;

	if (visitId !== this.visit.id) return;
	await this.hooks.call('animation:in:end', undefined);
};
