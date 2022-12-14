import delegate from 'delegate-it';

const delegateEvent = (selector, type, callback, { base = document, ...eventOptions }) => {
	const delegation = delegate(base, selector, type, callback, eventOptions);
	return { destroy: () => delegation.destroy() };
};

export default delegateEvent;
