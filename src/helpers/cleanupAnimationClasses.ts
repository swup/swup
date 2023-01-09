const isSwupClass = (className: string): boolean =>
	/^to-/.test(className) || ['is-changing', 'is-rendering', 'is-popstate'].includes(className);

const cleanupAnimationClasses = (): void => {
	const htmlClasses = document.documentElement.className.split(' ');
	const removeClasses = htmlClasses.filter(isSwupClass);
	document.documentElement.classList.remove(...removeClasses);
};

export default cleanupAnimationClasses;
