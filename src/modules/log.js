const log = function(str) {
	if (this.options.debugMode) {
		console.log(str + '%c', 'color: #009ACD');
	}
};

export default log;
