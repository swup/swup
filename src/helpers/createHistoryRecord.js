const createHistoryRecord = (url, customData = {}) => {
	url = url || location.href;
	const data = {
		url,
		random: Math.random(),
		source: 'swup',
		...customData
	};
	history.pushState(data, '', url);
};

export default createHistoryRecord;
