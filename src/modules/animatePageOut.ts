import type Swup from '../Swup.js';
import { classify } from '../helpers.js';
import type { Visit } from './Visit.js';

/**
 * Perform the out/leave animation of the current page.
 * @returns Promise<void>
 */
export const animatePageOut = async function (this: Swup, visit: Visit) {
	if (!visit.animation.animate) {
		await this.hooks.call('animation:skip', visit, undefined);
		return;
	}

	if (visit.aborted) return;

	await this.hooks.call('animation:out:start', visit, undefined, (visit) => {
		this.classes.add('is-changing', 'is-leaving', 'is-animating');
		if (visit.history.popstate) {
			this.classes.add('is-popstate');
		}
		if (visit.animation.name) {
			this.classes.add(`to-${classify(visit.animation.name)}`);
		}
	});

	await this.hooks.call(
		'animation:out:await',
		visit,
		{ skip: false },
		async (visit, { skip }) => {
			if (skip) return;
			await this.awaitAnimations({ selector: visit.animation.selector });
		}
	);

	await this.hooks.call('animation:out:end', visit, undefined);
};
