function createUrl(hrefOrElement) {
	let href
	if (hrefOrElement instanceof Element) {
		href = hrefOrElement.getAttribute('href') || hrefOrElement.getAttribute('xlink:href');
	} else {
		href = hrefOrElement.toString();
	}

	const url = new URL(href, document.baseURI);

	// Define custom 'address' getter for pathname + query params
	Object.defineProperty(url, 'address', {
    get() {
			return this.pathname + this.search
		}
	});

	return url;
}

export default createUrl;
