// Fill versions to exactly 3 decimals
const normalizeVersion = (version) => {
	return String(version)
		.split('.')
		.concat([0, 0])
		.slice(0, 3)
		.join('.');
};

// Numerically compare version strings after normalizing them
const compareVersion = (a, b) => {
	a = normalizeVersion(a);
	b = normalizeVersion(b);
	return a.localeCompare(b, undefined, { numeric: true });
};

// Apply a comparator (equals, greater-than, etc) by its symbol to a sort comparison
const applyComparator = (comparisonResult, comparator) => {
	const comparators = {
		'': (r) => r === 0,
		'>': (r) => r > 0,
		'>=': (r) => r >= 0,
		'<': (r) => r < 0,
		'<=': (r) => r <= 0
	};
	const comparatorFn = comparators[comparator] || comparators[''];
	return comparatorFn(comparisonResult);
};

/**
 * Check if a version satisfies all given version requirements
 *
 * versionSatisfies('2.1.0', ['>=2', '<4']) // true
 * versionSatisfies('2.1.0', ['5']) // false
 *
 * @param {string} installed Installed version
 * @param {Array.<string>} requirements Array of requirements that must be satisfied
 * @returns boolean
 */
export const versionSatisfies = (installed, requirements) => {
	return requirements.every((required) => {
		const [, comparator, version] = required.match(/^([\D]+)?(.*)$/) || [];
		const comparisonResult = compareVersion(installed, version);
		return applyComparator(comparisonResult, comparator || '>=');
	});
};

export default versionSatisfies;
