import delegate from 'delegate-it';

const delegateEvent = (selector, type, callback, { base = document, ...eventOptions }) => {
	return delegate(base, selector, type, callback, eventOptions);
};

export default delegateEvent;
