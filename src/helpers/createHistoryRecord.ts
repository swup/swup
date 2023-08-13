import { getCurrentUrl } from './getCurrentUrl.js';

export interface HistoryState {
	url: string;
	source: 'swup';
	random: number;
	index?: number;
	[key: string]: unknown;
}

/** Create a new history record with a custom swup identifier. */
export const createHistoryRecord = (
	url: string,
	customData: Record<string, unknown> = {}
): void => {
	url = url || getCurrentUrl({ hash: true });
	const data: HistoryState = {
		url,
		random: Math.random(),
		source: 'swup',
		...customData
	};
	history.pushState(data, '', url);
};
