import Swup from '../../src/Swup.js';

declare global {
	interface Window {
		_swup: Swup;
		data: any;
	}
}
