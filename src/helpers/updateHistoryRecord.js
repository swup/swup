const updateHistoryRecord = (url = null, customData = {}) => {
	url = url || location.href;
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
