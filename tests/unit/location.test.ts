import { describe, expect, it } from 'vitest';
import { Location } from '../../src/helpers/Location.js';

describe('Location', () => {
	it('has an href', () => {
		const location = new Location('/path?query#anchor');
		expect(location.href).to.eq('http://localhost:3000/path?query#anchor');
	});
	it('has a url', () => {
		const location = new Location('/path?query#anchor');
		expect(location.url).to.eq('/path?query');
	});
	it('accepts a base', () => {
		const location = new Location('/path?query#anchor', 'http://base.net');
		expect(location.href).to.eq('http://base.net/path?query#anchor');
	});
	it('accepts absolute URLs', () => {
		const location = new Location('http://example.net/path?query#anchor', 'http://base.net');
		expect(location.href).to.eq('http://example.net/path?query#anchor');
	});
	it('allows static creation', () => {
		const location = Location.fromUrl('http://example.net/path?query#anchor');
		expect(location.href).to.eq('http://example.net/path?query#anchor');
		expect(location.url).to.eq('/path?query');
	});
});
