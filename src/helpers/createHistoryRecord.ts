import { getCurrentUrl } from './getCurrentUrl.js';

/** Create a new history record with a custom swup identifier. */
export const createHistoryRecord = (
	url: string,
	customData: Record<string, unknown> = {}
): void => {
	url = url || getCurrentUrl({ hash: true });
	const data: Record<string, unknown> = {
		url,
		random: Math.random(),
		source: 'swup',
		...customData
	};
	history.pushState(data, '', url);
};
