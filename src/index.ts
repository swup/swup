import type { Path } from 'path-to-regexp';

import Swup, { type Options } from './Swup.js';
import type { PageData } from './modules/fetchPage.js';
import type { CacheData } from './modules/Cache.js';
import type {
	Visit,
	VisitFrom,
	VisitTo,
	VisitAnimation,
	VisitScroll,
	VisitHistory
} from './modules/Visit.js';
import type {
	HookDefinitions,
	HookName,
	HookOptions,
	HookUnregister,
	Handler
} from './modules/Hooks.js';
import type { Plugin } from './modules/plugins.js';

export default Swup;

export * from './helpers.js';
export * from './utils.js';

export type {
	Options,
	Plugin,
	CacheData,
	PageData,
	Visit,
	VisitFrom,
	VisitTo,
	VisitAnimation,
	VisitScroll,
	VisitHistory,
	HookDefinitions,
	HookName,
	HookOptions,
	HookUnregister,
	Handler,
	Path
};
