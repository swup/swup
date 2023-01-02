const leavePage = function(data, { popstate = false, skipTransition = false } = {}) {
	if (skipTransition) {
		this.triggerEvent('animationSkipped');
		return [Promise.resolve()];
	}

	this.triggerEvent('animationOutStart');

	// handle classes
	document.documentElement.classList.add('is-changing', 'is-leaving', 'is-animating');
	if (popstate) {
		document.documentElement.classList.add('is-popstate');
	}

	// animation promise stuff
	const animationPromises = this.getAnimationPromises('out');
	Promise.all(animationPromises).then(() => {
		this.triggerEvent('animationOutDone');
	});

	return animationPromises;
};

export default leavePage;
