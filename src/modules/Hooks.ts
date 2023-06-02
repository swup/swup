import { DelegateEvent } from 'delegate-it';

import Swup from '../Swup.js';
import { isPromise, runAsPromise } from '../utils.js';

export type PageContext = {
	url: string;
	payload: string;
	title: string;
	blocks: HTMLElement[];
};

export type HookContext<TEvent = undefined> = {
	swup: Swup;
	hook: HookName;
	from?: PageContext;
	to?: PageContext;
	originalEvent?: TEvent;
	triggerElement?: Element;
};

export type HookDefinitions = {
	animationInDone: HookContext;
	animationInStart: HookContext;
	animationOutDone: HookContext;
	animationOutStart: HookContext;
	animationSkipped: HookContext;
	clickLink: HookContext<DelegateEvent<MouseEvent>>;
	contentReplaced: HookContext<PopStateEvent | undefined>;
	disabled: HookContext;
	enabled: HookContext;
	openPageInNewTab: HookContext<DelegateEvent<MouseEvent>>;
	pageLoaded: HookContext;
	pageRetrievedFromCache: HookContext;
	pageView: HookContext<PopStateEvent | undefined>;
	popState: HookContext<PopStateEvent>;
	samePage: DelegateEvent<MouseEvent>;
	samePageWithHash: DelegateEvent<MouseEvent>;
	serverError: HookContext;
	transitionStart: HookContext<PopStateEvent | undefined>;
	transitionEnd: HookContext<PopStateEvent | undefined>;
	willReplaceContent: HookContext<PopStateEvent | undefined>;
};

export type HookName = keyof HookDefinitions;

export type HookData<T extends HookName> = HookDefinitions[T] | Event | undefined;

export type Handler<T extends HookName> = (context: HookData<T>) => Promise<void> | void;

export type Handlers = {
	[Key in HookName]: Handler<Key>[];
};

export type HookOptions = {
	once?: boolean;
	before?: boolean;
	replace?: boolean;
	priority?: number;
	raw?: boolean;
};

export type HookRegistration<T extends HookName> = {
	id: number;
	hook: T;
	handler: Handler<T>;
} & HookOptions;

type HookLedger<T extends HookName> = Map<Handler<T>, HookRegistration<T>>;

type HookRegistry = Map<HookName, HookLedger<HookName>>;

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

	get<THook extends HookName>(hook: THook): HookLedger<THook> | undefined {
		const ledger = this.registry.get(hook) as HookLedger<THook> | undefined;
		if (ledger) {
			return ledger;
		} else {
			console.error(`Unknown hook ${hook}.`);
		}
	}

	add<THook extends HookName>(hook: THook, handler: Handler<THook>, options: HookOptions = {}) {
		const ledger = this.get(hook);
		if (!ledger) {
			return;
		}

		const id = ledger.size + 1;
		const registration: HookRegistration<THook> = { ...options, id, hook, handler };
		ledger.set(handler, registration);
	}

	before<THook extends HookName>(
		hook: THook,
		handler: Handler<THook>,
		options: HookOptions = {}
	) {
		return this.add(hook, handler, { ...options, before: true });
	}

	replace<THook extends HookName>(
		hook: THook,
		handler: Handler<THook>,
		options: HookOptions = {}
	) {
		return this.add(hook, handler, { ...options, replace: true });
	}

	once<THook extends HookName>(hook: THook, handler: Handler<THook>, options: HookOptions = {}) {
		return this.add(hook, handler, { ...options, once: true });
	}

	remove<THook extends HookName>(hook: THook, handler?: Handler<THook>) {
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

	async run<T extends HookName>(hook: T, data?: HookData<T>, handler?: Function) {
		const { before, after, replace } = this.getHandlers(hook);
		return [
			...(await this.execute(before, data)),
			handler && !replace ? await runAsPromise(handler, [data], this.swup) : undefined,
			...(await this.execute(after, data))
		];
	}

	runSync<T extends HookName>(hook: T, data?: HookData<T>, handler?: Function) {
		const { before, after, replace } = this.getHandlers(hook);
		return [
			...this.executeSync(before, data),
			handler && !replace ? handler(data) : undefined,
			...this.executeSync(after, data)
		];
	}

	async execute<T extends HookName>(
		registrations: HookRegistration<T>[],
		data: HookData<T>
	): Promise<any> {
		const results = [];
		for (const { hook, handler, once } of registrations) {
			try {
				results.push(await runAsPromise(handler, [data], this.swup));
			} catch (error) {
				console.error(error);
			}
			if (once) {
				this.remove(hook, handler);
			}
		}
		return results;
	}

	executeSync<T extends HookName>(
		registrations: HookRegistration<T>[],
		data: HookData<T>
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
				this.remove(hook, handler);
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
		const before = this.sort(registrations.filter(({ before, replace }) => before || replace));
		const after = this.sort(registrations.filter(({ before, replace }) => !before && !replace));
		const replace = registrations.some(({ replace }) => replace);

		return { found: true, before, after, replace };
	}

	sort<T extends HookName>(registrations: HookRegistration<T>[]) {
		// sort by priority first, by id second
		return registrations.sort((a, b) => {
			const priority = (b.priority ?? 0) - (a.priority ?? 0);
			const id = a.id - b.id;
			return priority || id || 0;
		});
	}
}
