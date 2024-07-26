import { getCurrentUrl } from './getCurrentUrl.js';

export interface HistoryScrollPosition {
	x: number;
	y: number;
}

export interface HistoryScrollPositions {
	[key: string]: HistoryScrollPosition;
}

export interface HistoryScrollRestoration {
	el: Window | Element;
	x: number;
	y: number;
}

export interface HistoryScrollRestorations {
	[key: string]: HistoryScrollRestoration;
}

export interface HistoryState {
	url: string;
	source: 'swup';
	random: number;
	index?: number;
	scroll?: HistoryScrollPositions;
	[key: string]: unknown;
}

type HistoryData = Record<string, unknown>;

/** Create a new history record with a custom swup identifier. */
export const createHistoryRecord = (url: string, data: HistoryData = {}): void => {
	url = url || getCurrentUrl({ hash: true });
	const state: HistoryState = {
		url,
		random: Math.random(),
		source: 'swup',
		...data
	};
	window.history.pushState(state, '', url);
};

/** Update the current history record with a custom swup identifier. */
export const updateHistoryRecord = (url: string | null = null, data: HistoryData = {}): void => {
	url = url || getCurrentUrl({ hash: true });
	const currentState = (window.history.state as HistoryState) || {};
	const state: HistoryState = {
		...currentState,
		url,
		random: Math.random(),
		source: 'swup',
		...data
	};
	window.history.replaceState(state, '', url);
};
