import Swup, { Options } from './Swup.js';
import { Plugin } from './modules/plugins.js';
import { Handler } from './modules/events.js';

export default Swup;

export * from './helpers.js';
export * from './utils.js';

export type { Options, Plugin, Handler };
