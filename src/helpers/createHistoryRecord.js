const createHistoryRecord = (url, customData = {}) => {
	url = url || window.location.href.split(window.location.hostname)[1];
	const data = {
		url,
		random: Math.random(),
		source: 'swup',
		...customData
	};
	window.history.pushState(data, document.title, url);
};

export default createHistoryRecord;
