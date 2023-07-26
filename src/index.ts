import type { Path } from 'path-to-regexp';

import Swup from './Swup.js';
import type { Options } from './Swup.js';
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
	Swup,
	Options,
	Plugin,
	CacheData,
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
