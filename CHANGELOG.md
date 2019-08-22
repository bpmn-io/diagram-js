# Changelog

All notable changes to [diagram-js](https://github.com/bpmn-io/diagram-js) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 5.0.2

_Republish of `v5.0.1`._

## 5.0.1

* `FIX`: do no allow create if no hover available ([`679ef351`](https://github.com/bpmn-io/diagram-js/commit/679ef351ceb215de30230fea81983fc5f8b66ba0))
* `FIX`: relayout loops if necessary ([`3a63db0d`](https://github.com/bpmn-io/diagram-js/commit/3a63db0dded35167c55e0cf9d1f0a295c3d3216b))
* `FIX`: set create target on hover events ([`d31bd00b`](https://github.com/bpmn-io/diagram-js/commit/d31bd00b2a96bcae3de1f91c8733a038f37c2d88))
* `CHORE`: make it easier to override palette container ([`f765c81a`](https://github.com/bpmn-io/diagram-js/commit/f765c81a1d6d9e0983cb4b22a4de723b386df640))

## 5.0.0

* `FEAT`: add ability to create multiple elements ([`8d7d1d9c`](https://github.com/bpmn-io/diagram-js/pull/390/commits/8d7d1d9c69304ce8b99ed3de2f4d1ef1698c0958))
* `FEAT`: add `createElementsBehavior` hint to prevent behavior on creating elements ([`1ef5b3499`](https://github.com/bpmn-io/diagram-js/pull/390/commits/1ef5b3499858f1dc7a2fb5a7d9a5b2b8c474964b))
* `FEAT`: add ability to provide custom hit boxes ([#371](https://github.com/bpmn-io/diagram-js/pull/371))

### Breaking Changes

Copy and paste as well as create got completely reworked:

* `Create#start`: third argument is context, if you want to specify `source` do `{ source: source }`
* `CopyPaste`: `elements.copied`, `element.copy`, `elements.copy`, `element.paste`, `elements.paste` removed in favor of `copyPaste.canCopyElements`, `copyPaste.copyElement`, `copyPaste.elementsCopied`, `copyPaste.pasteElement`, `copyPaste.pasteElements`
* To prevent additional behavior on create after paste you should check for the `createElementsBehavior=false` hint
* `Modeling#pasteElements` removed in favor of `Modeling#createElements`
* `MouseTracking` removed in favor of `Mouse`

## 4.0.3

* `FIX`: compensate for missing `element.out` event ([#391](https://github.com/bpmn-io/diagram-js/pull/391))

## 4.0.2

* `FIX`: do not show connect feedback on bendpoint moving ([#382](https://github.com/bpmn-io/diagram-js/issues/382))
* `FIX`: correct graphics update regression ([#385](https://github.com/bpmn-io/diagram-js/pull/385)

## 4.0.1

* `FIX`: prevent unnecessary graphics updates ([`ff52b052`](https://github.com/bpmn-io/diagram-js/commit/ff52b05273068ba6c688eba4f3334eb4fd26a838))
* `FIX`: correct inverse space tool preview ([`94644d72`](https://github.com/bpmn-io/diagram-js/commit/94644d72085f3a4012c70f6e5ec08d7781e741ac))

## 4.0.0

* `FEAT`: add grid snapping ([#319](https://github.com/bpmn-io/diagram-js/pull/319))
* `FEAT`: add support for frame elements ([#321](https://github.com/bpmn-io/diagram-js/pull/321))
* `FEAT`: show connection markers in drag preview ([#328](https://github.com/bpmn-io/diagram-js/pull/328))
* `FEAT`: support connection previews ([#326](https://github.com/bpmn-io/diagram-js/pull/326))
* `FEAT`: do not move if no delta ([`c0c2b4f3`](https://github.com/bpmn-io/diagram-js/commit/c0c2b4f3851208eb5fee156a9d7afcbd25cc296e))
* `FEAT`: do not resize if bounds have not changed ([`e5cdb15a`](https://github.com/bpmn-io/diagram-js/commit/e5cdb15ad3a157bc8090f64f25c197a45adfd4be))
* `FEAT`: snap during resize ([#344](https://github.com/bpmn-io/diagram-js/pull/344))
* `FEAT`: activate hand tool on `SPACE` ([`e7217b95`](https://github.com/bpmn-io/diagram-js/commit/e7217b95c6ca2040dba09a9919eccc533862bc81))
* `FEAT`: allow parallel move on larger connection areas ([#350](https://github.com/bpmn-io/diagram-js/pull/350))
* `FEAT`: make hosts sticky for valid attachers ([#368](https://github.com/bpmn-io/diagram-js/pull/368))
* `FEAT`: improve dragger text styles ([#374](https://github.com/bpmn-io/diagram-js/pull/374))
* `FEAT`: allow custom snap implementations to snap an element top, right, bottom and left
* `CHORE`: add reusable escape util ([`0e520343`](https://github.com/bpmn-io/diagram-js/commit/0e520343a7ed100d9d9ab66884798742ff8732c0))
* `FIX`: prevent HTML injection in search component ([#362](https://github.com/bpmn-io/diagram-js/pull/362))

### Breaking Changes

* When displaying a connection preview, `Layouter` will receive connection without waypoints, source, target and with only `{ source, target }` hints. Make sure it handles such case ([#326](https://github.com/bpmn-io/diagram-js/pull/326)).

## 3.3.1

* `FIX`: prevent HTML injection in search component ([#362](https://github.com/bpmn-io/diagram-js/pull/362))

## 2.6.2

* `FIX`: prevent HTML injection in search component ([#362](https://github.com/bpmn-io/diagram-js/pull/362))

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
