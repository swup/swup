import Swup, { Options } from './Swup';
import { Plugin } from './modules/plugins';
import { Handler } from './modules/events';

export default Swup;

export * from './helpers';
export * from './utils';

export type { Options, Plugin, Handler };
