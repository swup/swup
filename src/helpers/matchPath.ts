import { match } from 'path-to-regexp';

import type { Path, MatchFunction } from 'path-to-regexp';

export { type Path };

type Params = Parameters<typeof match>;

/** Create a match function from a path pattern that checks if a URLs matches it. */
export const matchPath = <P extends object = object>(
	path: Params[0],
	options?: Params[1]
): MatchFunction<P> => {
	if (Array.isArray(path) && !path.length) {
		path = '';
	}

	try {
		return match<P>(path, options);
	} catch (error) {
		throw new Error(`[swup] Error parsing path "${String(path)}":\n${String(error)}`);
	}
};
