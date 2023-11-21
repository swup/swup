import type { Path } from 'path-to-regexp';
import type { DelegateEventUnsubscribe } from './helpers/delegateEvent.js';
import type { DelegateEvent, DelegateEventHandler } from 'delegate-it';
import Swup from './Swup.js';
import type { Options } from './Swup.js';
import type { CacheData } from './modules/Cache.js';
import type { PageData } from './modules/fetchPage.js';
import type {
	Visit,
	VisitFrom,
	VisitTo,
	VisitAnimation,
	VisitScroll,
	VisitHistory
} from './modules/Visit.js';
import type {
	HookName,
	HookDefinitions,
	HookArguments,
	HookReturnValues,
	HookHandler,
	HookDefaultHandler,
	HookOptions,
	HookUnregister,
	HookEvent
} from './modules/Hooks.js';
import type { Plugin } from './modules/plugins.js';

export default Swup;
export * from './helpers.js';
export * from './utils.js';
export type {
	Swup,
	Options,
	Plugin,
	CacheData,
	PageData,
	Path,
	Visit,
	VisitFrom,
	VisitTo,
	VisitAnimation,
	VisitScroll,
	VisitHistory,
	HookName,
	HookDefinitions,
	HookArguments,
	HookReturnValues,
	HookHandler,
	HookHandler as Handler, // backwards compatibility
	HookDefaultHandler,
	HookOptions,
	HookUnregister,
	HookEvent,
	DelegateEvent,
	DelegateEventHandler,
	DelegateEventUnsubscribe
};
