import { getCurrentUrl } from './getCurrentUrl.js';

export interface HistoryState {
	url: string;
	source: 'swup';
	random: number;
	index?: number;
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
