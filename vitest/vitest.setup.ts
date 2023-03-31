import { vi } from 'vitest'
// Stub browser functions for vitest
console.log = vi.fn();
console.warn = vi.fn();
console.error = vi.fn();
