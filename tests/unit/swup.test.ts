import { describe, expect, it } from 'vitest';

import pckg from '../../package.json';
import Swup, { Location } from '../../src/index.js';
import { Cache } from '../../src/modules/Cache.js';
import { Hooks } from '../../src/modules/Hooks.js';

describe('Swup', () => {
	it('should have a version', () => {
		const swup = new Swup();
		expect(swup.version).not.toBeUndefined();
		expect(swup.version).toEqual(pckg.version);
	});

	it('should have a cache instance', () => {
		const swup = new Swup();
		expect(swup.cache).toBeInstanceOf(Cache);
	});

	it('should have a hooks instance', () => {
		const swup = new Swup();
		expect(swup.hooks).toBeInstanceOf(Hooks);
	});

	it('should have a location', () => {
		const swup = new Swup();
		expect(swup.location).toBeInstanceOf(Location);
	});
});
