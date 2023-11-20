import type Swup from '../Swup.js';
import type { Visit } from './Visit.js';

/**
 * Update the scroll position after page render.
 * @returns Promise<boolean>
 */
export const scrollToContent = function (this: Swup, visit: Visit): boolean {
	const options: ScrollIntoViewOptions = { behavior: 'auto' };
	const { target, reset } = visit.scroll;
	const scrollTarget = target ?? visit.to.hash;

	let scrolled = false;

	if (scrollTarget) {
		scrolled = this.hooks.callSync(
			'scroll:anchor',
			visit,
			{ hash: scrollTarget, options },
			(visit, { hash, options }) => {
				const anchor = this.getAnchorElement(hash);
				if (anchor) {
					anchor.scrollIntoView(options);
				}
				return !!anchor;
			}
		);
	}

	if (reset && !scrolled) {
		scrolled = this.hooks.callSync('scroll:top', visit, { options }, (visit, { options }) => {
			window.scrollTo({ top: 0, left: 0, ...options });
			return true;
		});
	}

	return scrolled;
};
