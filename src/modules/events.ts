import Swup from '../Swup.js';
import { HookDefinitions, HookContext, HookData, HookName, Handler, HookOptions } from './Hooks.js';

export function on<THook extends HookName>(
	this: Swup,
	hook: THook,
	handler: Handler<THook>,
	options: HookOptions = {}
) {
	return this.hooks.add(hook, handler, { ...options, raw: true });
}

export function off<THook extends HookName>(this: Swup, hook?: THook, handler?: Handler<THook>) {
	if (hook) {
		return this.hooks.remove(hook, handler);
	} else {
		return this.hooks.clear();
	}
}

export function triggerEvent<TEvent extends HookName>(
	this: Swup,
	eventName: TEvent,
	data?: HookData<TEvent>
	// originalEvent?: HookContext<TEvent>['originalEvent'],
) {
	return this.hooks.call(eventName, data);
}
