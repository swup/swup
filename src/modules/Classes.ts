import Swup from '../Swup.js';
import { query } from '../utils.js';

export class Classes {
	public swup: Swup;

	swupClasses = ['to-', 'is-changing', 'is-rendering', 'is-popstate', 'is-animating'];

	constructor(swup: Swup) {
		this.swup = swup;
	}

	get selectors(): string[] {
		const { scope } = this.swup.context.transition;
		return scope === 'containers' ? this.swup.context.containers : ['html'];
	}

	get targets(): HTMLElement[] {
		return this.selectors.map((s) => query(s)).filter(Boolean) as HTMLElement[];
	}

	public add(...classes: string[]): void {
		this.targets.forEach((target) => target.classList.add(...classes));
	}

	public remove(...classes: string[]): void {
		this.targets.forEach((target) => target.classList.remove(...classes));
	}

	public clear(): void {
		this.targets.forEach((target) => {
			const remove = target.className.split(' ').filter((c) => this.isSwupClass(c));
			target.classList.remove(...remove);
		});
	}

	private isSwupClass(className: string): boolean {
		return this.swupClasses.some((c) => className.startsWith(c));
	}
}
