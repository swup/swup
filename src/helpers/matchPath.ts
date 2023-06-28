import { match } from 'path-to-regexp';

import type {
	Path,
	ParseOptions,
	TokensToRegexpOptions,
	RegexpToFunctionOptions,
	MatchFunction
} from 'path-to-regexp';

export { Path };

export const matchPath = <P extends object = object>(
	path: Path,
	options?: ParseOptions & TokensToRegexpOptions & RegexpToFunctionOptions
): MatchFunction<P> => {
	try {
		return match<P>(path, options);
	} catch (error) {
		throw new Error(`[swup] Error parsing path "${path}":\n${error}`);
	}
};
