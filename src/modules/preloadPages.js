import { queryAll } from '../utils';
import preloadPage from './preloadPage';

export const preloadPages = function() {
	if (this.options.preload) {
		queryAll('[data-swup-preload]').forEach((element) => {
			this.preloadPage(element.href);
		});
	}
};

export default preloadPages;
