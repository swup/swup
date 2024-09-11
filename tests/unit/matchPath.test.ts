import { describe, expect, it } from 'vitest';
import { matchPath } from '../../src/index.js';

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

	it('should throw with malformed paths', () => {
		// prettier-ignore
		expect(() => matchPath('/\?user=:user')).toThrowError('[swup] Error parsing path');
	});
});
