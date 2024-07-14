import { queryAll } from '../utils.js';
import type Swup from '../Swup.js';
import type { Options } from '../Swup.js';

const TRANSITION = 'transition';
const ANIMATION = 'animation';

type AnimationType = typeof TRANSITION | typeof ANIMATION;
type AnimationEndEvent = `${AnimationType}end`;
type AnimationProperty = 'Delay' | 'Duration';
type AnimationStyleKey = `${AnimationType}${AnimationProperty}` | 'transitionProperty';

export type AnimationDirection = 'in' | 'out';

/**
 * Return a Promise that resolves when all CSS animations and transitions
 * are done on the page. Filters by selector or takes elements directly.
 */
export async function awaitAnimations(
	this: Swup,
	{
		selector,
		elements
	}: {
		selector: Options['animationSelector'];
		elements?: NodeListOf<HTMLElement> | HTMLElement[];
	}
): Promise<void> {
	// Allow usage of swup without animations: { animationSelector: false }
	if (selector === false && !elements) {
		return;
	}

	// Allow passing in elements
	let animatedElements: HTMLElement[] = [];
	if (elements) {
		animatedElements = Array.from(elements);
	} else if (selector) {
		animatedElements = queryAll(selector, document.body);
		// Warn if no elements match the selector, but keep things going
		if (!animatedElements.length) {
			console.warn(`[swup] No elements found matching animationSelector \`${selector}\``);
			return;
		}
	}

	const awaitedAnimations = animatedElements.map((el) => awaitAnimationsOnElement(el));
	const hasAnimations = awaitedAnimations.filter(Boolean).length > 0;
	if (!hasAnimations) {
		if (selector) {
			console.warn(
				`[swup] No CSS animation duration defined on elements matching \`${selector}\``
			);
		}
		return;
	}

	await Promise.all(awaitedAnimations);
}

function awaitAnimationsOnElement(element: HTMLElement): Promise<void> | false {
	const { type, timeout, propCount } = getTransitionInfo(element);

	// Resolve immediately if no transition defined
	if (!type || !timeout) {
		return false;
	}

	return new Promise((resolve) => {
		const endEvent: AnimationEndEvent = `${type}end`;
		const startTime = performance.now();
		let propsTransitioned = 0;

		const end = () => {
			element.removeEventListener(endEvent, onEnd);
			resolve();
		};

		const onEnd = (event: TransitionEvent | AnimationEvent) => {
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

function getTransitionInfo(element: Element) {
	const styles = window.getComputedStyle(element);

	const transitionDelays = getStyleProperties(styles, `${TRANSITION}Delay`);
	const transitionDurations = getStyleProperties(styles, `${TRANSITION}Duration`);
	const transitionTimeout = calculateTimeout(transitionDelays, transitionDurations);

	const animationDelays = getStyleProperties(styles, `${ANIMATION}Delay`);
	const animationDurations = getStyleProperties(styles, `${ANIMATION}Duration`);
	const animationTimeout = calculateTimeout(animationDelays, animationDurations);

	const timeout = Math.max(transitionTimeout, animationTimeout);
	const type: AnimationType | null =
		timeout > 0 ? (transitionTimeout > animationTimeout ? TRANSITION : ANIMATION) : null;
	const propCount = type
		? type === TRANSITION
			? transitionDurations.length
			: animationDurations.length
		: 0;

	return {
		type,
		timeout,
		propCount
	};
}

export function getStyleProperties(styles: CSSStyleDeclaration, key: AnimationStyleKey): string[] {
	return (styles[key] || '').split(', ');
}

export function calculateTimeout(delays: string[], durations: string[]): number {
	while (delays.length < durations.length) {
		delays = delays.concat(delays);
	}

	return Math.max(...durations.map((duration, i) => toMs(duration) + toMs(delays[i])));
}

export function toMs(time: string): number {
	return parseFloat(time) * 1000;
}
