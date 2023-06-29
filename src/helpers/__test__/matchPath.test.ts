import { describe, expect, it } from 'vitest';
import { matchPath } from '../../index.js';
import { pathToRegexp } from 'path-to-regexp';

/**
 * Tests to ensure the match function keeps working as expected
 */
describe('matchPath', () => {
	it('should return false if not matching', () => {
		const urlMatch = matchPath('/users/:user');
		const match = urlMatch('/posts/');
		expect(match).toBe(false);
	});

	it('should return an object if matching', () => {
		const urlMatch = matchPath('/users/:user');
		const match = urlMatch('/users/bob');
		expect(match).toEqual({
			path: '/users/bob',
			index: 0,
			params: { user: 'bob' }
		});
	});

	it('should work with primitive strings', () => {
		const urlMatch = matchPath<{ user: string }>('/users/:user');
		const match = urlMatch('/users/bob');
		const params = !match ? false : match.params;
		expect(params).toEqual({ user: 'bob' });
	});

	it('should work with an array of paths', () => {
		const urlMatch = matchPath<{ user: string }>(['/users/', '/users/:user']);

		const { params: withParams } = urlMatch('/users/bob') || {};
		expect(withParams).toEqual({ user: 'bob' });

		const { params: withoutParams } = urlMatch('/users/') || {};
		expect(withoutParams).toEqual({});
	});

	/**
	 * When passing a regex to `match`, the params in the response are sorted by appearance.
	 * Only helpful for falsy/truthy detection
	 */
	it('should work with regex', () => {
		const re = pathToRegexp('/users/:user');
		const urlMatch = matchPath(re);
		const { params } = urlMatch('/users/bob') || {};
		expect(params).toEqual({ '0': 'bob' });
	});

	it('should throw with malformed paths', () => {
		// prettier-ignore
		expect(() => matchPath('/\?user=:user')).toThrowError('[swup] Error parsing path');
	});
});
