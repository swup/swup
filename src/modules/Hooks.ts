import { DelegateEvent } from 'delegate-it';

import Swup, { Options } from '../Swup.js';
import { isPromise, runAsPromise } from '../utils.js';
import { Context } from './Context.js';
import { PageData } from './fetchPage.js';
import { FetchOptions } from '../helpers/fetch.js';

export interface HookDefinitions {
	animationInDone: undefined;
	animationInStart: undefined;
	animationOutDone: undefined;
	animationOutStart: undefined;
	animationSkipped: undefined;
	awaitAnimation: { selector: Options['animationSelector'] };
	cacheCleared: undefined;
	clickLink: { event: DelegateEvent<MouseEvent> };
	disabled: undefined;
	enabled: undefined;
	fetchPage: { url: string; options: FetchOptions; page?: PageData | null };
	openPageInNewTab: { href: string };
	pageCached: { page: PageData };
	pageLoaded: { page: PageData };
	pageLoadedFromCache: { page: PageData };
	pageView: { url: string; title: string };
	popState: { event: PopStateEvent };
	replaceContent: { page: PageData; containers: Options['containers'] };
	samePage: undefined;
	samePageWithHash: { hash: string; options: ScrollIntoViewOptions };
	scrollToContent: { options: ScrollIntoViewOptions };
	serverError: { url: string; status: number; request: XMLHttpRequest };
	transitionStart: undefined;
	transitionEnd: undefined;
	urlUpdated: { url: string };
}

export type HookData<T extends HookName> = HookDefinitions[T];

export type HookName = keyof HookDefinitions;

export type Handler<T extends HookName> = (
	context: Context,
	data: HookData<T>
) => Promise<void> | void;

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
		'awaitAnimation',
		'cacheCleared',
		'clickLink',
		'disabled',
		'enabled',
		'fetchPage',
		'openPageInNewTab',
		'pageCached',
		'pageLoaded',
		'pageLoadedFromCache',
		'pageView',
		'popState',
		'replaceContent',
		'samePage',
		'samePageWithHash',
		'scrollToContent',
		'serverError',
		'transitionStart',
		'transitionEnd',
		'urlUpdated'
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
	 * Remove all handlers of all hooks.
	 */
	clear() {
		this.registry.forEach((ledger) => ledger.clear());
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
	 * @returns The handler function
	 */
	on<T extends HookName>(hook: T, handler: Handler<T>): Handler<T>;
	on<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions): Handler<T>;
	on<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions = {}): Handler<T> {
		const ledger = this.get(hook);
		if (!ledger) {
			console.warn(`Hook '${hook}' not found.`);
			return handler;
		}

		const id = ledger.size + 1;
		const registration: HookRegistration<T> = { ...options, id, hook, handler };
		ledger.set(handler, registration);
		return handler;
	}

	/**
	 * Register a new hook handler to run before the default handler.
	 * Shortcut for `hooks.on(hook, handler, { before: true })`.
	 * @param hook Name of the hook to listen for
	 * @param handler The handler function to execute
	 * @param options Any other event options (see `hooks.on()` for details)
	 * @returns The handler function
	 * @see on
	 */
	before<T extends HookName>(hook: T, handler: Handler<T>): Handler<T>;
	before<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions): Handler<T>;
	before<T extends HookName>(
		hook: T,
		handler: Handler<T>,
		options: HookOptions = {}
	): Handler<T> {
		return this.on(hook, handler, { ...options, before: true });
	}

	/**
	 * Register a new hook handler to replace the default handler.
	 * Shortcut for `hooks.on(hook, handler, { replace: true })`.
	 * @param hook Name of the hook to listen for
	 * @param handler The handler function to execute instead of the default handler
	 * @param options Any other event options (see `hooks.on()` for details)
	 * @returns The handler function
	 * @see on
	 */
	replace<T extends HookName>(hook: T, handler: Handler<T>): Handler<T>;
	replace<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions): Handler<T>;
	replace<T extends HookName>(
		hook: T,
		handler: Handler<T>,
		options: HookOptions = {}
	): Handler<T> {
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
	once<T extends HookName>(hook: T, handler: Handler<T>): Handler<T>;
	once<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions): Handler<T>;
	once<T extends HookName>(hook: T, handler: Handler<T>, options: HookOptions = {}): Handler<T> {
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
	 * @param defaultHandler A default implementation of this hook to execute
	 * @returns The resolved return value of the executed default handler
	 */
	async trigger<T extends HookName>(
		hook: T,
		data?: HookData<T>,
		defaultHandler?: Handler<T>
	): Promise<any> {
		const { before, handler, after } = this.getHandlers(hook, defaultHandler);
		await this.execute(before, data);
		const [result] = await this.execute(handler, data);
		await this.execute(after, data);
		this.dispatchDomEvent(hook);
		return result;
	}

	/**
	 * Trigger a hook synchronously, executing its default handler and all registered handlers.
	 * Will execute all handlers in order, but will **not** `await` any `Promise`s they return.
	 * @param hook Name of the hook to trigger
	 * @param data Data to pass to the handler
	 * @param defaultHandler A default implementation of this hook to execute
	 * @returns The (possibly unresolved) return value of the executed default handler
	 */
	triggerSync<T extends HookName>(hook: T, data?: HookData<T>, defaultHandler?: Handler<T>): any {
		const { before, after, handler } = this.getHandlers(hook, defaultHandler);
		this.executeSync(before, data);
		const [result] = this.executeSync(handler, data);
		this.executeSync(after, data);
		this.dispatchDomEvent(hook);
		return result;
	}

	/**
	 * Execute the handlers for a hook, in order, as `Promise`s that will be `await`ed.
	 * @param registrations The registrations (handler + options) to execute
	 * @param data Data to pass to the handlers
	 */
	async execute<T extends HookName>(
		registrations: HookRegistration<T>[],
		data?: HookData<T>
	): Promise<any> {
		const results = [];
		for (const { hook, handler, once } of registrations) {
			try {
				results.push(await runAsPromise(handler, [this.swup.context, data]));
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
		data?: HookData<T>
	): any[] {
		const results = [];
		for (const { hook, handler, once } of registrations) {
			try {
				const result = handler(this.swup.context, data as HookData<T>);
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
	 * @param defaultHandler The optional default handler of this hook
	 * @returns An object with the handlers sorted into `before` and `after` arrays,
	 *          as well as a flag indicating if the original handler was replaced
	 */
	getHandlers<T extends HookName>(hook: T, defaultHandler?: Handler<T>) {
		const ledger = this.get(hook);
		if (!ledger) {
			return { found: false, before: [], handler: [], after: [], replaced: false };
		}

		const sort = this.sortRegistrations;
		const registrations = Array.from(ledger.values());

		const before = registrations.filter(({ before, replace }) => before && !replace).sort(sort);
		const replace = registrations.filter(({ replace }) => replace).sort(sort);
		const after = registrations.filter(({ before, replace }) => !before && !replace).sort(sort);
		const replaced = replace.length > 0;

		let handler: HookRegistration<T>[] = [];
		if (replaced) {
			handler = [{ id: 0, hook, handler: replace[0].handler }];
		} else if (defaultHandler) {
			handler = [{ id: 0, hook, handler: defaultHandler }];
		}

		return { found: true, before, handler, after, replaced };
	}

	/**
	 * Sort two hook registrations by priority and registration order.
	 * @param a The registration object to compare
	 * @param b The other registration object to compare with
	 * @returns The sort direction
	 */
	sortRegistrations<T extends HookName>(a: HookRegistration<T>, b: HookRegistration<T>): number {
		const priority = (b.priority ?? 0) - (a.priority ?? 0);
		const id = a.id - b.id;
		return priority || id || 0;
	}

	/**
	 * Trigger a custom event on the `document`. Prefixed with `swup:`
	 * @param hook Name of the hook to trigger.
	 */
	dispatchDomEvent<T extends HookName>(hook: T): void {
		document.dispatchEvent(new CustomEvent(`swup:${hook}`, { detail: hook }));
	}
}
