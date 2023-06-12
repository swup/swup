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

/**
 * Hook registry.
 *
 * Create, trigger and handle hooks.
 *
 */
export class Hooks {
	protected swup: Swup;
	protected registry: HookRegistry = new Map();

	// Can we deduplicate this somehow? Or make it error when not in sync with HookDefinitions?
	// https://stackoverflow.com/questions/53387838/how-to-ensure-an-arrays-values-the-keys-of-a-typescript-interface/53395649
	readonly hooks: HookName[] = [
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

	/**
	 * Create ledgers for all core hooks.
	 */
	protected init() {
		this.hooks.forEach((hook) => this.create(hook));
	}

	/**
	 * Register a new hook.
	 */
	create(hook: HookName) {
		if (!this.registry.has(hook)) {
			this.registry.set(hook, new Map());
		}
	}

	/**
	 * Check if a hook is registered.
	 */
	has(hook: HookName): boolean {
		return this.registry.has(hook);
	}

	/**
	 * Remove all handlers of all hooks.
	 */
	clear() {
		this.registry.forEach((ledger) => ledger.clear());
	}

	/**
	 * Get the ledger with all registrations for a hook.
	 */
	protected get<T extends HookName>(hook: T): HookLedger<T> | undefined {
		const ledger = this.registry.get(hook);
		if (ledger) {
			return ledger;
		} else {
			console.error(`Unknown hook '${hook}'`);
		}
	}

	/**
	 * Register a new hook handler.
	 * @param hook Name of the hook to listen for
	 * @param handler The handler function to execute
	 * @param options Object to specify how and when the handler is executed
	 *                Available options:
	 *                - `once`: Only execute the handler once
	 *                - `before`: Execute the handler before the default handler
	 *                - `priority`: Specify the order in which the handlers are executed
	 *                - `replace`: Replace the default handler with this handler
	 */
	on<T extends HookName>(hook: T, handler: Handler<T>): void;
	on<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions): void;
	on<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions = {}): void {
		const ledger = this.get(hook);
		if (!ledger) {
			console.warn(`Hook '${hook}' not found.`);
			return;
		}

		const id = ledger.size + 1;
		const registration: HookRegistration<T> = { ...options, id, hook, handler };
		ledger.set(handler, registration);
	}

	/**
	 * Register a new hook handler to run before the default handler.
	 * Shortcut for `hooks.on(hook, handler, { before: true })`.
	 * @param hook Name of the hook to listen for
	 * @param handler The handler function to execute
	 * @param options Any other event options (see `hooks.on()` for details)
	 * @see on
	 */
	before<T extends HookName>(hook: T, handler: Handler<T>): void;
	before<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions): void;
	before<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions = {}): void {
		return this.on(hook, handler, { ...options, before: true });
	}

	/**
	 * Register a new hook handler to replace the default handler.
	 * Shortcut for `hooks.on(hook, handler, { replace: true })`.
	 * @param hook Name of the hook to listen for
	 * @param handler The handler function to execute instead of the default handler
	 * @param options Any other event options (see `hooks.on()` for details)
	 * @see on
	 */
	replace<T extends HookName>(hook: T, handler: Handler<T>): void;
	replace<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions): void;
	replace<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions = {}): void {
		return this.on(hook, handler, { ...options, replace: true });
	}

	/**
	 * Register a new hook handler to run once.
	 * Shortcut for `hooks.on(hook, handler, { once: true })`.
	 * @param hook Name of the hook to listen for
	 * @param handler The handler function to execute
	 * @param options Any other event options (see `hooks.on()` for details)
	 * @see on
	 */
	once<T extends HookName>(hook: T, handler: Handler<T>): void;
	once<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions): void;
	once<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions = {}): void {
		return this.on(hook, handler, { ...options, once: true });
	}

	/**
	 * Unregister a hook handler.
	 * @param hook Name of the hook the handler is registered for
	 * @param handler The handler function that was registered.
	 *                If omitted, all handlers for the hook will be removed.
	 */
	off<T extends HookName>(hook: T): void;
	off<T extends HookName>(hook: T, handler: Handler<T>): void;
	off<T extends HookName>(hook: T, handler?: Handler<T>): void {
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

	/**
	 * Trigger a hook asynchronously, executing its default handler and all registered handlers.
	 * Will execute all handlers in order and `await` any `Promise`s they return.
	 * @param hook Name of the hook to trigger
	 * @param data Data to pass to the handler
	 * @param handler A default implementation of this hook to execute
	 * @returns An array of all resolved return values of the executed handlers
	 */
	async trigger<T extends HookName>(
		hook: T,
		data?: HookArgument<T>,
		handler?: Function
	): Promise<any[]> {
		const { before, after, replace } = this.getHandlers(hook);
		const results = [
			...(await this.execute(before, data)),
			...(handler && !replace ? [await runAsPromise(handler, [data], this.swup)] : []),
			...(await this.execute(after, data))
		];
		this.dispatchDomEvent(hook);
		return results;
	}

	/**
	 * Trigger a hook synchronously, executing its default handler and all registered handlers.
	 * Will execute all handlers in order, but will **not** `await` any `Promise`s they return.
	 * @param hook Name of the hook to trigger
	 * @param data Data to pass to the handler
	 * @param handler A default implementation of this hook to execute
	 * @returns An array of all (possibly unresolved) return values of the executed handlers
	 */
	triggerSync<T extends HookName>(hook: T, data?: HookArgument<T>, handler?: Function): any[] {
		const { before, after, replace } = this.getHandlers(hook);
		const results = [
			...this.executeSync(before, data),
			...(handler && !replace ? [handler(data)] : []),
			...this.executeSync(after, data)
		];
		this.dispatchDomEvent(hook);
		return results;
	}

	/**
	 * Execute the handlers for a hook, in order, as `Promise`s that will be `await`ed.
	 * @param registrations The registrations (handler + options) to execute
	 * @param data Data to pass to the handlers
	 */
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

	/**
	 * Execute the handlers for a hook, in order, without `await`ing any returned `Promise`s.
	 * @param registrations The registrations (handler + options) to execute
	 * @param data Data to pass to the handlers
	 */
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

	/**
	 * Get all registered handlers for a hook, sorted by priority and registration order.
	 * @param hook Name of the hook
	 * @returns An object with the handlers sorted into `before` and `after` arrays,
	 *          as well as a flag indicating if the original handler should be replaced
	 */
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

	/**
	 * Sort hook registrations by priority and registration order.
	 * @param registrations The registrations to sort
	 * @returns The sorted list
	 */
	sortHandlers<T extends HookName>(registrations: HookRegistration<T>[]): HookRegistration<T>[] {
		// sort by priority first, by id second
		return registrations.sort((a, b) => {
			const priority = (b.priority ?? 0) - (a.priority ?? 0);
			const id = a.id - b.id;
			return priority || id || 0;
		});
	}

	/**
	 * Trigger a custom event on the `document`. Prefixed with `swup:`
	 * @param hook Name of the hook to trigger.
	 */
	dispatchDomEvent<T extends HookName>(hook: T): void {
		document.dispatchEvent(new CustomEvent(`swup:${hook}`, { detail: hook }));
	}
}
