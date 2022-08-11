const transitionProperty = () => {
	if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
		return 'WebkitTransition';
	} else {
		return 'transition';
	}
};

export default transitionProperty;
