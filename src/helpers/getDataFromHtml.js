import { queryAll } from '../utils';

const getDataFromHtml = (html, containers) => {
	let content = html.replace('<body', '<div id="swupBody"').replace('</body>', '</div>');
	let fakeDom = document.createElement('div');
	fakeDom.innerHTML = content;
	let blocks = [];

	for (let i = 0; i < containers.length; i++) {
		if (fakeDom.querySelector(containers[i]) == null) {
			// page in invalid
			return null;
		} else {
			queryAll(containers[i]).forEach((item, index) => {
				queryAll(containers[i], fakeDom)[index].setAttribute("data-swup", blocks.length); // marks element with data-swup
				blocks.push(queryAll(containers[i], fakeDom)[index].outerHTML);
			});
		}
	}

	const json = {
		title: fakeDom.querySelector('title').innerText,
		pageClass: fakeDom.querySelector('#swupBody').className,
		originalContent: html,
		blocks: blocks
	};

	// to prevent memory leaks
	fakeDom.innerHTML = '';
	fakeDom = null;

	return json;
};

export default getDataFromHtml;
