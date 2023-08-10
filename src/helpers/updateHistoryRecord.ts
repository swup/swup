import { getCurrentUrl } from './getCurrentUrl.js';

/** Update the current history record with a custom swup identifier. */
export const updateHistoryRecord = (
	url: string | null = null,
	customData: Record<string, unknown> = {}
): void => {
	url = url || getCurrentUrl({ hash: true });
	const data: Record<string, unknown> = {
		...(history.state as Record<string, unknown> || {}),
		url,
		random: Math.random(),
		source: 'swup',
		...customData
	};
	history.replaceState(data, '', url);
};
