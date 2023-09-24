import { match } from 'path-to-regexp';

import type {
	Path,
	ParseOptions,
	TokensToRegexpOptions,
	RegexpToFunctionOptions,
	MatchFunction
} from 'path-to-regexp';

export { type Path };

/** Create a match function from a path pattern that checks if a URLs matches it. */
export const matchPath = <P extends object = object>(
	path: Path,
	options?: ParseOptions & TokensToRegexpOptions & RegexpToFunctionOptions
): MatchFunction<P> => {
	try {
		return match<P>(path, options);
	} catch (error) {
		throw new Error(`[swup] Error parsing path "${String(path)}":\n${String(error)}`);
	}
};
