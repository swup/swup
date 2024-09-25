# Changelog

## [4.8.0] - 2024-09-25

- Add `hooks` option to allow registering all hooks at once
- Add `visit.meta` key for custom data

## [4.7.0] - 2024-07-18

- Inherit `data-swup-*` attributes from parent elements
- Store current location as object at `swup.location`
- Deprecate `swup.currentPageUrl` in favor of `swup.location.url`
- Make previous page's hash available at `visit.from.hash`

## [4.6.1] - 2024-03-26

- Reduce bundle size by eliminating unused code paths

## [4.6.0] - 2024-02-09

- Provide access to the parsed document through `visit.to.document`

## [4.5.2] - 2024-01-27

- Fix reflow helper being optimized away during build step

## [4.5.1] - 2024-01-08

- Wait with transition class mutations when pausing before `content:replace`
- Ignore errors in user hooks

## [4.5.0] - 2023-12-01

- Support View Transitions API in new native mode
- Handle rapid link clicks to achieve smooth transitions
- Abort superseded visits with new `visit:abort` hook

## [4.4.4] - 2023-11-17

- Dispatch DOM event `swup:any` every time a hook is run
- Allow listening to DOM events from the `window`
- Improve working with DOM events in TypeScript

## [4.4.3] - 2023-11-16

- Improve compatibility with older Safari versions

## [4.4.2] - 2023-09-28

- Export types for hook handlers and return values

## [4.4.1] - 2023-09-25

- Fix multiple rapid clicks on links

## [4.4.0] - 2023-09-19

- Enable experimental View Transition support
- Extend test coverage to all major browsers
- Add request timeout option

## [4.3.4] - 2023-08-24

- Add unique id to visit object

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

## [2.0.11] - 2020-07-09

- Update readme

## [2.0.10] - 2020-06-07

- Test autopublish feature

## [2.0.9] - 2020-06-07

- Ensure removal of popstate handler on destroy
- Implement end-to-end tests

## 2.0.8 - 2019-11-01

- Fix issue where `body` text is interpreted as tag

## 2.0.7 - 2019-09-23

- Update readme

## 2.0.6 - 2019-09-23

- Add funding information

## 2.0.5 - 2019-07-14

- Restore IE10 support
- Fix build script error

## 2.0.4 - 2019-05-30

- Update readme

## 2.0.3 - 2019-05-30

- Fix import filenames

## 2.0.2 - 2019-05-26

- Update readme

## 2.0.1 - 2019-05-26

- Update readme

## 2.0.0 - 2019-05-26

- Create plugin system to slim down core library
- Extract previous core functionality into plugins
- Simplify support check and make it required
- Allow setting custom request headers
- Rename selector option to containers
- Restructure project repository

## 1.9.0 - 2019-02-03

- Return promise when preloading pages

## 1.8.0 - 2019-02-03

- Ignore clicks when special key pressed

## 1.7.0 - 2018-10-28

- Implement event handler system

## 1.6.0 - 2018-10-28

- Allow setting custom transition via data attribute

## 1.5.0 - 2018-10-25

- Trigger events for animation start

## 1.4.0 - 2018-10-12

- Display final url after redirects

## 1.3.0 - 2018-10-08

- Enable animated history visits

## 1.2.0 - 2018-09-23

- Change default link selector and animation class

## 1.1.0 - 2018-09-14

- Improve server error handling

## 1.0.4 - 2018-09-07

- Update readme

## 1.0.3 - 2018-09-07

- Update readme

## 1.0.2 - 2018-09-04

- Improve IE/Edge compatibility

## 1.0.1 - 2018-08-26

- Remove manual browser detection

## 1.0.0 - 2018-08-26

- Initial release

[4.8.0]: https://github.com/swup/swup/releases/tag/4.8.0
[4.7.0]: https://github.com/swup/swup/releases/tag/4.7.0
[4.6.1]: https://github.com/swup/swup/releases/tag/4.6.1
[4.6.0]: https://github.com/swup/swup/releases/tag/4.6.0
[4.5.2]: https://github.com/swup/swup/releases/tag/4.5.2
[4.5.1]: https://github.com/swup/swup/releases/tag/4.5.1
[4.5.0]: https://github.com/swup/swup/releases/tag/4.5.0
[4.4.4]: https://github.com/swup/swup/releases/tag/4.4.4
[4.4.3]: https://github.com/swup/swup/releases/tag/4.4.3
[4.4.2]: https://github.com/swup/swup/releases/tag/4.4.3
[4.4.1]: https://github.com/swup/swup/releases/tag/4.4.1
[4.4.0]: https://github.com/swup/swup/releases/tag/4.4.0
[4.3.4]: https://github.com/swup/swup/releases/tag/4.3.4
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
[2.0.11]: https://github.com/swup/swup/releases/tag/2.0.11
[2.0.10]: https://github.com/swup/swup/releases/tag/2.0.10
[2.0.9]: https://github.com/swup/swup/releases/tag/2.0.9
