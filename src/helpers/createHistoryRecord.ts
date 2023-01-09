import { default as getCurrentUrl } from './getCurrentUrl.js';

const createHistoryRecord = (url: string, customData: Record<string, unknown> = {}): void => {
	url = url || getCurrentUrl({ hash: true });
	const data = {
		url,
		random: Math.random(),
		source: 'swup',
		...customData
	};
	history.pushState(data, '', url);
};

export default createHistoryRecord;
