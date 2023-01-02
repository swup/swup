const swupClasses = [
	'is-changing',
	'is-rendering',
	'is-popstate',
	/^to-/,
];

const cleanupAnimationClasses = () => {
  const htmlClasses = [...document.documentElement.classList];
	const classesToRemove = htmlClasses.filter(
		(htmlClass) => swupClasses.some(
			(swupClass) => htmlClass.match(swupClass)
		)
	);
	document.documentElement.classList.remove(...classesToRemove);
};

export default cleanupAnimationClasses;
