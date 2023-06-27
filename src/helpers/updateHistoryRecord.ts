import { getCurrentUrl } from './getCurrentUrl.js';

export const updateHistoryRecord = (
	url: string | null = null,
	customData: Record<string, unknown> = {}
): void => {
	url = url || getCurrentUrl({ hash: true });
	const data = {
		...history.state,
		url,
		random: Math.random(),
		source: 'swup',
		...customData
	};
	history.replaceState(data, '', url);
};
