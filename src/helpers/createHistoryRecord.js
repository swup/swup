import { default as getCurrentUrl } from './getCurrentUrl.js';

const createHistoryRecord = (url, customData = {}) => {
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
