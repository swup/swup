import Swup from '../Swup.js';

export function updateTransition(this: Swup, from: string, to: string, custom?: string): void {
	this.transition = { from, to, custom };
}

export function shouldSkipTransition(this: Swup, { event }: { url?: string; event?: Event }) {
	const isHistoryVisit = event instanceof PopStateEvent;
	return !!(isHistoryVisit && !this.options.animateHistoryBrowsing);
}
