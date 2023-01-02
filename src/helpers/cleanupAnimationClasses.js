const swupClasses = [
	'is-changing',
	'is-rendering',
	'is-popstate',
	/^to-/,
];

const cleanupAnimationClasses = () => {
  const htmlClasses = document.documentElement.className.split(' ');
	htmlClasses.forEach((htmlClass) => {
		const isSwupClass = swupClasses.some((swupClass) => htmlClass.match(swupClass));
		if (isSwupClass) {
			document.documentElement.classList.remove(htmlClass);
		}
	});
};

export default cleanupAnimationClasses;
