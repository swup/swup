// Fill versions to exactly 3 decimals
const normalizeVersion = (version) => {
	return String(version).split('.').concat([0, 0]).slice(0, 3).join('.');
};

// Numerically compare version strings after normalizing them
const compareVersion = (a, b) => {
	a = normalizeVersion(a);
	b = normalizeVersion(b);
	return a.localeCompare(b, undefined, { numeric: true });
};

// Apply comparators (equals, greater-than, etc) by their symbol
const applyComparator = (comparisonResult, comparator) => {
	const comparators = {
		'': (r) => r === 0,
		'>': (r) => r > 0,
		'>=': (r) => r >= 0,
		'<': (r) => r < 0,
		'<=': (r) => r <= 0,
	};
	const comparatorFn = comparators[comparator] || comparators[''];
	return comparatorFn(comparisonResult);
}

// Check if the installed version satisfies a list of requirements
export const versionSatisfies = (installed, requirements) => {
	return requirements.every((required) => {
		const [, comparator, version] = String(required).match(/^([\D]+)?(.*)$/) || [];
		const comparisonResult = compareVersion(installed, version);
		return applyComparator(comparisonResult, comparator || '>=');
	});
};

export default versionSatisfies;
