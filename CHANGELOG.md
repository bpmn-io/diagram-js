# Changelog

All notable changes to [diagram-js](https://github.com/bpmn-io/diagram-js) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 3.3.0

* `FEAT`: add basic grid snapping ([`f987bafe`](https://github.com/bpmn-io/diagram-js/commit/f987bafe215b75c9f47806bc8daaf16d2ba3a383))
* `FEAT`: layout connections on start/end reconnection ([`f7cc7a8f`](https://github.com/bpmn-io/diagram-js/commit/f7cc7a8f29c9842b3c2ba1f29d491767579d5267))
* `FIX`: use reference point when resizing ([`95bef2f6`](https://github.com/bpmn-io/diagram-js/commit/95bef2f6253a96ee20bb34384a071d0d28cfa29f))

## 3.2.0

* `FEAT`: trigger layout after connection reconnect ([#317](https://github.com/bpmn-io/diagram-js/pull/317))

## 3.1.3

* `FIX`: bump `tiny-svg` dependency to workaround MS Edge translate bug ([`657da2c3`](https://github.com/bpmn-io/diagram-js/commit/657da2c3f5540decf7bdf49029ecdbf1009c910c))

## 3.1.2

_Reverts changes in `v3.1.1`, as they were unnecessary._

## 3.1.1

* `FIX`: use correct reference argument for DOM related insert operations ([`47ca05ca`](https://github.com/bpmn-io/diagram-js/commit/47ca05ca075fb384748f8ff59a1295a7e2a99c28))

## 3.1.0

* `FIX`: don't swallow event listeners on `EventBus#only` ([#293](https://github.com/bpmn-io/diagram-js/issues/293))
* `CHORE`: rework `EventBus` internals, fixing various issues ([#308](https://github.com/bpmn-io/diagram-js/pull/308))

## 3.0.2

* `FIX`: make main export an ES module

## 3.0.1

* `FIX`: correct IE11 delete key binding ([`d529a676`](https://github.com/bpmn-io/diagram-js/commit/d529a6768470919abbd2567a8387955c9c8c5400))

## 3.0.0

* `FEAT`: make `ContextPad` accessible and scaling configurable ([#282](https://github.com/bpmn-io/diagram-js/pull/282))
* `FEAT`: make `PopupMenu` accessible and scaling configurable ([#284](https://github.com/bpmn-io/diagram-js/pull/284))
* `FEAT`: allow `Keyboard` listener overrides using priorities ([#226](https://github.com/bpmn-io/diagram-js/issues/226))
* `FEAT`: add ability to move selected elements with keyboard arrows ([`9e62bdd`](https://github.com/bpmn-io/diagram-js/commit/9e62bdd0823ee64ca6da2548cc10667b9a02dff0))
* `FEAT`: require `Ctrl/Cmd` modififer to move canvas via keyboard arrows ([`571efb9`](https://github.com/bpmn-io/diagram-js/commit/571efb914466ce00f357e308ba6238def1c7d8b6))
* `FEAT`: make `KeyboardMove` and `KeyboardMoveSelection` speed configurable
* `FEAT`: speed up moving elements / canvas using keyboard errors if `SHIFT` modifier is pressed
* `FEAT`: add `editorAction.init` event to register editor actions ([`a9089ad`](https://github.com/bpmn-io/diagram-js/commit/a9089ade487ff4185ece6fd8c68856b103345b3b))
* `FEAT`: only bind `Keyboard` shortcuts for existing editor actions ([`aa308fd`](https://github.com/bpmn-io/diagram-js/commit/aa308fd46f4b7958999bf44ca8bb3ab347723990))
* `FEAT`: rely on rules during `GlobalConnect` start ([`1efb277`](https://github.com/bpmn-io/diagram-js/commit/1efb277536fa7ec8be574746326c15cb1bfa507a))
* `FEAT`: expose `KeyboardEvent` to keyboard listeners instead of `(keyCode, event)` ([`94b5e26`](https://github.com/bpmn-io/diagram-js/commit/94b5e262d0db3ef3a8f250e3d39196cc6303a5cb))
* `FEAT`: automatically resize parent elements when children are expanded or replaced ([#287](https://github.com/bpmn-io/diagram-js/issues/287))
* `CHORE`: drop implicit feature dependencies in `EditorActions` ([`a9089ad`](https://github.com/bpmn-io/diagram-js/commit/a9089ade487ff4185ece6fd8c68856b103345b3b))

### Breaking Changes

* `GlobalConnect#registerProvider` got removed without replacement. Implement a `connection.start` rule to control whether it is allowed to start connection with `GlobalConnect` ([`1efb277`](https://github.com/bpmn-io/diagram-js/commit/1efb277536fa7ec8be574746326c15cb1bfa507a))
* The `Keyboard` now passes the `KeyboardEvent` to listeners as the only argument rather than `(keyCode, event)` ([`94b5e26`](https://github.com/bpmn-io/diagram-js/commit/94b5e262d0db3ef3a8f250e3d39196cc6303a5cb))
* Removed the `listeners` property from `Keyboard` lifecycle events ([`4d72e38`](https://github.com/bpmn-io/diagram-js/commit/4d72e386e2b734edc0fb2d77907b0e3ab6efead6))
* Moving the canvas via arrow keys now requires `Ctrl/Cmd` modifiers to be pressed; without the modifiers selected elements will be moved, if the `KeyboardMoveSelection` feature is provided ([`571efb9`](https://github.com/bpmn-io/diagram-js/commit/571efb914466ce00f357e308ba6238def1c7d8b6))
* `EditorActions` does not implicitly pull in feature dependencies anymore, ensure you include all desired features with your editor ([`a9089ad`](https://github.com/bpmn-io/diagram-js/commit/a9089ade487ff4185ece6fd8c68856b103345b3b))

## 2.6.1

* `FIX`: ignore vertical padding when layouting text with `middle` alignment

## 2.6.0

* `CHORE`: normalize drag coordinates to full pixel coordinates ([#271](https://github.com/bpmn-io/diagram-js/issues/271))

## 2.5.1

* `FIX`: circumvent IE 9 viewer bug ([`e1f3c65c`](https://github.com/bpmn-io/diagram-js/commit/e1f3c65cb413601427615d0e292ce291dcaea9de))

## 2.5.0

* `FEAT`: extend manhattan layout helper to support explicit `trbl` direction and layout U-turns, if needed ([`fd4c6028`](https://github.com/bpmn-io/diagram-js/commit/fd4c6028921f67bc73a840f0b19ad59c356a5dae))

## 2.4.1

* `FIX`: ensure all labels / attachers are moved before triggering connection layout
* `CHORE`: move attachers / labels along with move closure ([`16882649`](https://github.com/bpmn-io/diagram-js/commit/1688264959d272fb26d13214439d491c09a01f44))

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

* `FEAT`: refactor popup menu to allow multiple providers and simplify API ([`b1852e1d`](https://github.com/bpmn-io/diagram-js/pull/254/commits/b1852e1d71f67bd36ae1eb02748d2d0cbf124625))

### Breaking Changes

* The `PopupMenu` API got rewritten, cf. [`b1852e1d`](https://github.com/bpmn-io/diagram-js/pull/254/commits/b1852e1d71f67bd36ae1eb02748d2d0cbf124625)

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

* `CHORE`: convert code base to ES modules ([`e26b034`](https://github.com/bpmn-io/diagram-js/commit/e26b034bb6d60a8e0e3a9669d111124cb189a9b3))

### Breaking Changes

* You must now configure a module transpiler such as Babel or Webpack to handle ES module imports and exports.

## 0.31.0

* `FEAT`: remove `EventBus.Event` in favor of `EventBus#createEvent` API ([`91899cf6`](https://github.com/bpmn-io/diagram-js/commit/91899cf6d2e9100c712aa191cf0d3829335cfeb3))

### Breaking Changes

* Use `EventBus#createEvent` to instantiate events

## 0.30.0

* `CHORE`: bump [tiny-svg](https://github.com/bpmn-io/tiny-svg) version

## ...

Check `git log` for earlier history.
