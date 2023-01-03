import { query } from '../utils.js';

const replaceContent = function({ blocks, title }) {
	// replace blocks
	blocks.forEach((html, i) => {
		const block = query(`[data-swup="${i}"]`, document.body);
		block.outerHTML = html;
	});

		// set title
	document.title = title;

	// Return a Promise to allow plugins to defer
	return Promise.resolve();
};

export default replaceContent;
