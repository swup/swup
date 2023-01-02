const isSwupClass = (className) =>
	/^to-/.test(className) || ['is-changing', 'is-rendering', 'is-popstate'].includes(className);

const cleanupAnimationClasses = () => {
	const htmlClasses = document.documentElement.className.split(' ');
	const removeClasses = htmlClasses.filter(isSwupClass);
	document.documentElement.classList.remove(...removeClasses);
};

export default cleanupAnimationClasses;
