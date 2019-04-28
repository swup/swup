import { queryAll } from '../utils';

const getDataFromHTML = (html, request, containers) => {
	let content = html.replace('<body', '<div id="swupBody"').replace('</body>', '</div>');
	let fakeDom = document.createElement('div');
	fakeDom.innerHTML = content;
	let blocks = [];

	for (let i = 0; i < containers.length; i++) {
		if (fakeDom.querySelector(containers[i]) == null) {
			console.warn(`Element ${containers[i]} is not found in cached page.`);
			return null;
		} else {
			queryAll(containers[i]).forEach((item, index) => {
				queryAll(containers[i], fakeDom)[index].dataset.swup = blocks.length;
				blocks.push(queryAll(containers[i], fakeDom)[index].outerHTML);
			});
		}
	}

	const json = {
		title: fakeDom.querySelector('title').innerText,
		pageClass: fakeDom.querySelector('#swupBody').className,
		originalContent: html,
		blocks: blocks,
		responseURL: request != null ? request.responseURL : window.location.href
	};
	return json;
};

export default getDataFromHTML;
