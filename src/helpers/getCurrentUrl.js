const getCurrentUrl = ({ hash = false } = {}) => {
	return location.pathname + location.search + (hash ? location.hash : '');
};

export default getCurrentUrl;
