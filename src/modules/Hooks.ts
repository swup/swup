import { DelegateEvent } from 'delegate-it';

import Swup from '../Swup.js';
import { isPromise, runAsPromise } from '../utils.js';

export type HookDefinitions = {
	animationInDone: undefined;
	animationInStart: undefined;
	animationOutDone: undefined;
	animationOutStart: undefined;
	animationSkipped: undefined;
	clickLink: DelegateEvent<MouseEvent>;
	contentReplaced: PopStateEvent | undefined;
	disabled: undefined;
	enabled: undefined;
	openPageInNewTab: DelegateEvent<MouseEvent>;
	pageLoaded: undefined;
	pageRetrievedFromCache: undefined;
	pageView: PopStateEvent | undefined;
	popState: PopStateEvent;
	samePage: DelegateEvent<MouseEvent>;
	samePageWithHash: DelegateEvent<MouseEvent>;
	serverError: undefined;
	transitionStart: PopStateEvent | undefined;
	transitionEnd: PopStateEvent | undefined;
	willReplaceContent: PopStateEvent | undefined;
};

export type HookArgument<T extends HookName> = HookDefinitions[T];

export type HookName = keyof HookDefinitions;

export type Handler<T extends HookName> = (data: HookArgument<T>) => Promise<void> | void;

export type Handlers = {
	[K in HookName]: Handler<K>[];
};

export type HookOptions = {
	once?: boolean;
	before?: boolean;
	priority?: number;
	replace?: boolean;
};

export type HookRegistration<T extends HookName> = {
	id: number;
	hook: T;
	handler: Handler<T>;
} & HookOptions;

type HookLedger<T extends HookName> = Map<Handler<T>, HookRegistration<T>>;

// type HookRegistry = Map<HookName, HookLedger<HookName>>;

interface HookRegistry extends Map<HookName, HookLedger<HookName>> {
	get<K extends HookName>(key: K): HookLedger<K> | undefined;
	set<K extends HookName>(key: K, value: HookLedger<K>): this;
}

export class Hooks {
	swup: Swup;
	registry: HookRegistry = new Map();

	// Can we deduplicate this somehow? Or make it error when not in sync with HookDefinitions?
	// https://stackoverflow.com/questions/53387838/how-to-ensure-an-arrays-values-the-keys-of-a-typescript-interface/53395649
	defaultHooks: HookName[] = [
		'animationInDone',
		'animationInStart',
		'animationOutDone',
		'animationOutStart',
		'animationSkipped',
		'clickLink',
		'contentReplaced',
		'disabled',
		'enabled',
		'openPageInNewTab',
		'pageLoaded',
		'pageRetrievedFromCache',
		'pageView',
		'popState',
		'samePage',
		'samePageWithHash',
		'serverError',
		'transitionStart',
		'transitionEnd',
		'willReplaceContent'
	];

	constructor(swup: Swup) {
		this.swup = swup;
		this.init();
	}

	init() {
		this.defaultHooks.forEach((hook) => this.create(hook));
	}

	create(hook: HookName) {
		if (!this.registry.has(hook)) {
			this.registry.set(hook, new Map());
		}
	}

	has(hook: HookName): boolean {
		return this.registry.has(hook);
	}

	get<T extends HookName>(hook: T): HookLedger<T> | undefined {
		const ledger = this.registry.get(hook);
		if (ledger) {
			return ledger;
		} else {
			console.error(`Unknown hook '${hook}'`);
		}
	}

	on<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions = {}) {
		const ledger = this.get(hook);
		if (!ledger) {
			console.warn(`Hook '${hook}' not found.`);
			return;
		}

		const id = ledger.size + 1;
		const registration: HookRegistration<T> = { ...options, id, hook, handler };
		ledger.set(handler, registration);
	}

	before<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions = {}) {
		return this.on(hook, handler, { ...options, before: true });
	}

	replace<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions = {}) {
		return this.on(hook, handler, { ...options, replace: true });
	}

	once<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions = {}) {
		return this.on(hook, handler, { ...options, once: true });
	}

	off<T extends HookName>(hook: T, handler?: Handler<T>) {
		const ledger = this.get(hook);

		if (ledger && handler) {
			const deleted = ledger.delete(handler);
			if (!deleted) {
				console.warn(`Handler for hook '${hook}' not found.`);
			}
		} else if (ledger) {
			ledger.clear();
		}
	}

	clear() {
		this.registry.forEach((ledger) => ledger.clear());
	}

	async trigger<T extends HookName>(hook: T, data?: HookArgument<T>, handler?: Function) {
		const { before, after, replace } = this.getHandlers(hook);
		const results = [
			...(await this.execute(before, data)),
			...(handler && !replace ? [await runAsPromise(handler, [data], this.swup)] : []),
			...(await this.execute(after, data))
		];
		this.dispatchDomEvent(hook);
		return results;
	}

	triggerSync<T extends HookName>(hook: T, data?: HookArgument<T>, handler?: Function) {
		const { before, after, replace } = this.getHandlers(hook);
		const results = [
			...this.executeSync(before, data),
			...(handler && !replace ? [handler(data)] : []),
			...this.executeSync(after, data)
		];
		this.dispatchDomEvent(hook);
		return results;
	}

	async execute<T extends HookName>(
		registrations: HookRegistration<T>[],
		data: HookArgument<T>
	): Promise<any> {
		const results = [];
		for (const { hook, handler, once } of registrations) {
			try {
				results.push(await runAsPromise(handler, [data], this.swup));
			} catch (error) {
				console.error(error);
			}
			if (once) {
				this.off(hook, handler);
			}
		}
		return results;
	}

	executeSync<T extends HookName>(
		registrations: HookRegistration<T>[],
		data: HookArgument<T>
	): any[] {
		const results = [];
		for (const { hook, handler, once } of registrations) {
			try {
				const result = handler(data);
				if (isPromise(result)) {
					console.warn(
						`Promise returned from handler for synchronous hook '${hook}'.` +
							`Swup will not wait for it to resolve.`
					);
				}
				results.push(result);
			} catch (error) {
				console.error(error);
			}
			if (once) {
				this.off(hook, handler);
			}
		}
		return results;
	}

	getHandlers(hook: HookName) {
		const ledger = this.get(hook);
		if (!ledger) {
			return { found: false, before: [], after: [] };
		}

		const registrations = Array.from(ledger.values());
		const before = this.sortHandlers(
			registrations.filter(({ before, replace }) => before || replace)
		);
		const after = this.sortHandlers(
			registrations.filter(({ before, replace }) => !before && !replace)
		);
		const replace = registrations.some(({ replace }) => replace);

		return { found: true, before, after, replace };
	}

	sortHandlers<T extends HookName>(registrations: HookRegistration<T>[]) {
		// sort by priority first, by id second
		return registrations.sort((a, b) => {
			const priority = (b.priority ?? 0) - (a.priority ?? 0);
			const id = a.id - b.id;
			return priority || id || 0;
		});
	}

	// Trigger event on document with prefix `swup:`
	dispatchDomEvent<T extends HookName>(hook: T) {
		document.dispatchEvent(new CustomEvent(`swup:${hook}`, { detail: hook }));
	}
}
