const classify = (text) => {
	const output = String(text)
		// .normalize('NFD')                   // split an accented letter in the base letter and the acent
		// .replace(/[\u0300-\u036f]/g, '')   // remove all previously split accents
		.toLowerCase()
		.replace(/[\s\/]/g, '-') // Replace spaces and slashes with -
		.replace(/[^\w-]+/g, '') // Remove all non-word chars
		.replace(/--+/g, '-') // Replace multiple - with single -
		.replace(/(^-+|-+$)/, ''); // Trim - from edges
	return output || 'homepage';
};

export default classify;
