# Changelog

<!-- ## [Unreleased] -->

## [4.3.3] - 2023-08-21

- Restore history index on reload

## [4.3.2] - 2023-08-20

- Update history entry on links to the current page

## [4.3.1] - 2023-08-17

- Improve scroll restoration on history visits

## [4.3.0] - 2023-08-16

- Persist elements across page loads using `data-swup-persist`
- Add `visit.cache` key to control cache behavior
- Enforce parameter and return types of hook handlers

## [4.2.0] - 2023-08-09

- Add option `linkToSelf` to control behavior for links to the current page
- Don't create history records for repeated visits to the current page
- Allow updating `visit.to.hash` and `visit.scroll.target` separately

## [4.1.0] - 2023-07-29

- Prevent unintentional cache mutation
- Use recommended order for package.json exports
- Infer element type from delegate selector

## [4.0.1] - 2023-07-28

- Export additional types to allow augmentation from plugins

## [4.0.0] - 2023-07-26

See the [release notes](https://swup.js.org/announcements/swup-4/) and
[upgrade guide](https://swup.js.org/getting-started/upgrading/) for details.

### Features

- Built-in scroll support
- New hook system for customizing the page load lifecycle
- Context object for controlling the transition process
- Animation scope: add animation classes to html element or to containers
- Easier customization of official themes
- Allow pruning cache entries

### Breaking changes

- Hooks replace events: `swup.hooks.on()`
- Use the `visit` argument in hooks instead of `swup.transition`
- Container selectors now only match one single element per selector
- Custom animation attribute renamed to `data-swup-animation`
- Swup no longer adds `data-swup` attributes to containers
- Navigation method renamed: `swup.navigate()`
- Simplified cache API: `cache.set()`
- Support for custom payload formats was dropped

## [3.1.1] - 2023-06-23

- Accept `#top` as special scroll target

## [3.1.0] - 2023-06-13

- Allow replacing the current history entry instead of pushing to it

## [3.0.8] - 2023-06-04

- Create smaller bundle for modern browsers
- Make warning about missing transitions less strict

## [3.0.7] - 2023-05-26

- Update event delegation library
- Fix edge case in detecting transition events
- Improve selection of scroll anchor targets

## [3.0.6] - 2023-04-06

- Fix `exports` field in package.json
- Fully qualify imports to support TypeScript `moduleResolution: node16`
- Switch to Vitest for unit tests

## [3.0.5] - 2023-03-02

- Ensure correct `Referer` request header

## [3.0.4] - 2023-01-29

- Clarify/improve event typings for Swup event handlers

## [3.0.3] - 2023-01-27

- Use shared browserslist config

## [3.0.2] - 2023-01-20

- Make sure ignoreVisit option is called when visiting pages programmatically

## [3.0.1] - 2023-01-20

- Fix: remove origin from ignoreVisit parameter

## [3.0.0] - 2023-01-19

- Support CSS animations and keyframes
- Allow ignoring visits via callback function
- Rewritten in TypeScript
- Export typings and native ESM modules
- Smaller bundle size for modern browsers: 4.5 kB
- Improved test coverage

### Breaking changes

See [upgrade instructions](https://swup.js.org/getting-started/upgrading-v3/) for details.

- Swup will now wait for the longest transitioned property
- Swup will no longer add `to-*` classes for the next URL
- UMD and CDN bundle names have changed
- Import paths for helpers have changed

## [2.0.19] - 2022-08-23

- Gracefully handle missing document title
- Disable caching of initial page to avoid caching modified DOM
- Force-reload if next page has no swup containers
- Remove all reliance on global window.swup instance

## [2.0.18] - 2022-08-09

- Fix buggy behavior when navigating rapidly between pages

## [2.0.17] - 2022-08-01

- Gracefully handle missing transitions on container
- Warn about missing container
- Scope transition selector to body
- Normalize cache paths

## [2.0.16] - 2022-06-30

- Improve handling of scroll anchors with special characters (@knokmki612)

## [2.0.15] - 2022-06-14

- Update dependencies (@fregante)
- Improve test coverage (@daun)

## [2.0.14] - 2020-12-27

- Update readme

## [2.0.13] - 2020-12-06

- Update readme

## [2.0.12] - 2020-11-29

- Fix bug where animateHistoryBrowsing option was ignored for OUT animations

[Unreleased]: https://github.com/swup/swup/compare/4.3.3...HEAD

[4.3.3]: https://github.com/swup/swup/releases/tag/4.3.3
[4.3.2]: https://github.com/swup/swup/releases/tag/4.3.2
[4.3.1]: https://github.com/swup/swup/releases/tag/4.3.1
[4.3.0]: https://github.com/swup/swup/releases/tag/4.3.0
[4.2.0]: https://github.com/swup/swup/releases/tag/4.2.0
[4.1.0]: https://github.com/swup/swup/releases/tag/4.1.0
[4.0.1]: https://github.com/swup/swup/releases/tag/4.0.1
[4.0.0]: https://github.com/swup/swup/releases/tag/4.0.0
[3.1.1]: https://github.com/swup/swup/releases/tag/3.1.1
[3.1.0]: https://github.com/swup/swup/releases/tag/3.1.0
[3.0.8]: https://github.com/swup/swup/releases/tag/3.0.8
[3.0.7]: https://github.com/swup/swup/releases/tag/3.0.7
[3.0.6]: https://github.com/swup/swup/releases/tag/3.0.6
[3.0.5]: https://github.com/swup/swup/releases/tag/3.0.5
[3.0.4]: https://github.com/swup/swup/releases/tag/3.0.4
[3.0.3]: https://github.com/swup/swup/releases/tag/3.0.3
[3.0.2]: https://github.com/swup/swup/releases/tag/3.0.2
[3.0.1]: https://github.com/swup/swup/releases/tag/3.0.1
[3.0.0]: https://github.com/swup/swup/releases/tag/3.0.0
[2.0.19]: https://github.com/swup/swup/releases/tag/2.0.19
[2.0.18]: https://github.com/swup/swup/releases/tag/2.0.18
[2.0.17]: https://github.com/swup/swup/releases/tag/2.0.17
[2.0.16]: https://github.com/swup/swup/releases/tag/2.0.16
[2.0.15]: https://github.com/swup/swup/releases/tag/2.0.15
[2.0.14]: https://github.com/swup/swup/releases/tag/2.0.14
[2.0.13]: https://github.com/swup/swup/releases/tag/2.0.13
[2.0.12]: https://github.com/swup/swup/releases/tag/2.0.12
