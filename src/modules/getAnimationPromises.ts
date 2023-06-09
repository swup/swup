import { queryAll, toMs } from '../utils.js';
import Swup from '../Swup.js';

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

export function getAnimationPromises(
	this: Swup,
	// we don't use this argument, but JS plugin depends on it with
	// its own version of getAnimationPromises, so it must be specified when
	// getAnimationPromises is being used
	animationType: 'in' | 'out'
): Promise<void>[] {
	const selector = this.options.animationSelector;

	// Allow usage of swup without animations
	if (selector === false) {
		// Use array of a single resolved promise instead of an empty array to allow
		// possible future use with Promise.race() which requires an actual value
		return [Promise.resolve()];
	}

	const animatedElements = queryAll(selector, document.body);

	// Warn if no elements match the animationSelector, but keep things going
	if (!animatedElements.length) {
		console.warn(`[swup] No elements found matching animationSelector \`${selector}\``);
		return [Promise.resolve()];
	}

	const animationPromises = animatedElements
		.map((element) => getAnimationPromiseForElement(element))
		.filter(Boolean) as Promise<void>[];

	if (!animationPromises.length) {
		console.warn(
			`[swup] No CSS animation duration defined on elements matching \`${selector}\``
		);
		return [Promise.resolve()];
	}

	return animationPromises;
}

const isTransitionOrAnimationEvent = (event: any): event is TransitionEvent | AnimationEvent =>
	[transitionEndEvent, animationEndEvent].includes(event.type);

function getAnimationPromiseForElement(element: Element): Promise<void> | undefined {
	const { type, timeout, propCount } = getTransitionInfo(element);

	// Resolve immediately if no transition defined
	if (!type || !timeout) {
		return undefined;
	}

	return new Promise((resolve) => {
		const endEvent = type === 'transition' ? transitionEndEvent : animationEndEvent;
		const startTime = performance.now();
		let propsTransitioned = 0;

		const end = () => {
			element.removeEventListener(endEvent, onEnd);
			resolve();
		};

		const onEnd: EventListener = (event) => {
			// Skip transitions on child elements
			if (event.target !== element) {
				return;
			}

			if (!isTransitionOrAnimationEvent(event)) {
				throw new Error('Not a transition or animation event.');
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

export function getTransitionInfo(
	element: Element,
	expectedType: 'animation' | 'transition' | null = null
) {
	const styles = window.getComputedStyle(element);

	// not sure what to do about the below mess other than casting, but it's a mess
	const transitionDelay = `${transitionProp}Delay` as keyof CSSStyleDeclaration;
	const transitionDuration = `${transitionProp}Duration` as keyof CSSStyleDeclaration;
	const animationDelay = `${animationProp}Delay` as keyof CSSStyleDeclaration;
	const animationDuration = `${animationProp}Duration` as keyof CSSStyleDeclaration;

	const transitionDelays = (
		styles[transitionDelay] as CSSStyleDeclaration['transitionDelay']
	).split(', ');
	const transitionDurations = (
		(styles[transitionDuration] || '') as CSSStyleDeclaration['transitionDuration']
	).split(', ');
	const transitionTimeout = calculateTimeout(transitionDelays, transitionDurations);

	const animationDelays = (
		(styles[animationDelay] || '') as CSSStyleDeclaration['animationDelay']
	).split(', ');
	const animationDurations = (
		(styles[animationDuration] || '') as CSSStyleDeclaration['animationDuration']
	).split(', ');
	const animationTimeout = calculateTimeout(animationDelays, animationDurations);

	let type: string | null = '';
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

function calculateTimeout(delays: string[], durations: string[]) {
	while (delays.length < durations.length) {
		delays = delays.concat(delays);
	}

	return Math.max(...durations.map((duration, i) => toMs(duration) + toMs(delays[i])));
}
