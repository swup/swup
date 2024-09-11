import { match } from 'path-to-regexp';

import type { Path, ParamData } from 'path-to-regexp';

export { type Path };

/** Create a match function from a path pattern that checks if a URLs matches it. */
export const matchPath = <P extends ParamData>(
	...args: Parameters<typeof match>
): ReturnType<typeof match> => {
	try {
		return match<P>(...args);
	} catch (error) {
		throw new Error(`[swup] Error parsing path "${String(args[0])}":\n${String(error)}`);
	}
};
