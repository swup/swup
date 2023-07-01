import { queryAll, toMs } from '../utils.js';
import Swup, { Options } from '../Swup.js';

const TRANSITION = 'transition';
const ANIMATION = 'animation';

type AnimationTypes = typeof TRANSITION | typeof ANIMATION;
type AnimationProperties = 'Delay' | 'Duration';
type AnimationStyleKeys = `${AnimationTypes}${AnimationProperties}` | 'transitionProperty';
type AnimationStyleDeclarations = Pick<CSSStyleDeclaration, AnimationStyleKeys>;

export type AnimationDirection = 'in' | 'out';

/**
 * Get an array of Promises that resolve when all animations are done on the page.
 * @note We don't make use of the `direction` argument, but it's required by JS plugin
 */
export function getAnimationPromises(
	this: Swup,
	{
		elements,
		selector
	}: {
		selector: Options['animationSelector'];
		elements?: HTMLElement[];
		direction?: AnimationDirection;
	}
): Promise<void>[] {
	// Use array of a single resolved promise instead of an empty array to allow
	// possible future use with Promise.race() which requires an actual value
	const resolved = [Promise.resolve()];

	// Allow usage of swup without animations
	if (selector === false) {
		return resolved;
	}

	// Allow passing in elements
	let animatedElements: HTMLElement[] = [];
	if (elements) {
		animatedElements = elements;
	} else if (selector) {
		animatedElements = queryAll(selector, document.body);
	}

	// Warn if no elements match the selector, but keep things going
	if (!animatedElements.length) {
		console.warn(`[swup] No elements found matching animationSelector \`${selector}\``);
		return resolved;
	}

	const animationPromises = animatedElements
		.map((element) => getAnimationPromiseForElement(element))
		.filter(Boolean) as Promise<void>[];

	if (!animationPromises.length) {
		console.warn(
			`[swup] No CSS animation duration defined on elements matching \`${selector}\``
		);
		return resolved;
	}

	return animationPromises;
}

function getAnimationPromiseForElement(element: Element): Promise<void> | undefined {
	const { type, timeout, propCount } = getTransitionInfo(element);

	// Resolve immediately if no transition defined
	if (!type || !timeout) {
		return undefined;
	}

	return new Promise((resolve) => {
		const endEvent = `${type}end`;
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

export function getTransitionInfo(element: Element, expectedType?: AnimationTypes) {
	const styles = window.getComputedStyle(element) as AnimationStyleDeclarations;

	const transitionDelays = getStyleProperties(styles, `${TRANSITION}Delay`);
	const transitionDurations = getStyleProperties(styles, `${TRANSITION}Duration`);
	const transitionTimeout = calculateTimeout(transitionDelays, transitionDurations);
	const animationDelays = getStyleProperties(styles, `${ANIMATION}Delay`);
	const animationDurations = getStyleProperties(styles, `${ANIMATION}Duration`);
	const animationTimeout = calculateTimeout(animationDelays, animationDurations);

	let type: AnimationTypes | null = null;
	let timeout = 0;
	let propCount = 0;

	if (expectedType === TRANSITION) {
		if (transitionTimeout > 0) {
			type = TRANSITION;
			timeout = transitionTimeout;
			propCount = transitionDurations.length;
		}
	} else if (expectedType === ANIMATION) {
		if (animationTimeout > 0) {
			type = ANIMATION;
			timeout = animationTimeout;
			propCount = animationDurations.length;
		}
	} else {
		timeout = Math.max(transitionTimeout, animationTimeout);
		type = timeout > 0 ? (transitionTimeout > animationTimeout ? TRANSITION : ANIMATION) : null;
		propCount = type
			? type === TRANSITION
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

function isTransitionOrAnimationEvent(event: any): event is TransitionEvent | AnimationEvent {
	return [`${TRANSITION}end`, `${ANIMATION}end`].includes(event.type);
}

function getStyleProperties(styles: AnimationStyleDeclarations, key: AnimationStyleKeys): string[] {
	return (styles[key] || '').split(', ');
}

function calculateTimeout(delays: string[], durations: string[]): number {
	while (delays.length < durations.length) {
		delays = delays.concat(delays);
	}

	return Math.max(...durations.map((duration, i) => toMs(duration) + toMs(delays[i])));
}
