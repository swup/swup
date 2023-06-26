import { beforeEach, describe, expect, it, vi } from 'vitest';
import Swup from '../../Swup.js';
import { Location } from '../Location.js';

const swup = new Swup();

describe('Location', () => {
	beforeEach(() => {});

	it('should return only the pathname and searchParams', () => {
		const { url } = Location.fromUrl('https://example.com/test-path?foo=bar');
		expect(url).toEqual('/test-path?foo=bar');
	});

	it('should remove the trailing slash from the pathname', () => {
		const { url } = Location.fromUrl('/test-path/');
		expect(url).toEqual('/test-path');
	});

	it('should sort searchParams', () => {
		const { url } = Location.fromUrl('/test-path?foo=bar&baz=bat');
		expect(url).toEqual('/test-path?baz=bat&foo=bar');
	});
});
