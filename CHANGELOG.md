# Changelog

All notable changes to [diagram-js](https://github.com/bpmn-io/diagram-js) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 2.4.0

* `FEAT`: add ability to remove multiple events via `EventBus#off`

## 2.3.0

* `FEAT`: hide palette toggle in expanded state (a none-feature, technically) ([#257](https://github.com/bpmn-io/diagram-js/issues/257))
* `FIX`: take top/bottom padding into account when rendering text ([#259](https://github.com/bpmn-io/diagram-js/issues/259))
* `FIX`: don't throw error on out-of-canvas lasso tool release

## 2.2.0

* `FEAT`: support `lineHeight` in text render util ([#256](https://github.com/bpmn-io/diagram-js/pull/256))

## 2.1.1

* `FIX`: correct code snippet to ES5

## 2.1.0

* `FEAT`: add support for multiple labels ([#202](https://github.com/bpmn-io/diagram-js/issues/202))
* `FEAT`: allow multiple classes to be passed to popup menu entries

## 2.0.0

### Breaking Changes

* `FEAT`: refactor popup menu to allow multiple providers and simplify API ([`b1852e1d`](https://github.com/bpmn-io/diagram-js/pull/254/commits/b1852e1d71f67bd36ae1eb02748d2d0cbf124625))

## 1.5.0

_This release accidently introduced backwards incompatible changes. Unpublished; Use `v2.0.0` instead._

## 1.4.0

* `CHORE`: bump object-refs version

## 1.3.1

* `FIX`: correct side-effects config to not include `*.css` files

## 1.3.0

* `FEAT`: emit popup menu life-cycle events
* `FIX`: prevent default click action on dragend, if `trapClick: true` is specified

## 1.2.1

* `FIX`: escape ids in CSS selectors

## 1.2.0

* `DOCS`: migrate example to ES modules

## 1.1.0

* `CHORE`: update utility toolbelt

## 1.0.0

### Breaking Changes

* `CHORE`: convert code base to ES modules. You must now configure a module transpiler such as Babel or Webpack to handle ES module imports and exports. ([`e26b034`](https://github.com/bpmn-io/diagram-js/commit/e26b034bb6d60a8e0e3a9669d111124cb189a9b3))

## 0.31.0

### Breaking Changes

* `FEAT`: remove `EventBus.Event` in favor of `EventBus#createEvent` API ([`91899cf6`](https://github.com/bpmn-io/diagram-js/commit/91899cf6d2e9100c712aa191cf0d3829335cfeb3))

## 0.30.0

* `CHORE`: bump [tiny-svg](https://github.com/bpmn-io/tiny-svg) version

## ...

Check `git log` for earlier history.
