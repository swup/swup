const cleanupAnimationClasses = () => {
	document.documentElement.className.split(' ').forEach((classItem) => {
		if (
			// remove "to-{page}" classes
			new RegExp('^to-').test(classItem) ||
			// remove all other classes
			classItem === 'is-changing' ||
			classItem === 'is-rendering' ||
			classItem === 'is-popstate'
		) {
			document.documentElement.classList.remove(classItem);
		}
	});
};

export default cleanupAnimationClasses;
