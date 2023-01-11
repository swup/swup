import Swup from '../index.js';

const updateTransition = function(this: Swup, from: string, to: string, custom?: string): void {
	this.transition = { from, to, custom };
};

export default updateTransition;
