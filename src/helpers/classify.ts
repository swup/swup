export const classify = (text: string, fallback?: string): string => {
	const output = String(text)
		.toLowerCase()
		// .normalize('NFD') // split an accented letter in the base letter and the acent
		// .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
		.replace(/[\s/_.]+/g, '-') // replace spaces and _./ with '-'
		.replace(/[^\w-]+/g, '') // remove all non-word chars
		.replace(/--+/g, '-') // replace repeating '-' with single '-'
		.replace(/^-+|-+$/g, ''); // trim '-' from edges
	return output || fallback || '';
};
