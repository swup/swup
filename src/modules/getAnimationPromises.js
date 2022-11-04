import { queryAll, toMs } from '../utils.js';

// Transition property/event sniffing
let transitionProp = 'transition';
let transitionEndEvent = 'transitionend';
let animationProp = 'animation';
let animationEndEvent = 'animationend';

if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
	transitionProp = 'WebkitTransition';
	transitionEndEvent = 'webkitTransitionEnd';
}

if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
	animationProp = 'WebkitAnimation';
	animationEndEvent = 'webkitAnimationEnd';
}

export default function getAnimationPromises() {
	const selector = this.options.animationSelector;

	// Allow usage of swup without animations
	if (selector === false) {
		return [Promise.resolve()];
	}

	const animatedElements = queryAll(selector, document.body);

	// Warn if no animated containers found on page, but keep things going
	if (!animatedElements.length) {
		console.warn(`[swup] No animated elements found by selector ${selector}`);
		return [Promise.resolve()];
	}

	return animatedElements.map((element) => getAnimationPromiseForElement(element, selector));
}

function getAnimationPromiseForElement(element, selector, expectedType = null) {
	const { type, timeout, propCount } = getTransitionInfo(element, expectedType);

	// Resolve immediately if no transition defined
	if (!type || !timeout) {
		console.warn(
			`[swup] No CSS transition duration defined for element of selector ${selector}`
		);
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		const endEvent = type === 'transition' ? transitionEndEvent : animationEndEvent;
		const startTime = performance.now();
		let propsTransitioned = 0;

		const end = () => {
			element.removeEventListener(endEvent, onEnd);
			resolve();
		};

		const onEnd = (event) => {
			// Skip transitions on child elements
			if (event.target !== element) {
				return;
			}

			// Skip transitions that happened before we started listening
			const elapsedTime = (performance.now() - startTime) / 1000;
			if (elapsedTime < event.elapsedTime) {
				return;
			}

			// End if all properties have transitioned
			if (++propsTransitioned >= propCount) {
				end();
			}
		};

		setTimeout(() => {
			if (propsTransitioned < propCount) {
				end();
			}
		}, timeout + 1);

		element.addEventListener(endEvent, onEnd);
	});
}

export function getTransitionInfo(element, expectedType = null) {
	const styles = window.getComputedStyle(element);

	const transitionDelays = (styles[`${transitionProp}Delay`] || '').split(', ');
	const transitionDurations = (styles[`${transitionProp}Duration`] || '').split(', ');
	const transitionTimeout = calculateTimeout(transitionDelays, transitionDurations);

	const animationDelays = (styles[`${animationProp}Delay`] || '').split(', ');
	const animationDurations = (styles[`${animationProp}Duration`] || '').split(', ');
	const animationTimeout = calculateTimeout(animationDelays, animationDurations);

	let type = '';
	let timeout = 0;
	let propCount = 0;

	if (expectedType === 'transition') {
		if (transitionTimeout > 0) {
			type = 'transition';
			timeout = transitionTimeout;
			propCount = transitionDurations.length;
		}
	} else if (expectedType === 'animation') {
		if (animationTimeout > 0) {
			type = 'animation';
			timeout = animationTimeout;
			propCount = animationDurations.length;
		}
	} else {
		timeout = Math.max(transitionTimeout, animationTimeout);
		type =
			timeout > 0
				? transitionTimeout > animationTimeout
					? 'transition'
					: 'animation'
				: null;
		propCount = type
			? type === 'transition'
				? transitionDurations.length
				: animationDurations.length
			: 0;
	}

	return {
		type,
		timeout,
		propCount
	};
}

function calculateTimeout(delays, durations) {
	while (delays.length < durations.length) {
		delays = delays.concat(delays);
	}

	return Math.max(...durations.map((duration, i) => toMs(duration) + toMs(delays[i])));
}
