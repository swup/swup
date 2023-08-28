import { DelegateEvent } from 'delegate-it';
import { describe, it } from 'vitest';

import { delegateEvent } from '../../src/helpers/delegateEvent.js';

describe('delegateEvent', () => {
	it('should return correct types', () => {
		delegateEvent('form', 'submit', (event) => {});

		// @ts-expect-no-error
		delegateEvent('form', 'submit', (event: SubmitEvent) => {});
		// @ts-expect-error
		delegateEvent('form', 'submit', (event: MouseEvent) => {});

		// @ts-expect-no-error
		delegateEvent('form', 'submit', (event: DelegateEvent<SubmitEvent>) => {});
		// @ts-expect-error
		delegateEvent('form', 'submit', (event: DelegateEvent<MouseEvent>) => {});

		// @ts-expect-no-error
		delegateEvent('form', 'submit', (event: DelegateEvent<SubmitEvent, HTMLFormElement>) => {});
		delegateEvent(
			'form',
			'submit',
			// @ts-expect-error
			(event: DelegateEvent<MouseEvent, HTMLAnchorElement>) => {}
		);

		delegateEvent('form', 'submit', (event) => {
			// @ts-expect-no-error
			const el: HTMLFormElement = event.delegateTarget;
		});
		// @ts-expect-error
		delegateEvent('form', 'submit', (event: MouseEvent) => {});
	});
});
