const updateHistoryRecord = (url = null, customData = {}) => {
	url = url || window.location.href; // window.location.href.split(window.location.hostname)[1];
	const data = {
		...window.history.state,
		url,
		random: Math.random(),
		source: 'swup',
		...customData
	};
	window.history.replaceState(data, document.title, url);
};

export default updateHistoryRecord;
