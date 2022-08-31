const enterPage = function({ popstate = false, skipTransition = false } = {}) {
	if (skipTransition) {
		this.triggerEvent('transitionEnd', popstate);
		this.cleanupAnimationClasses();
		return [Promise.resolve()];
	}

	setTimeout(() => {
		this.triggerEvent('animationInStart');
		document.documentElement.classList.remove('is-animating');
	}, 10);

	const animationPromises = this.getAnimationPromises('in');
	Promise.all(animationPromises).then(() => {
		this.triggerEvent('animationInDone');
		this.triggerEvent('transitionEnd', popstate);
		this.cleanupAnimationClasses();
	});
	return animationPromises;
};

export default enterPage;
