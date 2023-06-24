import Swup from '../Swup.js';
import { Location } from '../helpers.js';
import { PageData } from './fetchPage.js';

export interface CacheData extends PageData {}

export class Cache {
	private swup: Swup;
	private pages: Map<string, CacheData> = new Map();

	constructor(swup: Swup) {
		this.swup = swup;
	}

	get size() {
		return this.pages.size;
	}

	get all() {
		return this.pages;
	}

	public has(url: string): boolean {
		return this.pages.has(this.resolve(url));
	}

	public get(url: string): CacheData | undefined {
		return this.pages.get(this.resolve(url));
	}

	public set(url: string, page: CacheData) {
		url = this.resolve(url);
		page = { ...page, url };
		this.pages.set(url, page);
		this.swup.hooks.triggerSync('pageCached', { page });
	}

	public update(url: string, page: CacheData) {
		url = this.resolve(url);
		page = { ...this.get(url), ...page, url };
		this.pages.set(url, page);
	}

	public delete(url: string): void {
		this.pages.delete(this.resolve(url));
	}

	public clear(): void {
		this.pages.clear();
		this.swup.hooks.triggerSync('cacheCleared');
	}

	public prune(predicate: (url: string, page: CacheData) => boolean): void {
		this.pages.forEach((page, url) => {
			if (predicate(url, page)) {
				this.delete(url);
			}
		});
	}

	private resolve(urlToResolve: string): string {
		const { url } = Location.fromUrl(urlToResolve);
		return this.swup.resolveUrl(url);
	}
}
