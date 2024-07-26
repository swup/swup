import type Swup from '../Swup.js';
import {
	updateHistoryRecord,
	type HistoryScrollRestorations,
	type HistoryState
} from '../helpers/history.js';
import type { Visit } from './Visit.js';

/**
 * Update the scroll position after page render.
 */
export function scrollToContent(this: Swup, visit: Visit): boolean {
	const options: ScrollIntoViewOptions = { behavior: 'auto' };
	const hash = visit.scroll.target ?? visit.to.hash;

	let scrolled = false;

	if (visit.history.popstate) {
		this.restoreScrollPosition(visit);
		scrolled = true;
	}

	if (hash && !scrolled) {
		// prettier-ignore
		scrolled = this.hooks.callSync('scroll:anchor', visit, { hash, options }, (visit, { hash, options }) =>
			scrollToElement(this.getAnchorElement(hash), options)
		);
	}

	if (visit.scroll.reset && !scrolled) {
		scrolled = this.hooks.callSync('scroll:top', visit, { options }, (visit, { options }) =>
			scrollToPosition(window, 0, 0, options)
		);
	}

	return scrolled;
}

export function storeScrollPosition(this: Swup) {
	// Create temporary visit to avoid re-using the previous one
	const visit = this.createVisit({ to: '' });
	const scroll = { window: { x: window.scrollX, y: window.scrollY } };

	this.hooks.callSync('scroll:store', visit, { scroll }, (visit, { scroll }) => {
		console.log('scroll:store', scroll);
		updateHistoryRecord(null, { scroll });
	});
}

export function restoreScrollPosition(this: Swup, visit: Visit) {
	const options: ScrollIntoViewOptions = { behavior: 'instant' };

	const state = visit.history.state ?? (window.history.state as HistoryState);
	const position = state?.scroll?.window ?? { x: 0, y: 0 };
	const restore: HistoryScrollRestorations = { window: { ...position, el: window } };

	this.hooks.callSync(
		'scroll:restore',
		visit,
		{ restore, options },
		(visit, { restore, options }) => {
			for (const [key, { el, y, x }] of Object.entries(restore)) {
				console.log(key, y, x, options);
				scrollToPosition(el, y, x, options);
			}
		}
	);
}

export function scrollToElement(el: Element | null, options?: ScrollIntoViewOptions): boolean {
	if (el) {
		el.scrollIntoView(options);
		return true;
	}
	return false;
}

export function scrollToPosition(
	el: Window | Element,
	top: number,
	left: number,
	options?: ScrollIntoViewOptions
): boolean {
	el.scrollTo({ top, left, ...options });
	return true;
}
