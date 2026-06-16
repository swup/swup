# Design: ancestor-resolved visit attributes

Status: **planned** (spec frozen, not yet implemented)
Audience: implementer handoff

## Goal

Let any `data-swup-*` attribute on the clicked link **or any of its ancestors**
(closest wins) flow into the `Visit` object — the same surface that swup
`options` already feed into a visit. Authors set behavior once on a region
(e.g. `<html>` or a sidebar `<div>`) instead of repeating it on every link.

Example:

```html
<div data-swup-history-action="replace" data-swup-cache-write="false">
  <a href="/a">a</a>   <!-- both inherit replace + no-cache-write -->
  <a href="/b" data-swup-cache-write="true">b</a> <!-- closest wins: cache-write=true -->
</div>
```

## Current state (baseline)

- `Visit` is constructed in `src/modules/Visit.ts`; defaults derive from
  `swup.options`.
- Visit is created in `Swup.createVisit()` (`src/Swup.ts`) and navigation runs
  via `src/modules/navigate.ts`.
- Two attributes are already read ad-hoc in `navigate.ts` via
  `getContextualAttr(el, attr)` (= `el.closest('[attr]')`):
  - `data-swup-history` → `visit.history.action`
  - `data-swup-animation` → `visit.animation.name`
- `getContextualAttr` (`src/utils/index.ts`) is also used by the default
  `ignoreVisit` for `data-no-swup`. **Keep it** — only the two ad-hoc visit
  extractions get removed.

This feature generalizes that pattern into a schema-driven resolver.

---

## Decision log (frozen)

### 1. Naming convention — Hybrid
Generic dot-path mapping **plus** a curated alias table, resolved as a
**single normalized pool**.

- Generic: `data-swup-<seg>-<seg>` → nested visit path, value coerced.
  - `data-swup-history-action="replace"` → `visit.history.action = 'replace'`
  - `data-swup-cache-read="false"`       → `visit.cache.read = false`
  - `data-swup-animation-name="fade"`    → `visit.animation.name = 'fade'`
- Aliases normalize to their canonical path **before** proximity resolution, so
  alias and canonical compete in one coherent ordering (no dual systems).

### 2. Aliases (v1) — legacy only
| alias | canonical path |
|---|---|
| `data-swup-history` | `history.action` |
| `data-swup-animation` | `animation.name` |

No general negation grammar (`data-swup-no-*` / `data-no-swup-*`). Just these
two, for backward compat. `data-no-swup` (ignore-visit) is unrelated and stays.

### 3. Precedence (low → high)
```
visit defaults
  < ancestor attrs (closest ancestor beats farther ancestor)
    < explicit navigate() options
      < hook mutations (link:click, visit:start, …)
```
- Explicit `navigate({ history: 'replace' })` always beats data attributes.
- On a **single node** carrying both canonical and alias for the same path,
  **canonical wins**.
- Hooks fire after resolution and are the final word.

### 4. Coercion — schema-typed
Each writeable path declares a type; coercion is deterministic per field
(not value-shape driven). **No `JSON.parse` default** (bare strings like `fade`
aren't valid JSON; value-shape coercion is ambiguous, e.g. `"007"`).

- `boolean`: only the string `"false"` → `false`; empty/present/`"true"`/
  anything else → `true`. (`data-swup-cache-read="0"` → `true`, documented gotcha.)
- `enum`: validate against declared `values`; invalid → **ignore + dev-warn**.
- `string` / `string|false`: `"false"` → `false` (for `string|false` only);
  otherwise the string.
- **Empty value (`""` / whitespace)** rules:
  - optional-string (`animation.name`, `scroll.target`) → `null`
    (explicit clear; counts as first-hit, stops the walk for that path).
  - `boolean` → `true` (flag semantics).
  - `enum` → ignore + dev-warn (can't null a required default like
    `history.action`).

> Typing note: `scroll.target` is `string | false | undefined`. Empty→`null`
> needs either widening the type to allow `null` or coercing `null`→`undefined`
> at apply time. Decide at implementation; prefer coerce-to-undefined to avoid
> touching the public `Visit` type.

### 5. Writeable fields (v1)
| path | canonical attr | type | popstate |
|---|---|---|---|
| `history.action` | `data-swup-history-action` | enum `push\|replace` | **excluded** |
| `animation.name` | `data-swup-animation-name` | string (optional) | yes |
| `animation.animate` | `data-swup-animation-animate` | boolean | yes |
| `animation.native` | `data-swup-animation-native` | boolean | yes |
| `cache.read` | `data-swup-cache-read` | boolean | yes |
| `cache.write` | `data-swup-cache-write` | boolean | yes |
| `scroll.reset` | `data-swup-scroll-reset` | boolean | yes |
| `scroll.target` | `data-swup-scroll-target` | string\|false | yes |

Always excluded: `id`, `state`, `from`, `to`, `trigger`, `containers`.
**No** `animation.scope` and **no** `meta` in v1.

### 6. Traversal — single ancestor walk
```
root = visit.trigger.el ?? document.documentElement
attrMap = build({ ...coreSchema, ...aliasTable })   // attrName -> {path,type,values?,popstate?}
patch = {}
for (node = root; node; node = node.parentElement) {  // close -> far
  for (attr of node.attributes) {
    const entry = attrMap[attr.name]
    if (!entry) continue
    if (entry.path in patch) continue                 // first-hit-per-path wins
    // same-node canonical-over-alias: process canonical attrs before aliases,
    // or skip alias if the canonical attr is present on the same node
    const value = coerce(attr.value, entry)
    if (value === IGNORE) continue                    // invalid enum / empty enum
    patch[entry.path] = value                          // may be null (clear)
  }
}
applyPatch(visit, patch)   // only where no explicit navigate() option set the field
```
Chosen over per-attribute `closest()` because the single normalized pool needs
true cross-spelling proximity (canonical vs legacy alias on the same path),
which `closest()` can't compare without extra distance math. One pass,
~handful of nodes — perf is a non-issue. XPath not needed.

### 7. popstate / trigger-less visits
`document.documentElement` fallback means global `<html data-swup-*>` applies to
**all** visits, **except**: schema entries flagged `popstate: false` are skipped
for popstate visits. Only `history.action` is so flagged (a global
`history-action="push"` would otherwise corrupt back/forward history).
Programmatic `navigate()` applies everything (the caller chose to navigate).

### 8. Timing — resolve for every visit, before hooks
Resolution runs inside `createVisit`, **before any hook fires**, for **every**
visit including **preload/speculative** ones.

Rationale (reversal of an earlier "navigation-only" stance): the preload plugin
fetches before any click and must honor `cache.read`/`cache.write` at fetch
time. No staleness problem: preload caches the *page*, not the *visit*; the
later click builds a **fresh** visit that re-resolves against current DOM.

### 9. Plugin extensibility — public register API
```ts
swup.defineVisitAttribute({
  path: 'scroll.target',
  attr: 'data-swup-scroll-target',
  type: 'string',          // 'boolean' | 'string' | 'string|false' | enum via `values`
  values?: ['push','replace'],   // for enum types
  alias?: 'data-swup-scroll',
  popstate?: true                // default true; false to exclude on popstate
})
```
Built-in schema is registered internally via the same mechanism. Clash on
`path` or `attr` → **override + dev-warn** (last registration wins). Plugins
register during mount (before first visit).

### 10. Errors
Never throw. Invalid/unsupported values → ignore + dev-warn (dev builds only).

---

## Implementation outline

**New file** `src/modules/visitAttributes.ts`:
- `VisitAttributeType = 'boolean' | 'string' | 'string|false' | 'enum'`
- `VisitAttributeSchemaEntry = { path; attr; type; values?; alias?; popstate? }`
- internal registry (`Map<attrName, entry>` + `Map<path, entry>`)
- `coerce(value: string, entry): unknown | IGNORE`
- `resolveVisitAttributes(visit, { popstate })` — the ancestor walk + applyPatch
- `defineVisitAttribute(entry)` — register/override + dev-warn on clash
- `registerCoreVisitAttributes()` — the v1 table above

**`src/Swup.ts`:**
- call `registerCoreVisitAttributes()` at init
- expose `swup.defineVisitAttribute = defineVisitAttribute`
- in `createVisit()`, after building defaults and **before** applying explicit
  options / firing hooks, call `resolveVisitAttributes(visit, { popstate })`
- ensure explicit `navigate()` options are layered **after** the patch so they win

**`src/modules/navigate.ts`:**
- delete the two ad-hoc `getContextualAttr(el, 'data-swup-history' | 'data-swup-animation')`
  extractions (now covered by the resolver + aliases)

**`src/utils/index.ts`:**
- keep `getContextualAttr` (still used by default `ignoreVisit` / `data-no-swup`)

## Tests to add
- closest-ancestor wins over farther ancestor (per path)
- canonical beats legacy alias on same node; alias still works alone
- explicit `navigate()` option beats any ancestor attr
- boolean coercion: `"false"`→false, present/empty/`"0"`→true
- enum invalid → ignored + visit keeps default; dev-warn emitted
- empty optional-string → null (clears farther ancestor); empty enum → ignored
- popstate visit ignores `data-swup-history-action` on `<html>` but honors
  `cache`/`scroll`/`animation`
- programmatic `navigate()` (no el) resolves from `<html>` incl. `history.action`
- preload visit resolves `cache.write` (fetch honors it)
- `defineVisitAttribute` override + dev-warn on clash; plugin-registered attr resolves

## Open (non-blocking) at implementation time
- `scroll.target` empty→null vs the `string|false|undefined` type (prefer
  coerce null→undefined; don't change public `Visit` type).
- plugin teardown: leave attrs registered on `swup.destroy()` (harmless) unless
  a reason emerges to unregister.
