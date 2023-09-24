import type Swup from '../Swup.js';

/**
 * Update the scroll position after page render.
 * @returns Promise<boolean>
 */
export const scrollToContent = function (this: Swup): boolean {
	const options: ScrollIntoViewOptions = { behavior: 'auto' };
	const { target, reset } = this.visit.scroll;
	const scrollTarget = target ?? this.visit.to.hash;

	let scrolled = false;

	if (scrollTarget) {
		scrolled = this.hooks.callSync(
			'scroll:anchor',
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
		scrolled = this.hooks.callSync('scroll:top', { options }, (visit, { options }) => {
			window.scrollTo({ top: 0, left: 0, ...options });
			return true;
		});
	}

	return scrolled;
};
