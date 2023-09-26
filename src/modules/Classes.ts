import type Swup from '../Swup.js';
import { queryAll } from '../utils.js';

export class Classes {
	protected _swup: Swup;
	protected _swupClasses = ['to-', 'is-changing', 'is-rendering', 'is-popstate', 'is-animating'];

	constructor(swup: Swup) {
		this._swup = swup;
	}

	protected get _selectors(): string[] {
		const { scope } = this._swup.visit.animation;
		if (scope === 'containers') return this._swup.visit.containers;
		if (scope === 'html') return ['html'];
		if (Array.isArray(scope)) return scope;
		return [];
	}

	protected get _selector(): string {
		return this._selectors.join(',');
	}

	protected get _targets(): HTMLElement[] {
		if (!this._selector.trim()) return [];
		return queryAll(this._selector);
	}

	add(...classes: string[]): void {
		this._targets.forEach((target) => target.classList.add(...classes));
	}

	remove(...classes: string[]): void {
		this._targets.forEach((target) => target.classList.remove(...classes));
	}

	clear(): void {
		this._targets.forEach((target) => {
			const remove = target.className.split(' ').filter((c) => this._isSwupClass(c));
			target.classList.remove(...remove);
		});
	}

	protected _isSwupClass(className: string): boolean {
		return this._swupClasses.some((c) => className.startsWith(c));
	}
}
