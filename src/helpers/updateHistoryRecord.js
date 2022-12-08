import { getCurrentUrl } from '../helpers.js';

const updateHistoryRecord = (url = null, customData = {}) => {
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

export default updateHistoryRecord;
