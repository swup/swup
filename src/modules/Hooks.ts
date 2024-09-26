import type { DelegateEvent } from 'delegate-it';

import type Swup from '../Swup.js';
import { isPromise, runAsPromise } from '../utils.js';
import { Visit } from './Visit.js';
import type { FetchOptions, PageData } from './fetchPage.js';

export interface HookDefinitions {
	'animation:out:start': undefined;
	'animation:out:await': { skip: boolean };
	'animation:out:end': undefined;
	'animation:in:start': undefined;
	'animation:in:await': { skip: boolean };
	'animation:in:end': undefined;
	'animation:skip': undefined;
	'cache:clear': undefined;
	'cache:set': { page: PageData };
	'content:replace': { page: PageData };
	'content:scroll': undefined;
	'enable': undefined;
	'disable': undefined;
	'fetch:request': { url: string; options: FetchOptions };
	'fetch:error': { url: string; status: number; response: Response };
	'fetch:timeout': { url: string };
	'history:popstate': { event: PopStateEvent };
	'link:click': { el: HTMLAnchorElement; event: DelegateEvent<MouseEvent> };
	'link:self': undefined;
	'link:anchor': { hash: string };
	'link:newtab': { href: string };
	'page:load': { page?: PageData; cache?: boolean; options: FetchOptions };
	'page:view': { url: string; title: string };
	'scroll:top': { options: ScrollIntoViewOptions };
	'scroll:anchor': { hash: string; options: ScrollIntoViewOptions };
	'visit:start': undefined;
	'visit:transition': undefined;
	'visit:abort': undefined;
	'visit:end': undefined;
}

export interface HookReturnValues {
	'content:scroll': Promise<boolean> | boolean;
	'fetch:request': Promise<Response>;
	'page:load': Promise<PageData>;
	'scroll:top': boolean;
	'scroll:anchor': boolean;
}

export type HookArguments<T extends HookName> = HookDefinitions[T];

export type HookName = keyof HookDefinitions;

export type HookNameWithModifier = `${HookName}.${HookModifier}`;

type HookModifier = 'once' | 'before' | 'replace';

/** A generic hook handler. */
export type HookHandler<T extends HookName> = (
	/** Context about the current visit. */
	visit: Visit,
	/** Local arguments passed into the handler. */
	args: HookArguments<T>
) => Promise<unknown> | unknown;

/** A default hook handler with an expected return type. */
export type HookDefaultHandler<T extends HookName> = (
	/** Context about the current visit. */
	visit: Visit,
	/** Local arguments passed into the handler. */
	args: HookArguments<T>,
	/** Default handler to be executed. Available if replacing an internal hook handler. */
	defaultHandler?: HookDefaultHandler<T>
) => T extends keyof HookReturnValues ? HookReturnValues[T] : Promise<unknown> | unknown;

export type Handlers = {
	[K in HookName]: HookHandler<K>[];
};

export type HookInitOptions = {
	[K in HookName as K | `${K}.${HookModifier}`]: HookHandler<K>;
} & {
	[K in HookName as K | `${K}.${HookModifier}.${HookModifier}`]: HookHandler<K>;
};

/** Unregister a previously registered hook handler. */
export type HookUnregister = () => void;

/** Define when and how a hook handler is executed. */
export type HookOptions = {
	/** Execute the hook once, then remove the handler */
	once?: boolean;
	/** Execute the hook before the internal default handler */
	before?: boolean;
	/** Set a priority for when to execute this hook. Lower numbers execute first. Default: `0` */
	priority?: number;
	/** Replace the internal default handler with this hook handler */
	replace?: boolean;
};

export type HookRegistration<
	T extends HookName,
	H extends HookHandler<T> | HookDefaultHandler<T> = HookHandler<T>
> = {
	id: number;
	hook: T;
	handler: H;
	defaultHandler?: HookDefaultHandler<T>;
} & HookOptions;

type HookEventDetail = {
	hook: HookName;
	args: unknown;
	visit: Visit;
};

export type HookEvent = CustomEvent<HookEventDetail>;

type HookLedger<T extends HookName> = Map<HookHandler<T>, HookRegistration<T>>;

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
	/** Swup instance this registry belongs to */
	protected swup: Swup;

	/** Map of all registered hook handlers. */
	protected registry: HookRegistry = new Map();

	// Can we deduplicate this somehow? Or make it error when not in sync with HookDefinitions?
	// https://stackoverflow.com/questions/53387838/how-to-ensure-an-arrays-values-the-keys-of-a-typescript-interface/53395649
	protected readonly hooks: HookName[] = [
		'animation:out:start',
		'animation:out:await',
		'animation:out:end',
		'animation:in:start',
		'animation:in:await',
		'animation:in:end',
		'animation:skip',
		'cache:clear',
		'cache:set',
		'content:replace',
		'content:scroll',
		'enable',
		'disable',
		'fetch:request',
		'fetch:error',
		'fetch:timeout',
		'history:popstate',
		'link:click',
		'link:self',
		'link:anchor',
		'link:newtab',
		'page:load',
		'page:view',
		'scroll:top',
		'scroll:anchor',
		'visit:start',
		'visit:transition',
		'visit:abort',
		'visit:end'
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
	 * Create a new hook type.
	 */
	create(hook: string) {
		if (!this.registry.has(hook as HookName)) {
			this.registry.set(hook as HookName, new Map());
		}
	}

	/**
	 * Check if a hook type exists.
	 */
	exists(hook: HookName): boolean {
		return this.registry.has(hook);
	}

	/**
	 * Get the ledger with all registrations for a hook.
	 */
	protected get<T extends HookName>(hook: T): HookLedger<T> | undefined {
		const ledger = this.registry.get(hook);
		if (ledger) {
			return ledger;
		}
		console.error(`Unknown hook '${hook}'`);
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
	 * @returns A function to unregister the handler
	 */

	// Overload: replacing default handler
	on<T extends HookName, O extends HookOptions>(hook: T, handler: HookDefaultHandler<T>, options: O & { replace: true }): HookUnregister; // prettier-ignore
	// Overload: passed in handler options
	on<T extends HookName, O extends HookOptions>(hook: T, handler: HookHandler<T>, options: O): HookUnregister; // prettier-ignore
	// Overload: no handler options
	on<T extends HookName>(hook: T, handler: HookHandler<T>): HookUnregister; // prettier-ignore
	// Implementation
	on<T extends HookName, O extends HookOptions>(
		hook: T,
		handler: O['replace'] extends true ? HookDefaultHandler<T> : HookHandler<T>,
		options: Partial<O> = {}
	): HookUnregister {
		const ledger = this.get(hook);
		if (!ledger) {
			console.warn(`Hook '${hook}' not found.`);
			return () => {};
		}

		const id = ledger.size + 1;
		const registration: HookRegistration<T> = { ...options, id, hook, handler };
		ledger.set(handler, registration);

		return () => this.off(hook, handler);
	}

	/**
	 * Register a new hook handler to run before the default handler.
	 * Shortcut for `hooks.on(hook, handler, { before: true })`.
	 * @param hook Name of the hook to listen for
	 * @param handler The handler function to execute
	 * @param options Any other event options (see `hooks.on()` for details)
	 * @returns A function to unregister the handler
	 * @see on
	 */
	// Overload: passed in handler options
	before<T extends HookName>(hook: T, handler: HookHandler<T>, options: HookOptions): HookUnregister; // prettier-ignore
	// Overload: no handler options
	before<T extends HookName>(hook: T, handler: HookHandler<T>): HookUnregister;
	// Implementation
	before<T extends HookName>(
		hook: T,
		handler: HookHandler<T>,
		options: HookOptions = {}
	): HookUnregister {
		return this.on(hook, handler, { ...options, before: true });
	}

	/**
	 * Register a new hook handler to replace the default handler.
	 * Shortcut for `hooks.on(hook, handler, { replace: true })`.
	 * @param hook Name of the hook to listen for
	 * @param handler The handler function to execute instead of the default handler
	 * @param options Any other event options (see `hooks.on()` for details)
	 * @returns A function to unregister the handler
	 * @see on
	 */
	// Overload: passed in handler options
	replace<T extends HookName>(hook: T, handler: HookDefaultHandler<T>, options: HookOptions): HookUnregister; // prettier-ignore
	// Overload: no handler options
	replace<T extends HookName>(hook: T, handler: HookDefaultHandler<T>): HookUnregister; // prettier-ignore
	// Implementation
	replace<T extends HookName>(
		hook: T,
		handler: HookDefaultHandler<T>,
		options: HookOptions = {}
	): HookUnregister {
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
	// Overload: passed in handler options
	once<T extends HookName>(hook: T, handler: HookHandler<T>, options: HookOptions): HookUnregister; // prettier-ignore
	// Overload: no handler options
	once<T extends HookName>(hook: T, handler: HookHandler<T>): HookUnregister;
	// Implementation
	once<T extends HookName>(
		hook: T,
		handler: HookHandler<T>,
		options: HookOptions = {}
	): HookUnregister {
		return this.on(hook, handler, { ...options, once: true });
	}

	/**
	 * Unregister a hook handler.
	 * @param hook Name of the hook the handler is registered for
	 * @param handler The handler function that was registered.
	 *                If omitted, all handlers for the hook will be removed.
	 */
	// Overload: unregister a specific handler
	off<T extends HookName>(hook: T, handler: HookHandler<T> | HookDefaultHandler<T>): void;
	// Overload: unregister all handlers
	off<T extends HookName>(hook: T): void;
	// Implementation
	off<T extends HookName>(hook: T, handler?: HookHandler<T> | HookDefaultHandler<T>): void {
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
	 * @param visit The visit object this hook belongs to
	 * @param args Arguments to pass to the handler
	 * @param defaultHandler A default implementation of this hook to execute
	 * @returns The resolved return value of the executed default handler
	 */
	// Overload: default order of arguments
	async call<T extends HookName>(hook: T, visit: Visit | undefined, args: HookArguments<T>, defaultHandler?: HookDefaultHandler<T>): Promise<Awaited<ReturnType<HookDefaultHandler<T>>>>; // prettier-ignore
	// Overload: legacy order of arguments, with visit missing
	async call<T extends HookName>(hook: T, args: HookArguments<T>, defaultHandler?: HookDefaultHandler<T>): Promise<Awaited<ReturnType<HookDefaultHandler<T>>>>; // prettier-ignore
	// Implementation
	async call<T extends HookName>(
		hook: T,
		arg1: Visit | HookArguments<T>,
		arg2: HookArguments<T> | HookDefaultHandler<T>,
		arg3?: HookDefaultHandler<T>
	): Promise<Awaited<ReturnType<HookDefaultHandler<T>>>> {
		const [visit, args, defaultHandler] = this.parseCallArgs(hook, arg1, arg2, arg3);

		const { before, handler, after } = this.getHandlers(hook, defaultHandler);
		await this.run(before, visit, args);
		const [result] = await this.run(handler, visit, args, true);
		await this.run(after, visit, args);
		this.dispatchDomEvent(hook, visit, args);
		return result;
	}

	/**
	 * Trigger a hook synchronously, executing its default handler and all registered handlers.
	 * Will execute all handlers in order, but will **not** `await` any `Promise`s they return.
	 * @param hook Name of the hook to trigger
	 * @param visit The visit object this hook belongs to
	 * @param args Arguments to pass to the handler
	 * @param defaultHandler A default implementation of this hook to execute
	 * @returns The (possibly unresolved) return value of the executed default handler
	 */
	// Overload: default order of arguments
	callSync<T extends HookName>(hook: T, visit: Visit | undefined, args: HookArguments<T>, defaultHandler?: HookDefaultHandler<T>): ReturnType<HookDefaultHandler<T>>; // prettier-ignore
	// Overload: legacy order of arguments, with visit missing
	callSync<T extends HookName>(hook: T, args: HookArguments<T>, defaultHandler?: HookDefaultHandler<T>): ReturnType<HookDefaultHandler<T>>; // prettier-ignore
	// Implementation
	callSync<T extends HookName>(
		hook: T,
		arg1: Visit | HookArguments<T>,
		arg2: HookArguments<T> | HookDefaultHandler<T>,
		arg3?: HookDefaultHandler<T>
	): ReturnType<HookDefaultHandler<T>> {
		const [visit, args, defaultHandler] = this.parseCallArgs(hook, arg1, arg2, arg3);
		const { before, handler, after } = this.getHandlers(hook, defaultHandler);
		this.runSync(before, visit, args);
		const [result] = this.runSync(handler, visit, args, true);
		this.runSync(after, visit, args);
		this.dispatchDomEvent(hook, visit, args);
		return result;
	}

	/**
	 * Parse the call arguments for call() and callSync() to allow legacy argument order.
	 */
	protected parseCallArgs<T extends HookName>(
		hook: T,
		arg1: Visit | HookArguments<T> | undefined,
		arg2: HookArguments<T> | HookDefaultHandler<T>,
		arg3?: HookDefaultHandler<T>
	): [Visit | undefined, HookArguments<T>, HookDefaultHandler<T> | undefined] {
		const isLegacyOrder =
			!(arg1 instanceof Visit) && (typeof arg1 === 'object' || typeof arg2 === 'function');
		if (isLegacyOrder) {
			// Legacy positioning: arguments in second or handler passed in third place
			return [undefined, arg1 as HookArguments<T>, arg2 as HookDefaultHandler<T>];
		} else {
			// Default positioning: visit passed in as first argument
			return [arg1, arg2 as HookArguments<T>, arg3];
		}
	}

	/**
	 * Execute the handlers for a hook, in order, as `Promise`s that will be `await`ed.
	 * @param registrations The registrations (handler + options) to execute
	 * @param args Arguments to pass to the handler
	 */

	// Overload: running HookDefaultHandler: expect HookDefaultHandler return type
	protected async run<T extends HookName>(registrations: HookRegistration<T, HookDefaultHandler<T>>[], visit: Visit | undefined, args: HookArguments<T>, rethrow: true): Promise<Awaited<ReturnType<HookDefaultHandler<T>>>[]>; // prettier-ignore
	// Overload:  running user handler: expect no specific type
	protected async run<T extends HookName>(registrations: HookRegistration<T>[], visit: Visit | undefined, args: HookArguments<T>): Promise<unknown[]>; // prettier-ignore
	// Implementation
	protected async run<T extends HookName, R extends HookRegistration<T>[]>(
		registrations: R,
		visit: Visit | undefined = this.swup.visit,
		args: HookArguments<T>,
		rethrow: boolean = false
	): Promise<Awaited<ReturnType<HookDefaultHandler<T>>> | unknown[]> {
		const results = [];
		for (const { hook, handler, defaultHandler, once } of registrations) {
			if (visit?.done) continue;
			if (once) this.off(hook, handler);
			try {
				const result = await runAsPromise(handler, [visit, args, defaultHandler]);
				results.push(result);
			} catch (error) {
				if (rethrow) {
					throw error;
				} else {
					console.error(`Error in hook '${hook}':`, error);
				}
			}
		}
		return results;
	}

	/**
	 * Execute the handlers for a hook, in order, without `await`ing any returned `Promise`s.
	 * @param registrations The registrations (handler + options) to execute
	 * @param args Arguments to pass to the handler
	 */

	// Overload: running HookDefaultHandler: expect HookDefaultHandler return type
	protected runSync<T extends HookName>(registrations: HookRegistration<T, HookDefaultHandler<T>>[], visit: Visit | undefined, args: HookArguments<T>, rethrow: true): ReturnType<HookDefaultHandler<T>>[]; // prettier-ignore
	// Overload: running user handler: expect no specific type
	protected runSync<T extends HookName>(registrations: HookRegistration<T>[], visit: Visit | undefined, args: HookArguments<T>): unknown[]; // prettier-ignore
	// Implementation
	protected runSync<T extends HookName, R extends HookRegistration<T>[]>(
		registrations: R,
		visit: Visit | undefined = this.swup.visit,
		args: HookArguments<T>,
		rethrow: boolean = false
	): (ReturnType<HookDefaultHandler<T>> | unknown)[] {
		const results = [];
		for (const { hook, handler, defaultHandler, once } of registrations) {
			if (visit?.done) continue;
			if (once) this.off(hook, handler);
			try {
				const result = (handler as HookDefaultHandler<T>)(visit, args, defaultHandler);
				results.push(result);
				if (isPromise(result)) {
					console.warn(
						`Swup will not await Promises in handler for synchronous hook '${hook}'.`
					);
				}
			} catch (error) {
				if (rethrow) {
					throw error;
				} else {
					console.error(`Error in hook '${hook}':`, error);
				}
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
	protected getHandlers<T extends HookName>(hook: T, defaultHandler?: HookDefaultHandler<T>) {
		const ledger = this.get(hook);
		if (!ledger) {
			return { found: false, before: [], handler: [], after: [], replaced: false };
		}

		const registrations = Array.from(ledger.values());

		// Let TypeScript know that replaced handlers are default handlers by filtering to true
		const def = (T: HookRegistration<T>): T is HookRegistration<T, HookDefaultHandler<T>> => true; // prettier-ignore
		const sort = this.sortRegistrations;

		// Filter into before, after, and replace handlers
		const before = registrations.filter(({ before, replace }) => before && !replace).sort(sort);
		const replace = registrations.filter(({ replace }) => replace).filter(def).sort(sort); // prettier-ignore
		const after = registrations.filter(({ before, replace }) => !before && !replace).sort(sort);
		const replaced = replace.length > 0;

		// Define main handler registration
		// Created as HookRegistration[] array to allow passing it into hooks.run() directly
		let handler: HookRegistration<T, HookDefaultHandler<T>>[] = [];
		if (defaultHandler) {
			handler = [{ id: 0, hook, handler: defaultHandler }];
			if (replaced) {
				const index = replace.length - 1;
				const { handler: replacingHandler, once } = replace[index];
				const createDefaultHandler = (index: number): HookDefaultHandler<T> | undefined => {
					const next = replace[index - 1];
					if (next) {
						return (visit, args) =>
							next.handler(visit, args, createDefaultHandler(index - 1));
					} else {
						return defaultHandler;
					}
				};
				const nestedDefaultHandler = createDefaultHandler(index);
				handler = [{ id: 0, hook, once, handler: replacingHandler, defaultHandler: nestedDefaultHandler }]; // prettier-ignore
			}
		}

		return { found: true, before, handler, after, replaced };
	}

	/**
	 * Sort two hook registrations by priority and registration order.
	 * @param a The registration object to compare
	 * @param b The other registration object to compare with
	 * @returns The sort direction
	 */
	protected sortRegistrations<T extends HookName>(
		a: HookRegistration<T>,
		b: HookRegistration<T>
	): number {
		const priority = (a.priority ?? 0) - (b.priority ?? 0);
		const id = a.id - b.id;
		return priority || id || 0;
	}

	/**
	 * Dispatch a custom event on the `document` for a hook. Prefixed with `swup:`
	 * @param hook Name of the hook.
	 */
	protected dispatchDomEvent<T extends HookName>(
		hook: T,
		visit: Visit | undefined,
		args?: HookArguments<T>
	): void {
		if (visit?.done) return;

		const detail: HookEventDetail = { hook, args, visit: visit || this.swup.visit };
		document.dispatchEvent(
			new CustomEvent<HookEventDetail>(`swup:any`, { detail, bubbles: true })
		);
		document.dispatchEvent(
			new CustomEvent<HookEventDetail>(`swup:${hook}`, { detail, bubbles: true })
		);
	}

	/**
	 * Parse a hook name into the name and any modifiers.
	 * @param hook Name of the hook.
	 */
	parseName(hook: HookName | HookNameWithModifier): [HookName, Partial<HookOptions>] {
		const [name, ...modifiers] = hook.split('.');
		const options = modifiers.reduce((acc, mod) => ({ ...acc, [mod]: true }), {});
		return [name as HookName, options];
	}
}
