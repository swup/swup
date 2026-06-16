import type { Visit } from './Visit.js';

export type AttributeType = 'boolean' | 'string' | 'string|false' | 'enum';

export type AttributeSchemaEntry = {
	/** Visit object path to write to, e.g. `history.action`. */
	path: string;
	/** Data attribute to read, e.g. `data-swup-history-action`. */
	attr: string;
	/** How to coerce the attribute value before writing it to the visit. */
	type: AttributeType;
	/** Allowed values for enum attributes. */
	values?: readonly string[];
	/** Legacy alias attribute competing for the same path. */
	alias?: string;
	/** Whether this attribute applies to popstate visits. Default: `true`. */
	popstate?: boolean;
};

type NormalizedAttributeSchemaEntry = Required<
	Pick<AttributeSchemaEntry, 'path' | 'attr' | 'type' | 'popstate'>
> &
	Pick<AttributeSchemaEntry, 'values' | 'alias'>;

type AttributeResolverEntry = NormalizedAttributeSchemaEntry & {
	attr: string;
	canonicalAttr: string;
	isAlias: boolean;
};

const IGNORE = Symbol('ignore visit attribute');

const attributesByPath = new Map<string, NormalizedAttributeSchemaEntry>();
const attributesByName = new Map<string, AttributeResolverEntry>();

const coreAttributes: AttributeSchemaEntry[] = [
	{
		path: 'history.action',
		attr: 'data-swup-history-action',
		type: 'enum',
		values: ['push', 'replace'],
		alias: 'data-swup-history',
		popstate: false
	},
	{
		path: 'animation.name',
		attr: 'data-swup-animation-name',
		type: 'string',
		alias: 'data-swup-animation'
	},
	{
		path: 'animation.animate',
		attr: 'data-swup-animation-animate',
		type: 'boolean'
	},
	{
		path: 'animation.native',
		attr: 'data-swup-animation-native',
		type: 'boolean'
	},
	{
		path: 'cache.read',
		attr: 'data-swup-cache-read',
		type: 'boolean'
	},
	{
		path: 'cache.write',
		attr: 'data-swup-cache-write',
		type: 'boolean'
	},
	{
		path: 'scroll.reset',
		attr: 'data-swup-scroll-reset',
		type: 'boolean'
	},
	{
		path: 'scroll.target',
		attr: 'data-swup-scroll-target',
		type: 'string|false'
	}
];

/** Register or override an attribute. */
export function defineAttribute(entry: AttributeSchemaEntry) {
	const normalized = normalizeEntry(entry);
	const existingForPath = attributesByPath.get(normalized.path);
	const attrs = [normalized.attr, normalized.alias].filter((attr): attr is string => !!attr);
	const clashingEntries = new Set<NormalizedAttributeSchemaEntry>();

	if (existingForPath) {
		warn(
			`Attribute path "${normalized.path}" is already registered. Overriding with "${normalized.attr}".`
		);
		clashingEntries.add(existingForPath);
	}

	for (const attr of attrs) {
		const existingForAttr = attributesByName.get(attr);
		if (!existingForAttr) continue;
		warn(
			`Attribute "${attr}" is already registered for path "${existingForAttr.path}". Overriding with path "${normalized.path}".`
		);
		const existingEntry = attributesByPath.get(existingForAttr.path);
		if (existingEntry) {
			clashingEntries.add(existingEntry);
		}
	}

	for (const clashingEntry of clashingEntries) {
		unregisterAttribute(clashingEntry);
	}

	attributesByPath.set(normalized.path, normalized);
	attributesByName.set(normalized.attr, {
		...normalized,
		attr: normalized.attr,
		canonicalAttr: normalized.attr,
		isAlias: false
	});
	if (normalized.alias) {
		attributesByName.set(normalized.alias, {
			...normalized,
			attr: normalized.alias,
			canonicalAttr: normalized.attr,
			isAlias: true
		});
	}
}

for (const entry of coreAttributes) {
	defineAttribute(entry);
}

/** Resolve data-swup attributes from the trigger element's ancestor tree. */
export function resolveAttributes(visit: Visit) {
	const root = visit.trigger.el ?? document.documentElement;
	const patch = new Map<string, unknown>();

	for (let node: Element | null = root; node; node = node.parentElement) {
		const attrs = Array.from(node.attributes);
		const canonicalPathsOnNode = getCanonicalPaths(attrs);
		const resolverEntries = attrs
			.map((attr) => ({ attr, entry: attributesByName.get(normalizeAttrName(attr.name)) }))
			.filter(
				(item): item is { attr: Attr; entry: AttributeResolverEntry } =>
					item.entry !== undefined
			)
			.sort((a, b) => Number(a.entry.isAlias) - Number(b.entry.isAlias));

		for (const { attr, entry } of resolverEntries) {
			if (patch.has(entry.path)) continue;
			if (entry.isAlias && canonicalPathsOnNode.has(entry.path)) continue;
			if (visit.history.popstate && entry.popstate === false) continue;

			const value = coerce(attr.value, entry);
			if (value === IGNORE) continue;

			patch.set(entry.path, value);
		}
	}

	applyPatch(visit, patch);
}

function normalizeEntry(entry: AttributeSchemaEntry): NormalizedAttributeSchemaEntry {
	return {
		...entry,
		attr: normalizeAttrName(entry.attr),
		alias: entry.alias ? normalizeAttrName(entry.alias) : undefined,
		popstate: entry.popstate ?? true
	};
}

function unregisterAttribute(entry: NormalizedAttributeSchemaEntry) {
	attributesByPath.delete(entry.path);
	attributesByName.delete(entry.attr);
	if (entry.alias) {
		attributesByName.delete(entry.alias);
	}
}

function getCanonicalPaths(attrs: Attr[]) {
	const paths = new Set<string>();
	for (const attr of attrs) {
		const entry = attributesByName.get(normalizeAttrName(attr.name));
		if (entry && !entry.isAlias) {
			paths.add(entry.path);
		}
	}
	return paths;
}

function coerce(value: string, entry: AttributeSchemaEntry): unknown | typeof IGNORE {
	const isEmpty = value.trim() === '';

	if (entry.type === 'boolean') {
		return value === 'false' ? false : true;
	}

	if (entry.type === 'enum') {
		if (!isEmpty && entry.values?.includes(value)) {
			return value;
		}
		warn(
			`Ignoring invalid value "${value}" for visit attribute "${entry.attr}". Expected one of: ${entry.values?.join(', ') ?? 'none'}.`
		);
		return IGNORE;
	}

	if (isEmpty) {
		return null;
	}

	if (entry.type === 'string|false' && value === 'false') {
		return false;
	}

	return value;
}

function applyPatch(visit: Visit, patch: Map<string, unknown>) {
	for (const [path, value] of patch) {
		setPath(visit, path, value === null ? undefined : value);
	}
}

function setPath(target: object, path: string, value: unknown) {
	const segments = path.split('.');
	const key = segments.pop();
	if (!key) return;

	let parent: Record<string, unknown> = target as Record<string, unknown>;
	for (const segment of segments) {
		const next = parent[segment];
		if (!next || typeof next !== 'object') return;
		parent = next as Record<string, unknown>;
	}
	parent[key] = value;
}

function normalizeAttrName(attr: string) {
	return attr.toLowerCase();
}

function warn(message: string) {
	console.warn(`[swup] ${message}`);
}
